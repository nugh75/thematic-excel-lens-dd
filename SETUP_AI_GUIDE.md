# 🚀 Guida Rapida: Configurazione AI con OpenRouter (Gratuito)

## ✅ Problemi Risolti
- **Errore "r.trim is not a function"**: ✅ Risolto
- **Gestione delle chiavi API**: ✅ Implementata con file .env
- **Sostituzione Ollama → OpenRouter**: ✅ Completata

## 🔧 Come Configurare OpenRouter (Gratuito)

### Passo 1: Ottieni la tua API Key gratuita
1. Vai su [openrouter.ai](https://openrouter.ai)
2. Clicca "Sign Up" e crea un account gratuito
3. Vai su [openrouter.ai/keys](https://openrouter.ai/keys)
4. Clicca "Create Key" e copia la chiave (inizia con `sk-or-v1-...`)

### Passo 2: Configura il file .env
1. Copia il file `.env.example` come `.env`:
   ```bash
   cp .env.example .env
   ```

2. Modifica il file `.env` e decommenta la riga OpenRouter:
   ```bash
   # Rimuovi il # davanti a questa riga e inserisci la tua chiave
   VITE_OPENROUTER_API_KEY=sk-or-v1-la-tua-chiave-qui
   ```

### Passo 3: Avvia l'applicazione
```bash
npm run dev
```

### Passo 4: Abilita l'AI nell'app
1. Vai alla scheda "AI Config"
2. Seleziona "OpenRouter (Modelli Gratuiti)"
3. La tua API key dovrebbe essere già precompilata
4. Clicca "Test" per verificare la connessione
5. Seleziona un modello gratuito (es. Llama 3.1 8B)
6. Attiva il toggle "Abilita assistenza AI"

## 🎯 Modelli Gratuiti Disponibili

- **Llama 3.1 8B** - Ottimo per analisi generale
- **Mistral 7B** - Eccellente per testi in italiano
- **Qwen 2.5 7B** - Bilanciato per performance/qualità
- **Phi-3 Medium** - Efficiente per task specifici

## 🔒 Sicurezza delle Chiavi

- ✅ Il file `.env` è nel `.gitignore` 
- ✅ Le chiavi non vengono committate nel repository
- ✅ Le chiavi sono gestite solo localmente

## 🏃‍♂️ Test Rapido

1. Carica un file Excel
2. Vai a "Etichette" → "Generazione AI"
3. Seleziona una colonna
4. Usa il prompt: "Crea etichette per i temi principali"
5. Clicca "Genera Etichette AI"
6. Seleziona le etichette che ti interessano
7. Clicca "Crea Etichette Selezionate"

## 🆘 Risoluzione Problemi

### ❌ "AI non abilitata"
- Verifica che la chiave sia nel file `.env`
- Riavvia l'applicazione dopo aver modificato `.env`
- Controlla che il toggle AI sia attivo in "AI Config"

### ❌ "Errore connessione"
- Verifica che la chiave OpenRouter sia corretta
- Controlla la tua connessione internet
- Prova a cliccare "Test" in "AI Config"

### ❌ "Nessun modello disponibile"
- Assicurati di aver selezionato "OpenRouter" come provider
- Clicca "Aggiorna" nella selezione modelli

## 📊 Funzionalità AI Disponibili

### 1. Generazione Etichette
- Analisi automatica delle risposte
- Prompt personalizzabili
- Selezione interattiva delle etichette

### 2. Suggerimenti Automatici
- Applicazione intelligente di etichette esistenti
- Workflow accetta/rifiuta
- Auto-applicazione per alta confidenza

### 3. Assistente AI
- Consigli per l'analisi tematica
- Chat contestuale
- Supporto metodologico

## 🎉 Pronto!

Ora puoi utilizzare tutte le funzionalità AI del tuo strumento di analisi tematica con modelli completamente gratuiti!

---

**Nota**: OpenRouter offre una quota generosa di utilizzo gratuito. Per progetti intensivi, considera l'upgrade a un piano a pagamento o l'utilizzo di OpenAI per modelli premium.
