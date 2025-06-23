# 🔧 Risoluzione Problema OpenRouter API 401

## 🚨 Problema Identificato
L'errore "401 - No auth credentials found" indica che le credenziali di autenticazione non vengono passate correttamente all'API OpenRouter.

## ✅ Modifiche Implementate

### 1. **Test di Connessione Migliorato**
- ✅ Il test ora usa l'endpoint `/chat/completions` (quello reale) invece di `/models`
- ✅ Verifica effettiva della risposta AI
- ✅ Stesso metodo delle chiamate di produzione

### 2. **Gestione Chiavi API Migliorata**
- ✅ Priorità alle variabili d'ambiente
- ✅ Prevenzione sovrascrittura da localStorage vuoto
- ✅ Logging di debug per verificare le chiavi caricate

### 3. **Messaggi di Errore Dettagliati**
- ✅ Controllo presenza chiave API prima della chiamata
- ✅ Errori 401 specifici con suggerimenti
- ✅ Informazioni dettagliate per troubleshooting

### 4. **Debug Console**
- ✅ Servizio AI disponibile su `window.aiService` per debug
- ✅ Funzioni di debug per verificare chiavi e impostazioni

## 🔍 Steps per Debugging

### Passo 1: Verifica Console Browser
1. Apri DevTools (F12)
2. Vai su "Console"
3. Dovresti vedere: "AI Service is available at window.aiService for debugging"
4. Esegui: `aiService.debugApiKeys()` per verificare le chiavi

### Passo 2: Verifica Impostazioni
1. Esegui: `aiService.getSettings()` per vedere tutte le impostazioni
2. Verifica che `openrouterApiKey` non sia vuoto
3. Verifica che `provider` sia "openrouter"

### Passo 3: Test Manuale
1. Vai alla scheda "AI Config" nell'app
2. Clicca "Test" - ora dovrebbe fare un test reale
3. Se fallisce, l'errore sarà più specifico

### Passo 4: Refresh Forzato (se necessario)
Se il localStorage ha impostazioni vecchie:
```javascript
// Nella console del browser
aiService.refreshFromEnvironment()
```

## 🔑 Verifica Chiave OpenRouter

### Metodo 1: Dalla Console
```javascript
// Controlla le impostazioni attuali
aiService.getSettings()

// Debug delle chiavi (mostra solo inizio/fine)
aiService.debugApiKeys()
```

### Metodo 2: Test Manuale API
Se vuoi testare la chiave direttamente:
```javascript
fetch('https://openrouter.ai/api/v1/models', {
  headers: {
    'Authorization': 'Bearer LA_TUA_CHIAVE_QUI'
  }
}).then(r => r.json()).then(console.log)
```

## 🛠️ Possibili Cause e Soluzioni

### ❌ **Causa 1: Chiave API Non Valida**
**Sintomi**: Errore 401 immediato
**Soluzione**: 
1. Verifica che la chiave inizi con `sk-or-v1-`
2. Controlla che sia copiata completamente dal file `.env`
3. Genera una nuova chiave su [openrouter.ai/keys](https://openrouter.ai/keys)

### ❌ **Causa 2: LocalStorage Sovrascrive .env**
**Sintomi**: Chiave corretta nel file `.env` ma errore 401
**Soluzione**:
```javascript
// Pulisci localStorage e ricarica
localStorage.removeItem('ai-settings')
location.reload()
```

### ❌ **Causa 3: Modello Non Disponibile**
**Sintomi**: Errore 401 specifico per modello
**Soluzione**: Cambia modello nella configurazione AI

### ❌ **Causa 4: Headers Mancanti**
**Sintomi**: Errore intermittente
**Soluzione**: Già risolto nel codice con headers corretti

## 🎯 Test Finale

Dopo le modifiche, procedi così:

1. **Refresh Hard**: Ctrl+F5 (o Cmd+Shift+R su Mac)
2. **Console Debug**: `aiService.debugApiKeys()`
3. **Test UI**: Vai su "AI Config" → Test
4. **Test Funzionalità**: "Etichette" → "Generazione AI"

## 📊 Log di Debug Disponibili

Il servizio ora logga automaticamente:
- ✅ Stato caricamento impostazioni
- ✅ Presenza chiavi API (senza mostrare il valore completo)
- ✅ Provider e modello selezionati
- ✅ Errori dettagliati con codici HTTP

## 🚀 Se Tutto Funziona

Una volta risolto, dovresti vedere:
- ✅ Test connessione: "Connessione stabilita con successo"
- ✅ Generazione etichette: Funzionante senza errori 401
- ✅ Console: Nessun errore di autenticazione

---

**💡 Suggerimento**: Se il problema persiste, controlla anche i limiti di rate dell'account OpenRouter o prova a generare una nuova chiave API.
