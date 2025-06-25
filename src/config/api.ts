// API Configuration based on environment
export interface ApiConfig {
  baseUrl: string;
  environment: 'development' | 'production' | 'staging';
  corsEnabled: boolean;
  timeout: number;
  retryAttempts: number;
}

const API_CONFIGS: Record<string, ApiConfig> = {
  development: {
    baseUrl: 'http://localhost:3001',
    environment: 'development',
    corsEnabled: true,
    timeout: 10000,
    retryAttempts: 3
  },
  production: {
    baseUrl: 'https://api.anatema.ai4educ.org', // Sostituire con URL reale
    environment: 'production', 
    corsEnabled: true,
    timeout: 15000,
    retryAttempts: 3
  },
  staging: {
    baseUrl: '/api', // Fallback relativo
    environment: 'staging',
    corsEnabled: false,
    timeout: 10000,
    retryAttempts: 2
  }
};

/**
 * Determina la configurazione API basata sull'ambiente corrente
 */
export const getApiConfig = (): ApiConfig => {
  // Prova prima le variabili d'ambiente (se configurate)
  if (import.meta.env.VITE_API_BASE_URL) {
    return {
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      environment: (import.meta.env.VITE_ENVIRONMENT as any) || 'production',
      corsEnabled: import.meta.env.VITE_ENABLE_CORS === 'true',
      timeout: 15000,
      retryAttempts: 3
    };
  }

  // Fallback: determina dall'hostname
  const { hostname, protocol } = window.location;
  
  // Sviluppo locale
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return API_CONFIGS.development;
  }
  
  // Produzione
  if (hostname.includes('ai4educ.org')) {
    return API_CONFIGS.production;
  }
  
  // Staging o altro
  return API_CONFIGS.staging;
};

/**
 * Verifica se siamo in ambiente di sviluppo
 */
export const isDevelopment = (): boolean => {
  return (
    import.meta.env.DEV ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

/**
 * Utility per logging condizionale
 */
export const debugLog = (message: string, data?: any): void => {
  if (isDevelopment()) {
    console.log(`[API Debug] ${message}`, data || '');
  }
};

/**
 * Verifica se un URL è raggiungibile
 */
export const testUrlReachability = async (url: string, timeout = 5000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    debugLog(`URL ${url} not reachable:`, error);
    return false;
  }
};

/**
 * Seleziona automaticamente la migliore configurazione API
 */
export const selectBestApiConfig = async (): Promise<ApiConfig> => {
  const defaultConfig = getApiConfig();
  
  // Se è sviluppo, usa sempre localhost
  if (isDevelopment()) {
    return defaultConfig;
  }
  
  // Test di raggiungibilità per produzione
  const isReachable = await testUrlReachability(defaultConfig.baseUrl);
  
  if (isReachable) {
    return defaultConfig;
  }
  
  // Fallback a configurazione relativa
  debugLog('Primary API not reachable, falling back to relative paths');
  return API_CONFIGS.staging;
};

export default getApiConfig;
