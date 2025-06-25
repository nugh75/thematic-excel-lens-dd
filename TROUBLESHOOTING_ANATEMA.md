# 🚨 Troubleshooting Anatema - Piano di Debug

## Problema Principale: Pagina Bianca nei Progetti

### Sintomi Osservati
- ✅ L'applicazione si avvia correttamente
- ✅ La homepage funziona
- ❌ **CRITICO**: Accedendo alla sezione "Progetti" la pagina diventa bianca
- ❌ Errore JavaScript: `TypeError: E is undefined`
- ❌ Errore CORS da Cloudflare (secondario)

### Possibili Cause Root

#### 1. **Problemi di Dati/Store** (ALTA PROBABILITÀ)
- **Causa**: Store Zustand che cerca di accedere a progetti non esistenti
- **Sintomi**: `excelData` è `undefined` quando il componente tenta di renderizzare
- **Fix**: Controlli null safety nel componente DataGrid e store

#### 2. **Problemi API/Backend** (MEDIA PROBABILITÀ)
- **Causa**: API server non risponde o Redis vuoto dopo la pulizia
- **Sintomi**: Network online ma progetti non caricabili
- **Fix**: Verificare connessione API e dati in Redis

#### 3. **Problemi di Routing/UI** (BASSA PROBABILITÀ)
- **Causa**: Componenti che si montano prima del caricamento dati
- **Sintomi**: Componenti renderizzati con props undefined
- **Fix**: Loading states e conditional rendering

## Piano di Debug Strutturato

### FASE 1: Verifica Infrastruttura ⚙️

#### 1.1 Controllo Servizi Docker
```bash
# Verifica status
./docker-manage.sh status

# Verifica logs
./docker-manage.sh logs api-server
./docker-manage.sh logs anatema
```

#### 1.2 Test API Manuale
```bash
# Test health check
curl http://localhost:3001/health

# Test lista progetti
curl http://localhost:3001/api/projects

# Test Redis
curl http://localhost:3001/api/stats
```

### FASE 2: Debug Frontend 🐛

#### 2.1 Controlli Console Browser
- [ ] Aprire DevTools (F12)
- [ ] Controllare Console per errori JavaScript
- [ ] Controllare Network tab per richieste fallite
- [ ] Controllare Application > Local Storage per dati corrotti

#### 2.2 Controlli Componenti React
- [ ] Verificare che `useAnalysisStore` non ritorni `undefined`
- [ ] Controllare che `excelData` sia gestito correttamente quando `null`
- [ ] Verificare i controlli condizionali nei render

#### 2.3 Controlli Store Zustand
- [ ] Verificare inizializzazione store
- [ ] Controllare stato `currentProject`
- [ ] Verificare `loadProjects()` e `loadProject()`

### FASE 3: Fix Specifici 🔧

#### 3.1 Fix DataGrid Component
```typescript
// Aggiungere controlli null safety più robusti
if (!excelData || !excelData.headers) {
  return <LoadingState />;
}

// Verificare currentProject prima dell'uso
const columnMetadata = currentProject?.config?.columnMetadata || [];
```

#### 3.2 Fix Store Methods
```typescript
// In analysisStore.ts - aggiungere error handling
loadProject: async (projectId: string) => {
  try {
    const project = await apiService.getProject(projectId);
    if (!project) {
      throw new Error('Progetto non trovato');
    }
    set({ currentProject: project, excelData: project.excelData || null });
  } catch (error) {
    console.error('Errore caricamento progetto:', error);
    set({ currentProject: null, excelData: null });
  }
}
```

#### 3.3 Fix API Error Handling
```typescript
// In apiService.ts - aggiungere fallback
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return []; // Ritorna array vuoto invece di crash
  }
};
```

### FASE 4: Test e Validazione ✅

#### 4.1 Test Base
- [ ] Applicazione si avvia senza errori
- [ ] Sezione progetti accessibile
- [ ] Possibile creare nuovo progetto
- [ ] Possibile caricare file Excel

#### 4.2 Test Avanzati
- [ ] Navigazione tra progetti
- [ ] Persistenza dati su reload
- [ ] Funzionalità offline
- [ ] Sincronizzazione online

### FASE 5: Backup e Recovery 📦

#### 5.1 Creazione Progetto Test
```bash
# Dopo il fix, creare progetto di test
# 1. Accedere all'app
# 2. Creare nuovo progetto "Test"
# 3. Caricare file Excel di esempio
# 4. Salvare e verificare persistenza
```

#### 5.2 Backup Configurazione
```bash
# Backup configurazione funzionante
./docker-manage.sh backup

# Documentare configurazione working
cp .env .env.working
cp docker-compose.yml docker-compose.working.yml
```

## Checklist Debug Immediato 🚀

### Controlli Prioritari (fare SUBITO)
- [ ] ✅ Riavviare servizi Docker puliti
- [ ] 🔍 Controllare logs API server per errori Redis
- [ ] 🌐 Testare endpoint `/api/projects` manualmente
- [ ] 🐛 Aprire DevTools e controllare errori console
- [ ] 📱 Verificare se errore solo su "Progetti" o anche altre sezioni

### Fix Immediati da Applicare
1. **Aggiungere null safety al DataGrid** ⚡
2. **Verificare store initialization** ⚡  
3. **Testare API endpoints** ⚡
4. **Creare progetto di test** ⚡

## Logs da Monitorare 📊

### Frontend (Browser Console)
```
TypeError: E is undefined
Network is back online, checking server...
AI Settings loaded: {...}
```

### Backend (API Server)
```
🚀 API Server avviato su porta 3001
✅ Connesso a Redis
Errore recupero progetti: [ErrorReply: ...]
```

### Docker Logs
```
Container health: healthy/unhealthy
Redis connection status
Nginx access logs
```

## Next Steps Immediati 📋

1. **SUBITO**: Applicare fix null safety al DataGrid
2. **ENTRO 5 MIN**: Verificare e riavviare servizi Docker
3. **ENTRO 10 MIN**: Testare API endpoints manualmente
4. **ENTRO 15 MIN**: Creare progetto di test e verificare funzionalità
5. **ENTRO 30 MIN**: Documentare soluzione working e fare backup

---

**OBIETTIVO**: Avere l'applicazione Anatema completamente funzionante con la possibilità di creare, salvare e gestire progetti senza errori.

**STATUS ATTUALE**: 🟡 Infrastruttura OK, Frontend con errori critici
**TARGET**: 🟢 Applicazione completamente funzionale
