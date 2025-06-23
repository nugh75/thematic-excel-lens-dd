# AI-Powered Label Management - Documentazione Funzionalità

## Overview
Implementazione completa di funzionalità AI avanzate per la gestione delle etichette nel sistema di analisi tematica collaborativa.

## Funzionalità Implementate

### 1. Generazione AI di Etichette (AILabelGenerator)
**Localizzazione**: `src/components/AILabelGenerator.tsx`

**Funzionalità**:
- Analisi automatica delle risposte di una colonna dataset
- Generazione di etichette personalizzate basate su prompt utente
- Selezione interattiva delle etichette da creare (checkbox)
- Support per prompt preimpostati e personalizzati
- Valutazione della confidenza per ogni etichetta suggerita
- Creazione batch delle etichette selezionate

**Come usare**:
1. Vai alla scheda "Etichette" → "Generazione AI"
2. Seleziona la colonna da analizzare
3. Inserisci o seleziona un prompt personalizzato
4. Clicca "Genera Etichette AI"
5. Seleziona le etichette che vuoi creare
6. Clicca "Crea Etichette Selezionate"

### 2. Suggerimenti AI per Etichette Esistenti (AISuggestionAssistant)
**Localizzazione**: `src/components/AISuggestionAssistant.tsx`

**Funzionalità**:
- Analisi delle risposte per suggerire etichette esistenti
- Workflow interattivo accetta/rifiuta per ogni suggerimento
- Auto-applicazione per suggerimenti ad alta confidenza (≥85%)
- Navigazione avanti/indietro tra i suggerimenti
- Ragionamento dettagliato per ogni suggerimento
- Barra di progresso per tracciare i suggerimenti esaminati

**Come usare**:
1. Vai alla scheda "Etichette" → "Suggerimenti AI"
2. Seleziona la colonna da analizzare
3. Clicca "Analizza e Suggerisci"
4. Per ogni suggerimento, scegli "Accetta" o "Rifiuta"
5. Opzionale: usa "Auto-Applica" per applicare automaticamente suggerimenti ad alta confidenza

### 3. Gestione Etichette Unificata (LabelManager)
**Localizzazione**: `src/components/LabelManager.tsx`

**Struttura**:
- **Gestione Base**: Creazione, modifica, eliminazione e merge di etichette
- **Generazione AI**: Generazione automatica di nuove etichette
- **Suggerimenti AI**: Applicazione automatica di etichette esistenti

## Configurazione AI

### Provider Supportati
- **OpenRouter** (gratuito): Accesso a modelli gratuiti come Llama, Mistral, Qwen
- **OpenAI** (premium): Modelli GPT-4 e GPT-3.5 a pagamento

### Configurazione
1. Vai alla scheda "AI Config"
2. Seleziona il provider (OpenRouter/OpenAI)
3. Configura le impostazioni specifiche:
   - **OpenRouter**: API key gratuita da openrouter.ai, selezione modello gratuito
   - **OpenAI**: API key a pagamento, selezione modello premium
4. Testa la connessione
5. Abilita l'AI

## Architettura Tecnica

### File Principali
```
src/
├── components/
│   ├── AILabelGenerator.tsx      # Generazione AI etichette
│   ├── AISuggestionAssistant.tsx # Suggerimenti AI
│   ├── LabelManager.tsx          # Gestione unificata
│   ├── LabelManagerAdvanced.tsx  # Gestione base etichette
│   └── AISettingsPanel.tsx       # Configurazione AI
├── services/
│   └── aiService.ts              # Servizio AI (Ollama/OpenAI)
└── store/
    └── analysisStore.ts          # Store Zustand con persistenza
```

### Servizio AI (aiService.ts)
- **Architettura Multi-Provider**: Supporto per OpenRouter e OpenAI
- **Gestione Errori**: Error handling robusto per connessioni
- **Test Connessioni**: Verifica automatica dello stato dei provider
- **Configurazioni Dinamiche**: Modelli e impostazioni caricate dinamicamente

### Store Zustand
- **Persistenza Avanzata**: Auto-save progetti con debouncing
- **Gestione Utenti**: Fallback user predefinito
- **Ottimizzazione**: Partializzazione per ridurre storage

## Workflow Tipico

### Scenario 1: Creazione Nuove Etichette con AI
1. **Setup**: Carica dataset Excel, configura AI
2. **Generazione**: Usa prompt personalizzato per generare etichette
3. **Selezione**: Scegli etichette rilevanti da creare
4. **Applicazione**: Usa le nuove etichette per l'analisi

### Scenario 2: Applicazione Automatica Etichette Esistenti
1. **Preparazione**: Assicurati di avere etichette create
2. **Analisi**: L'AI analizza le risposte e suggerisce etichette
3. **Revisione**: Esamina ogni suggerimento manualmente
4. **Automazione**: Applica automaticamente suggerimenti ad alta confidenza

## Prompt Templates Predefiniti

Il sistema include prompt ottimizzati per diversi tipi di analisi:
- **Tematiche generali**: Categorizzazione per temi principali
- **Analisi emotiva**: Identificazione di pattern emotivi
- **Problem analysis**: Individuazione di problemi e bisogni
- **Sentiment analysis**: Classificazione per livello di soddisfazione
- **Behavioral patterns**: Categorie demografiche e comportamentali
- **Positive/Negative themes**: Separazione tematiche positive/negative

## Considerazioni Prestazioni

### Ottimizzazioni Implementate
- **Limite analisi**: Max 30 risposte per generazione etichette
- **Limit suggerimenti**: Max 10 risposte per suggerimenti
- **Debouncing**: Auto-save con ritardo 100ms
- **Caching**: Configurazioni AI memorizzate localmente

### Gestione Errori
- **Timeout handling**: Gestione timeout AI requests
- **Fallback graceful**: Sistema funziona anche senza AI
- **User feedback**: Toast notifications per tutti gli stati
- **Retry logic**: Possibilità di riprovare operazioni fallite

## Testing e Debug

### Verifiche Pre-Implementazione
✅ Compilazione senza errori  
✅ Integrazione components esistenti  
✅ Persistenza dati Zustand  
✅ Connessione Ollama verificata  
✅ UI responsive e accessibile  

### Comandi Test
```bash
# Build production
npm run build

# Development server
npm run dev

# Verificare connessione OpenRouter
# (disponibile tramite UI in AI Config)

# Test connessione AI
# (disponibile tramite UI in AI Config)
```

## Roadmap Futuri Miglioramenti

### Funzionalità Avanzate
- [ ] **Batch processing**: Analisi multiple colonne simultaneamente
- [ ] **ML training**: Fine-tuning modelli su dati progetto specifici
- [ ] **Collaborative AI**: Suggerimenti basati su patterns team
- [ ] **Export AI insights**: Report automatici con insight AI

### UX Enhancements
- [ ] **Keyboard shortcuts**: Navigazione rapida suggerimenti
- [ ] **Drag & drop**: Applicazione etichette con gestures
- [ ] **Real-time collaboration**: Suggerimenti AI condivisi live
- [ ] **Template manager**: Salvataggio prompt personalizzati

### Performance
- [ ] **Background processing**: Analisi AI in worker threads
- [ ] **Incremental analysis**: Analisi solo nuovi dati
- [ ] **Caching avanzato**: Cache risultati AI persistente
- [ ] **Progressive loading**: Caricamento progressivo grandi dataset

## Supporto e Troubleshooting

### Problemi Comuni
1. **AI non disponibile**: Verifica configurazione in "AI Config"
2. **Connessione OpenRouter**: Verifica validità API key gratuita
3. **OpenAI errors**: Controlla validity API key e quota disponibile
4. **Performance lenta**: Riduci dimensione dataset o usa auto-applica

### Log e Debug
- Console browser per errori AI service
- Network tab per verificare richieste AI
- LocalStorage inspection per persistenza dati
- Toast notifications per feedback utente

## Conclusioni

L'implementazione fornisce un sistema completo e robusto per l'integrazione dell'AI nell'analisi tematica qualitativa, con focus su:
- **Usabilità**: Workflow intuitivi e guidati
- **Flessibilità**: Supporto multiple providers AI
- **Scalabilità**: Architettura estendibile per future features
- **Reliability**: Error handling e fallback appropriati

Il sistema è pronto per l'uso in produzione e fornisce una base solida per l'evoluzione futura delle funzionalità AI.
