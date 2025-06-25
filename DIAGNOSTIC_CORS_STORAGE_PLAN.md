# 🔧 Piano Diagnostico e Risoluzione Problemi CORS/Storage/Sincronizzazione

## 🚨 **Problemi Identificati dai Log**

### 1. **Errori CORS (Cross-Origin Resource Sharing)**
```
Bloccata richiesta multiorigine (cross-origin): http://localhost:3001/api/projects
Motivo: richiesta CORS non riuscita. Codice di stato: (null)
```

### 2. **Errore Storage Quota Exceeded**
```
DOMException: The quota has been exceeded.
saveQueue → queueOperation → saveCurrentProject
```

### 3. **Network Error nelle API**
```
API Error (/api/projects): TypeError: NetworkError when attempting to fetch resource
Failed to get projects from server
```

### 4. **Problema Cloudflare Integrity Hash**
```
Nessuno degli hash "sha512" nell'attributo integrity corrisponde al contenuto
```

---

## 🔍 **Analisi Root Cause**

### **Problema 1: Server API non raggiungibile**
- L'app sta cercando di connettersi a `http://localhost:3001`
- Il server probabilmente non è avviato o non è configurato per CORS
- Dall'altro computer, `localhost:3001` non esiste

### **Problema 2: Storage Browser Pieno**
- Le operazioni offline hanno riempito il localStorage/IndexedDB
- Il browser ha raggiunto il limite di quota storage
- La coda di sincronizzazione non può salvare nuovi dati

### **Problema 3: Configurazione Produzione vs Sviluppo**
- L'app in produzione (`anatema.ai4educ.org`) cerca ancora localhost
- Manca configurazione per ambiente di produzione

---

## 🛠️ **Piano di Risoluzione**

### **FASE 1: Diagnosi Immediata**
- [ ] Verificare stato server API
- [ ] Controllare configurazione CORS
- [ ] Analizzare storage browser
- [ ] Verificare configurazione ambiente

### **FASE 2: Fix Storage/Offline**
- [ ] Implementare pulizia storage
- [ ] Aggiungere gestione quota limits
- [ ] Migliorare coda offline

### **FASE 3: Fix CORS/API**
- [ ] Configurare server per CORS
- [ ] Aggiungere fallback offline
- [ ] Implementare retry mechanism

### **FASE 4: Configurazione Ambiente**
- [ ] Separare config dev/prod
- [ ] Aggiungere environment detection
- [ ] Implementare graceful degradation

---

## 🔧 **Implementazione Soluzioni**

### **Soluzione 1: Storage Management**

#### A. Pulizia Storage Browser
```javascript
// Funzione per pulire storage browser
const clearBrowserStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
  if ('indexedDB' in window) {
    indexedDB.deleteDatabase('anatema-offline-queue');
  }
};
```

#### B. Gestione Quota Storage
```javascript
// Monitoraggio quota storage
const checkStorageQuota = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usagePercentage = (estimate.usage / estimate.quota) * 100;
    return { usage: estimate.usage, quota: estimate.quota, percentage: usagePercentage };
  }
  return null;
};
```

### **Soluzione 2: CORS e API Configuration**

#### A. Server CORS Configuration (api-server/server.js)
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://anatema.ai4educ.org',
    /^https:\/\/.*\.ai4educ\.org$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### B. Environment-based API URLs
```javascript
const API_CONFIG = {
  development: 'http://localhost:3001',
  production: 'https://api.anatema.ai4educ.org',
  fallback: '/api' // Relative path fallback
};

const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return API_CONFIG.development;
  }
  if (hostname.includes('ai4educ.org')) {
    return API_CONFIG.production;
  }
  return API_CONFIG.fallback;
};
```

### **Soluzione 3: Offline/Online Management**

#### A. Componente Storage Manager
```tsx
// Component per gestire storage e diagnostica
export const StorageManager = () => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearStorage = async () => {
    setIsClearing(true);
    try {
      await clearBrowserStorage();
      window.location.reload();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
    setIsClearing(false);
  };

  return (
    <div className="storage-manager">
      <Button onClick={handleClearStorage} disabled={isClearing}>
        {isClearing ? 'Clearing...' : 'Clear Browser Storage'}
      </Button>
    </div>
  );
};
```

#### B. Network Status Detection
```javascript
// Hook per gestire stato online/offline
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiStatus, setApiStatus] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, apiStatus };
};
```

---

## 🎯 **Checklist Implementazione**

### **Immediate Actions (Priority 1)**
- [ ] Creare componente diagnostico storage
- [ ] Implementare pulizia storage browser
- [ ] Aggiungere detection ambiente
- [ ] Configurare URL API dinamiche

### **Short Term (Priority 2)**  
- [ ] Aggiornare server CORS configuration
- [ ] Implementare fallback offline
- [ ] Aggiungere retry mechanism API
- [ ] Creare status dashboard

### **Long Term (Priority 3)**
- [ ] Implementare sync intelligente
- [ ] Aggiungere conflict resolution
- [ ] Migliorare error handling
- [ ] Aggiungere telemetria

---

## 🧪 **Testing Plan**

### **Test Locali**
1. Test con server spento (offline mode)
2. Test con storage pieno
3. Test switching tra reti
4. Test CORS da domini diversi

### **Test Produzione**
1. Deploy con nuova configurazione
2. Test multi-device sync
3. Test performance storage
4. Test fallback mechanisms

---

## 📊 **Monitoring**

### **Metriche da Monitorare**
- Storage usage percentage
- API response times
- Error rates per endpoint  
- Offline queue size
- Sync success rate

### **Alerting**
- Storage > 80% usage
- API errors > 5% rate
- Offline queue > 100 items
- Sync failures > 3 consecutive

---

## 🚀 **Next Steps**

1. **Implementare soluzioni immediate** (Storage + Environment)
2. **Testare in locale** con storage pieno
3. **Configurare server CORS** 
4. **Deploy e test produzione**
5. **Monitorare metriche** post-deploy

---

*Documento creato: 25/06/2025*
*Ultima modifica: 25/06/2025*
