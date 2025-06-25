import { getApiConfig, debugLog, ApiConfig } from '../config/api';
import { StorageQuotaManager, withQuotaHandling } from '../utils/storageQuotaManager';

/**
 * Tipologie di errori API
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  CORS_ERROR = 'CORS_ERROR', 
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  QUOTA_ERROR = 'QUOTA_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Risposta API standardizzata
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorType?: ApiErrorType;
  message?: string;
  status?: number;
}

/**
 * Opzioni per richieste API
 */
export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  skipRetry?: boolean;
  enableOfflineQueue?: boolean;
}

/**
 * Operazione offline per la coda
 */
export interface OfflineOperation {
  id: string;
  endpoint: string;
  options: ApiRequestOptions;
  timestamp: number;
  attempts: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Servizio API robusto con gestione errori, retry e fallback
 */
export class RobustApiService {
  private config: ApiConfig;
  private isOnline: boolean = navigator.onLine;
  private offlineQueue: OfflineOperation[] = [];
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(customConfig?: ApiConfig) {
    this.config = customConfig || getApiConfig();
    this.setupNetworkListeners();
    this.loadOfflineQueue();
  }

  /**
   * Setup listener per eventi di rete
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      debugLog('Network back online, processing offline queue');
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      debugLog('Network offline, requests will be queued');
    });
  }

  /**
   * Carica la coda offline dal localStorage
   */
  private async loadOfflineQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('offline-api-queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
        debugLog(`Loaded ${this.offlineQueue.length} operations from offline queue`);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
      this.offlineQueue = [];
    }
  }

  /**
   * Salva la coda offline nel localStorage
   */
  private async saveOfflineQueue(): Promise<void> {
    try {
      await withQuotaHandling(
        async () => {
          localStorage.setItem('offline-api-queue', JSON.stringify(this.offlineQueue));
        },
        async () => {
          // Fallback: mantieni solo operazioni ad alta priorità
          const highPriority = this.offlineQueue.filter(op => op.priority === 'high');
          localStorage.setItem('offline-api-queue', JSON.stringify(highPriority));
          this.offlineQueue = highPriority;
        }
      );
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  /**
   * Effettua una richiesta API con gestione completa degli errori
   */
  async request<T>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    
    // Se siamo offline e non è una richiesta critica, metti in coda
    if (!this.isOnline && options.enableOfflineQueue !== false) {
      await this.queueOfflineOperation(endpoint, options);
      return { 
        success: false, 
        error: 'Request queued for when online',
        errorType: ApiErrorType.NETWORK_ERROR
      };
    }

    const maxRetries = options.retries ?? this.config.retryAttempts;
    const timeout = options.timeout ?? this.config.timeout;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        debugLog(`Attempt ${attempt}/${maxRetries} for ${endpoint}`);
        
        const result = await this.makeRequest<T>(endpoint, options, timeout);
        
        if (result.success) {
          return result;
        }

        // Se è l'ultimo tentativo o errore non retriable
        if (attempt === maxRetries || !this.isRetriableError(result.errorType)) {
          return result;
        }

        // Attendi prima del prossimo tentativo (backoff esponenziale)
        const delay = this.calculateRetryDelay(attempt);
        await this.delay(delay);

      } catch (error) {
        debugLog(`Request attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          return this.handleError(error);
        }
        
        const delay = this.calculateRetryDelay(attempt);
        await this.delay(delay);
      }
    }

    return { 
      success: false, 
      error: 'Max retries exceeded', 
      errorType: ApiErrorType.UNKNOWN_ERROR 
    };
  }

  /**
   * Effettua la richiesta HTTP effettiva
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: ApiRequestOptions,
    timeout: number
  ): Promise<ApiResponse<T>> {
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        mode: this.config.corsEnabled ? 'cors' : 'same-origin',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          errorType: this.getErrorTypeFromStatus(response.status),
          status: response.status
        };
      }

      // Gestisci diversi tipi di risposta
      const contentType = response.headers.get('content-type');
      let data: T;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      return { 
        success: true, 
        data, 
        status: response.status 
      };

    } catch (error) {
      clearTimeout(timeoutId);
      return this.handleError(error);
    }
  }

  /**
   * Gestisce errori e li classifica
   */
  private handleError(error: any): ApiResponse<any> {
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        error: 'Request timeout', 
        errorType: ApiErrorType.TIMEOUT_ERROR 
      };
    }
    
    if (error.message?.includes('CORS')) {
      return { 
        success: false, 
        error: 'CORS policy error', 
        errorType: ApiErrorType.CORS_ERROR 
      };
    }
    
    if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
      return { 
        success: false, 
        error: 'Network connection error', 
        errorType: ApiErrorType.NETWORK_ERROR 
      };
    }

    if (error.name === 'QuotaExceededError') {
      return { 
        success: false, 
        error: 'Storage quota exceeded', 
        errorType: ApiErrorType.QUOTA_ERROR 
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred', 
      errorType: ApiErrorType.UNKNOWN_ERROR 
    };
  }

  /**
   * Determina il tipo di errore dal status HTTP
   */
  private getErrorTypeFromStatus(status: number): ApiErrorType {
    if (status >= 500) { return ApiErrorType.SERVER_ERROR; }
    if (status === 0) { return ApiErrorType.NETWORK_ERROR; }
    return ApiErrorType.UNKNOWN_ERROR;
  }

  /**
   * Verifica se un errore è retriable
   */
  private isRetriableError(errorType?: ApiErrorType): boolean {
    const retriableErrors = [
      ApiErrorType.NETWORK_ERROR,
      ApiErrorType.TIMEOUT_ERROR,
      ApiErrorType.SERVER_ERROR
    ];
    
    return errorType ? retriableErrors.includes(errorType) : false;
  }

  /**
   * Calcola il delay per retry con backoff esponenziale
   */
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = 1000; // 1 secondo
    const maxDelay = 10000; // 10 secondi
    const delay = baseDelay * Math.pow(2, attempt - 1);
    return Math.min(delay, maxDelay);
  }

  /**
   * Utility per delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Aggiunge operazione alla coda offline
   */
  private async queueOfflineOperation(
    endpoint: string, 
    options: ApiRequestOptions
  ): Promise<void> {
    const operation: OfflineOperation = {
      id: this.generateId(),
      endpoint,
      options,
      timestamp: Date.now(),
      attempts: 0,
      priority: this.determinePriority(endpoint, options)
    };

    this.offlineQueue.push(operation);
    await this.saveOfflineQueue();
    
    debugLog(`Queued offline operation: ${endpoint}`);
  }

  /**
   * Processa la coda delle operazioni offline
   */
  async processOfflineQueue(): Promise<void> {
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    debugLog(`Processing ${this.offlineQueue.length} offline operations`);
    
    // Ordina per priorità e timestamp
    this.offlineQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Priorità più alta prima
      }
      
      return a.timestamp - b.timestamp; // Più vecchio prima
    });

    const processed: string[] = [];
    
    for (const operation of this.offlineQueue) {
      try {
        operation.attempts++;
        
        const result = await this.makeRequest(
          operation.endpoint, 
          { ...operation.options, skipRetry: true },
          this.config.timeout
        );
        
        if (result.success) {
          processed.push(operation.id);
          debugLog(`Successfully processed offline operation: ${operation.endpoint}`);
        } else if (operation.attempts >= 3) {
          processed.push(operation.id);
          debugLog(`Giving up on offline operation after 3 attempts: ${operation.endpoint}`);
        }
        
      } catch (error) {
        debugLog(`Failed to process offline operation: ${operation.endpoint}`, error);
        
        if (operation.attempts >= 3) {
          processed.push(operation.id);
        }
      }
    }

    // Rimuovi operazioni processate
    this.offlineQueue = this.offlineQueue.filter(op => !processed.includes(op.id));
    await this.saveOfflineQueue();
    
    debugLog(`Processed ${processed.length} offline operations, ${this.offlineQueue.length} remaining`);
  }

  /**
   * Determina la priorità di un'operazione
   */
  private determinePriority(endpoint: string, options: ApiRequestOptions): 'high' | 'medium' | 'low' {
    // Operazioni critiche
    if (endpoint.includes('/auth') || endpoint.includes('/login')) {
      return 'high';
    }
    
    // Operazioni di scrittura
    if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE') {
      return 'medium';
    }
    
    // Operazioni di lettura
    return 'low';
  }

  /**
   * Genera ID univoco
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Metodi di convenienza per diversi tipi di richiesta
   */
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Getter per informazioni di stato
   */
  get isHealthy(): boolean {
    return this.isOnline;
  }

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  get environment(): string {
    return this.config.environment;
  }

  get pendingOperations(): number {
    return this.offlineQueue.length;
  }

  /**
   * Pulisce la coda offline
   */
  async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
    debugLog('Offline queue cleared');
  }

  /**
   * Aggiorna la configurazione
   */
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    debugLog('API configuration updated', this.config);
  }
}

// Istanza singleton del servizio API
export const robustApiService = new RobustApiService();

export default RobustApiService;
