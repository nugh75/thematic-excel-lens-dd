# Guida Configurazione OpenRouter - Modelli AI Gratuiti

## Cos'è OpenRouter?

OpenRouter è una piattaforma che fornisce accesso unificato a una vasta gamma di modelli AI attraverso un'API standardizzata. Offre sia modelli gratuiti che a pagamento, rendendo l'AI accessibile a tutti.

## Vantaggi di OpenRouter

### ✅ Modelli Gratuiti Disponibili
- **Llama 3.1 8B**: Eccellente per analisi generale e generazione testo
- **Llama 3.2 3B**: Versione più leggera ma comunque capace
- **Mistral 7B**: Ottimo per compiti creativi e conversazionali
- **Qwen 2.5 7B**: Specializzato in analisi e ragionamento
- **Phi-3 Medium**: Ottimizzato per problem-solving

### 🚀 Benefici Tecnici
- **Nessuna installazione locale**: Tutto cloud-based
- **API standardizzata**: Compatibile con OpenAI
- **Rate limiting ragionevole**: Quota gratuita generosa
- **Monitoraggio utilizzo**: Dashboard per tracciare consumi

## Configurazione Passo-Passo

### 1. Creazione Account OpenRouter

1. **Visita il sito**: Vai su [openrouter.ai](https://openrouter.ai)
2. **Registrati**: Clicca su "Sign Up" in alto a destra
3. **Compila il form**:
   - Email
   - Password sicura
   - Nome (opzionale)
4. **Verifica email**: Controlla la tua casella di posta e clicca sul link di verifica

### 2. Ottenere l'API Key

1. **Accedi al dashboard**: Dopo la registrazione, sarai reindirizzato alla dashboard
2. **Vai alle API Keys**: Nel menu laterale, clicca su "API Keys"
3. **Crea nuova key**: Clicca su "Create Key"
4. **Dai un nome**: Es. "Thematic Analysis Tool"
5. **Copia la key**: La key sarà mostrata una sola volta, copiala subito!

**Formato API Key**: `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. Configurazione nell'Applicazione

1. **Apri l'applicazione**: Avvia il tool di analisi tematica
2. **Vai alla configurazione AI**: Tab "AI Config"
3. **Seleziona provider**: Scegli "OpenRouter (Modelli Gratuiti)"
4. **Inserisci API Key**: Incolla la key copiata nel campo "API Key OpenRouter"
5. **Testa connessione**: Clicca su "Test" per verificare
6. **Seleziona modello**: Scegli uno dei modelli gratuiti disponibili
7. **Abilita AI**: Attiva il toggle "Abilita assistenza AI"

### 4. Modelli Raccomandati per Analisi Tematica

#### 🥇 **Llama 3.1 8B** (Raccomandato)
- **ID**: `meta-llama/llama-3.1-8b-instruct:free`
- **Punti di forza**: Eccellente comprensione del contesto, buona per analisi qualitativa
- **Ideale per**: Generazione etichette, categorizzazione temi

#### 🥈 **Mistral 7B**
- **ID**: `mistralai/mistral-7b-instruct:free`
- **Punti di forza**: Versatile, buona creatività nella generazione etichette
- **Ideale per**: Analisi semantica, identificazione pattern emotivi

#### 🥉 **Qwen 2.5 7B**
- **ID**: `qwen/qwen-2.5-7b-instruct:free`
- **Punti di forza**: Eccellente ragionamento analitico
- **Ideale per**: Analisi strutturata, classificazioni complesse

## Monitoraggio Utilizzo

### Dashboard OpenRouter
1. **Accedi alla dashboard**: [openrouter.ai/activity](https://openrouter.ai/activity)
2. **Visualizza utilizzo**: 
   - Richieste fatte
   - Crediti consumati
   - Modelli utilizzati
3. **Controlla limiti**: Verifica i limiti giornalieri/mensili

### Limiti Gratuiti (Tipici)
- **Richieste/giorno**: ~100-200 richieste
- **Token/mese**: ~25,000 token
- **Rate limit**: ~3 richieste/minuto

*I limiti esatti possono variare, controlla sempre la dashboard*

## Troubleshooting Comuni

### ❌ "Connessione fallita"
**Possibili cause**:
- API key errata o scaduta
- Connessione internet instabile
- Limiti di rate limiting superati

**Soluzioni**:
1. Verifica che l'API key sia corretta
2. Controlla la connessione internet
3. Attendi qualche minuto e riprova
4. Verifica i limiti sulla dashboard OpenRouter

### ❌ "Quota exceeded"
**Causa**: Hai raggiunto i limiti del piano gratuito

**Soluzioni**:
1. Attendi il reset giornaliero/mensile
2. Considera l'upgrade a un piano a pagamento
3. Usa il modello solo per le operazioni essenziali

### ❌ "Model not available"
**Causa**: Il modello gratuito potrebbe essere temporaneamente non disponibile

**Soluzioni**:
1. Prova un altro modello gratuito
2. Riprova più tardi
3. Controlla lo status page di OpenRouter

## Confronto: OpenRouter vs OpenAI

| Caratteristica | OpenRouter (Free) | OpenAI (Paid) |
|----------------|-------------------|---------------|
| **Costo** | Gratuito con limiti | A pagamento |
| **Setup** | Solo registrazione | API key + crediti |
| **Modelli** | Llama, Mistral, Qwen | GPT-4, GPT-3.5 |
| **Prestazioni** | Buone | Eccellenti |
| **Limiti** | Quota giornaliera | Solo crediti |
| **Ideale per** | Testing, sviluppo | Produzione |

## Best Practices

### 🎯 Ottimizzazione Utilizzo
1. **Prompt concisi**: Scrivi prompt chiari ma brevi
2. **Batch processing**: Analizza più risposte insieme quando possibile
3. **Cache risultati**: Salva le etichette generate per riuso
4. **Modello appropriato**: Scegli il modello giusto per il task

### 🔒 Sicurezza
1. **Non condividere API key**: Tieni la key privata
2. **Rigenera periodicamente**: Cambia la key ogni 3-6 mesi
3. **Monitora utilizzo**: Controlla accessi non autorizzati
4. **Usa HTTPS**: Assicurati di usare connessioni sicure

### 📊 Performance
1. **Test iniziali**: Prova diversi modelli per trovare il migliore
2. **Monitor response time**: Alcuni modelli possono essere più lenti
3. **Gestisci rate limiting**: Implementa retry con backoff
4. **Fallback strategy**: Prepara alternative se un modello non è disponibile

## Supporto

### Risorse Utili
- **Documentazione OpenRouter**: [openrouter.ai/docs](https://openrouter.ai/docs)
- **Discord Community**: Unisciti alla community per supporto
- **API Status**: [status.openrouter.ai](https://status.openrouter.ai)
- **FAQ**: Sezione FAQ nel sito OpenRouter

### Contatti
- **Email Support**: support@openrouter.ai
- **GitHub Issues**: Per problemi specifici dell'integrazione
- **Community Forum**: Per discussioni e best practices

Con questa configurazione avrai accesso a potenti modelli AI completamente gratuiti per la tua analisi tematica! 🚀
