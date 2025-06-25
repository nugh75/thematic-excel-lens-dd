import { useState, useEffect } from 'react';

interface ApiConfig {
  baseUrl: string;
  environment: 'development' | 'production' | 'staging';
  isLocal: boolean;
  corsEnabled: boolean;
}

interface NetworkStatus {
  isOnline: boolean;
  apiReachable: boolean;
  lastCheck: Date | null;
  latency: number | null;
}

export const useApiConfig = () => {
  const [config, setConfig] = useState<ApiConfig>(() => getApiConfig());
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    apiReachable: false,
    lastCheck: null,
    latency: null
  });

  // Determina configurazione API basata sull'ambiente
  function getApiConfig(): ApiConfig {
    const { hostname, protocol } = window.location;
    
    // Usa variabili d'ambiente se disponibili
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;
    const envEnvironment = import.meta.env.VITE_ENVIRONMENT;
    const envCorsEnabled = import.meta.env.VITE_ENABLE_CORS === 'true';
    
    if (envApiUrl && envEnvironment) {
      return {
        baseUrl: envApiUrl,
        environment: envEnvironment as 'development' | 'production' | 'staging',
        isLocal: hostname === 'localhost' || hostname === '127.0.0.1',
        corsEnabled: envCorsEnabled
      };
    }
    
    // Fallback alla logica precedente
    // Sviluppo locale
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return {
        baseUrl: 'http://localhost:3001',
        environment: 'development',
        isLocal: true,
        corsEnabled: true
      };
    }
    
    // Produzione
    if (hostname.includes('ai4educ.org')) {
      return {
        baseUrl: 'https://api-anatema.ai4educ.org',
        environment: 'production',
        isLocal: false,
        corsEnabled: true
      };
    }
    
    // Staging o altro
    return {
      baseUrl: '/api', // Fallback relativo
      environment: 'staging',
      isLocal: false,
      corsEnabled: false
    };
  }

  // Testa connessione API con timeout e retry
  const testApiConnection = async (retries = 1): Promise<boolean> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${config.baseUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: config.corsEnabled ? 'cors' : 'same-origin',
        });

        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;

        if (response.ok) {
          setNetworkStatus(prev => ({
            ...prev,
            apiReachable: true,
            lastCheck: new Date(),
            latency
          }));
          return true;
        }
      } catch (error) {
        console.warn(`API connection attempt ${attempt + 1} failed:`, error);
        
        if (attempt === retries - 1) {
          setNetworkStatus(prev => ({
            ...prev,
            apiReachable: false,
            lastCheck: new Date(),
            latency: null
          }));
        }
        
        // Attendi prima del prossimo tentativo
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    return false;
  };

  // Hook per fetch API con gestione errori avanzata
  const apiRequest = async <T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null; status: number }> => {
    
    const url = `${config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
        mode: config.corsEnabled ? 'cors' : 'same-origin',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          data: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        };
      }

      const data = await response.json();
      return { data, error: null, status: response.status };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { data: null, error: 'Request timeout', status: 408 };
        }
        
        if (error.message.includes('CORS')) {
          return { data: null, error: 'CORS error - Server not configured properly', status: 0 };
        }
        
        if (error.message.includes('Failed to fetch')) {
          return { data: null, error: 'Network error - Server unreachable', status: 0 };
        }
        
        return { data: null, error: error.message, status: 0 };
      }
      
      return { data: null, error: 'Unknown error occurred', status: 0 };
    }
  };

  // Effect per monitoraggio connessione
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: true }));
      testApiConnection(2); // Ritenta 2 volte quando torna online
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({ 
        ...prev, 
        isOnline: false, 
        apiReachable: false 
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test iniziale
    if (navigator.onLine) {
      testApiConnection(3);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [config.baseUrl]);

  // Retry automatico periodico se offline
  useEffect(() => {
    if (!networkStatus.apiReachable && networkStatus.isOnline) {
      const interval = setInterval(() => {
        testApiConnection(1);
      }, 30000); // Riprova ogni 30 secondi

      return () => clearInterval(interval);
    }
  }, [networkStatus.apiReachable, networkStatus.isOnline]);

  return {
    config,
    networkStatus,
    testApiConnection,
    apiRequest,
    isHealthy: networkStatus.isOnline && networkStatus.apiReachable
  };
};

// Utility per determinare se siamo in modalità sviluppo
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

// Utility per logging condizionale
export const debugLog = (message: string, data?: any): void => {
  if (isDevelopment()) {
    console.log(`[API Debug] ${message}`, data || '');
  }
};

export default useApiConfig;
