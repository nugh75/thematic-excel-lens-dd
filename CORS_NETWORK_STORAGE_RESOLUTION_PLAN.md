# 🔧 Piano Risoluzione Problemi CORS, SRI, Network e Storage

## 📋 **Analisi Problemi Identificati**

### **Problema 1: Blocchi CORS (Cross-Origin Resource Sharing)**
- **Causa**: Server API non invia header `Access-Control-Allow-Origin` corretti
- **Impatto**: Blocco richieste da `https://anatema.ai4educ.org` a `http://localhost:3001`
- **Priorità**: 🔴 ALTA

### **Problema 2: Integrità Subresource (SRI) non corrispondente**
- **Causa**: Hash SRI di Cloudflare non corrisponde al contenuto effettivo
- **Impatto**: Script Cloudflare bloccato dal browser
- **Priorità**: 🟡 MEDIA

### **Problema 3: NetworkError - URL localhost in produzione**
- **Causa**: App in produzione cerca API su `localhost:3001` (non esistente)
- **Impatto**: Impossibilità di caricare progetti in produzione
- **Priorità**: 🔴 ALTA

### **Problema 4: QuotaExceededError - Storage Browser pieno**
- **Causa**: Accumulo eccessivo di dati nella coda offline
- **Impatto**: Impossibilità di salvare nuovi dati localmente
- **Priorità**: 🟠 MEDIA-ALTA

---

## 🎯 **Piano di Risoluzione Strutturato**

### **FASE 1: Risoluzione Immediata (Priority 1)**

#### **1.1 Configurazione Environment-Based API URLs**
```typescript
// src/config/api.ts
const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:3001',
    cors: true
  },
  production: {
    baseUrl: 'https://api.anatema.ai4educ.org', // o URL produzione reale
    cors: true
  },
  staging: {
    baseUrl: '/api', // Fallback relativo
    cors: false
  }
};

export const getApiConfig = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return API_CONFIG.development;
  }
  
  if (hostname.includes('ai4educ.org')) {
    return API_CONFIG.production;
  }
  
  return API_CONFIG.staging;
};
```

#### **1.2 Server CORS Configuration (api-server/)**
```javascript
// api-server/server.js
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://anatema.ai4educ.org',
    /^https:\/\/.*\.ai4educ\.org$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

#### **1.3 Storage Quota Management**
```typescript
// src/utils/storageManager.ts
export class StorageQuotaManager {
  private static QUOTA_WARNING_THRESHOLD = 0.8; // 80%
  private static QUOTA_CRITICAL_THRESHOLD = 0.95; // 95%

  static async checkQuota(): Promise<{usage: number, quota: number, percentage: number}> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? usage / quota : 0;
      
      return { usage, quota, percentage };
    }
    
    throw new Error('Storage estimation not supported');
  }

  static async handleQuotaExceeded(): Promise<void> {
    const quota = await this.checkQuota();
    
    if (quota.percentage > this.QUOTA_CRITICAL_THRESHOLD) {
      await this.emergencyCleanup();
    } else if (quota.percentage > this.QUOTA_WARNING_THRESHOLD) {
      await this.selectiveCleanup();
    }
  }

  private static async emergencyCleanup(): Promise<void> {
    // Clear non-essential data
    this.clearTemporaryData();
    this.truncateOfflineQueue(10); // Keep only last 10 operations
    this.clearOldCacheEntries();
  }

  private static async selectiveCleanup(): Promise<void> {
    // Clear only cache and old data
    this.clearTemporaryData();
    this.truncateOfflineQueue(50); // Keep last 50 operations
  }
}
```

### **FASE 2: Implementazione Robusta (Priority 2)**

#### **2.1 API Service con Retry e Fallback**
```typescript
// src/services/apiServiceRobust.ts
export class RobustApiService {
  private baseUrl: string;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.makeRequest<T>(endpoint, options);
        
        if (response.success || attempt === this.retryAttempts) {
          return response;
        }
        
      } catch (error) {
        if (attempt === this.retryAttempts) {
          return this.handleFinalError(error);
        }
        
        await this.delay(this.retryDelay * attempt);
      }
    }
    
    return { success: false, error: 'Max retries exceeded' };
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private handleFinalError(error: any): ApiResponse<any> {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    
    if (error.message.includes('CORS')) {
      return { success: false, error: 'CORS_ERROR' };
    }
    
    if (error.message.includes('Failed to fetch')) {
      return { success: false, error: 'NETWORK_ERROR' };
    }
    
    return { success: false, error: error.message };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### **2.2 Offline Queue con Compressione**
```typescript
// src/services/offlineQueueManager.ts
export class OfflineQueueManager {
  private static MAX_QUEUE_SIZE = 100;
  private static COMPRESSION_THRESHOLD = 50;

  static async addOperation(operation: OfflineOperation): Promise<void> {
    try {
      const queue = await this.getQueue();
      
      // Check quota before adding
      const quota = await StorageQuotaManager.checkQuota();
      if (quota.percentage > 0.9) {
        await StorageQuotaManager.handleQuotaExceeded();
      }
      
      queue.push(operation);
      
      // Compress if needed
      if (queue.length > this.COMPRESSION_THRESHOLD) {
        await this.compressQueue(queue);
      }
      
      await this.saveQueue(queue);
      
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        await this.handleQuotaExceeded();
        // Retry once
        await this.addOperation(operation);
      } else {
        throw error;
      }
    }
  }

  private static async compressQueue(queue: OfflineOperation[]): Promise<OfflineOperation[]> {
    // Remove duplicates and merge similar operations
    const compressed = queue.slice(-this.MAX_QUEUE_SIZE);
    return this.deduplicateOperations(compressed);
  }

  private static async handleQuotaExceeded(): Promise<void> {
    await StorageQuotaManager.emergencyCleanup();
    const queue = await this.getQueue();
    const truncated = queue.slice(-10); // Keep only last 10
    await this.saveQueue(truncated);
  }
}
```

### **FASE 3: Configurazione Produzione (Priority 3)**

#### **3.1 Environment Variables Setup**
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3001
VITE_ENVIRONMENT=development
VITE_ENABLE_CORS=true

# .env.production  
VITE_API_BASE_URL=https://api.anatema.ai4educ.org
VITE_ENVIRONMENT=production
VITE_ENABLE_CORS=true

# .env.staging
VITE_API_BASE_URL=/api
VITE_ENVIRONMENT=staging
VITE_ENABLE_CORS=false
```

#### **3.2 Vite Config per Proxy Development**
```typescript
// vite.config.ts
export default defineConfig({
  // ...existing config
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL),
    __ENVIRONMENT__: JSON.stringify(process.env.VITE_ENVIRONMENT)
  }
});
```

#### **3.3 Nginx Configuration per Produzione**
```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name anatema.ai4educ.org;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API Proxy
    location /api/ {
        proxy_pass http://api-server:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS Headers
        add_header Access-Control-Allow-Origin "https://anatema.ai4educ.org";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        add_header Access-Control-Allow-Credentials true;
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://anatema.ai4educ.org";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
    }
}
```

---

## 🚀 **Piano di Implementazione**

### **Settimana 1: Fixes Immediati**
- [ ] Implementare configurazione environment-based
- [ ] Aggiornare API service con retry logic
- [ ] Configurare CORS sul server
- [ ] Implementare storage quota management

### **Settimana 2: Robustezza**
- [ ] Implementare offline queue compresso
- [ ] Aggiungere error handling avanzato
- [ ] Testing cross-environment
- [ ] Monitoring e alerting

### **Settimana 3: Produzione**
- [ ] Setup environment variables
- [ ] Configurare proxy Nginx
- [ ] Deploy e testing produzione
- [ ] Ottimizzazione performance

---

## 📊 **Metriche di Successo**

### **KPI da Monitorare**
- [ ] Zero errori CORS in console
- [ ] API response rate > 95%
- [ ] Storage usage < 80%
- [ ] Offline queue size < 50 items
- [ ] Network error recovery < 3 sec

### **Testing Checklist**
- [ ] Test localhost development
- [ ] Test produzione cross-domain
- [ ] Test storage quota exceeded
- [ ] Test offline/online transitions
- [ ] Test API server down scenarios

---

## 🔧 **Tools e Utility**

### **Diagnostic Dashboard**
```typescript
// Componente per monitoraggio real-time
export const SystemHealthDashboard = () => {
  // Real-time monitoring di:
  // - CORS status
  // - API connectivity
  // - Storage usage
  // - Queue size
  // - Network quality
};
```

### **Error Recovery Actions**
```typescript
// Actions automatiche per recovery
export const ErrorRecoveryActions = {
  CORS_ERROR: () => switchToFallbackAPI(),
  NETWORK_ERROR: () => enableOfflineMode(),
  QUOTA_EXCEEDED: () => StorageQuotaManager.emergencyCleanup(),
  API_DOWN: () => showOfflineMessage()
};
```

---

*Piano creato: 25/06/2025*
*Priorità: ALTA - Risoluzione entro 3 settimane*
*Owner: Sistema di risoluzione automatica*
