# 🚀 Pipeline AI Robusta - Documentazione Tecnica

## Panoramica

La **Pipeline AI Robusta** è un sistema avanzato progettato per gestire tutte le interazioni AI nell'applicazione di analisi tematica, garantendo alta affidabilità e recupero automatico dagli errori.

## 🛡️ Caratteristiche Principali

### 1. **Retry Automatico**
- Fino a 3 tentativi per ogni richiesta AI
- Exponential backoff opzionale per evitare rate limiting
- Delay configurabile tra i tentativi

### 2. **Parsing Intelligente Multi-Strategia**
1. **JSON Diretto** - Tentativo di parsing immediato
2. **Estrazione Regex** - Estrae JSON dal testo con pattern matching
3. **Pulizia Markdown** - Rimuove formattazione markdown/codice
4. **JSON Bilanciato** - Estrae JSON bilanciando parentesi graffe
5. **Ricostruzione** - Ricostruisce JSON parziale da linee

### 3. **Validazione Avanzata**
- Regole di validazione personalizzabili per ogni tipo di richiesta
- Verifica struttura e contenuto delle risposte AI
- Fallback automatico se la validazione fallisce

### 4. **Template Prompts**
- Template predefiniti per diversi tipi di analisi
- Prompt di fallback semplificati
- Istruzioni sempre più stringenti ad ogni retry

### 5. **Monitoraggio UI**
- Componente `AIPipelineStatus` per visualizzare stato in tempo reale
- Indicatori di progresso e tentativi
- Messaggi di errore dettagliati e informativi

## 📁 Struttura File

```
src/services/
├── robustAIPipeline.ts      # Core pipeline logic
├── aiPromptTemplates.ts     # Template per prompts
└── aiService.ts            # Servizio AI aggiornato

src/components/
├── AIPipelineStatus.tsx    # UI status component
├── AILabelGenerator.tsx    # Generazione etichette (aggiornato)
└── AISuggestionAssistant.tsx # Suggerimenti (aggiornato)
```

## 🔧 Utilizzo

### Generazione Etichette
```typescript
const result = await aiService.generateLabelsRobust(
  userPrompt,
  responses,
  existingLabels
);

if (result.success) {
  console.log(`Successo dopo ${result.attempts} tentativi`);
  // Usa result.data per le etichette generate
} else {
  console.error(`Fallito: ${result.error}`);
}
```

### Suggerimenti Etichette
```typescript
const result = await aiService.suggestExistingLabelsRobust(
  availableLabels,
  responsesToAnalyze
);
```

## 🎯 Template Disponibili

### `LABEL_GENERATION_TEMPLATE`
Per generare nuove etichette basate sui dati dell'utente.

### `LABEL_SUGGESTION_TEMPLATE`
Per suggerire etichette esistenti per specifiche risposte.

### `GENERAL_ADVICE_TEMPLATE`
Per consigli generali sull'analisi tematica.

## 🔍 Debug e Monitoraggio

### Console Logs
La pipeline genera log dettagliati per ogni fase:
- `🔄 Tentativo AI X/Y`
- `📥 Risposta AI`
- `🔍 Inizio parsing`
- `✅ Parsing riuscito` / `❌ Parsing fallito`

### UI Status Component
```tsx
<AIPipelineStatus
  isProcessing={isGenerating}
  currentAttempt={pipelineState.currentAttempt}
  maxAttempts={pipelineState.maxAttempts}
  stage={pipelineState.stage}
  error={error}
  success={pipelineState.success}
/>
```

## ⚡ Configurazione

### Retry Settings
```typescript
{
  maxAttempts: 3,           // Numero massimo tentativi
  delayMs: 1000,           // Delay base in millisecondi
  exponentialBackoff: true // Incremento esponenziale del delay
}
```

### Validation Rules
Ogni template definisce regole di validazione:
```typescript
validationRules: [
  (data) => data.hasOwnProperty('suggestions'),
  (data) => Array.isArray(data.suggestions),
  (data) => data.suggestions.length > 0
]
```

## 🛠️ Risoluzione Problemi

### Errore "Risposta AI non valida"
La pipeline ora gestisce automaticamente:
- JSON malformattato
- Testo con markdown/formattazione
- Risposte parziali o incomplete
- Timeout di rete temporanei

### Fallback Automatico
Se tutti i tentativi standard falliscono:
1. Usa prompt semplificato di fallback
2. Crea risposta sintetica basata sul contenuto
3. Mostra errore dettagliato all'utente

## 📊 Metriche

La pipeline traccia:
- Numero di tentativi per successo
- Strategia di parsing utilizzata
- Tempo totale di elaborazione
- Tasso di successo per provider AI

## 🚀 Prossimi Miglioramenti

- [ ] Cache delle risposte AI valide
- [ ] Analisi della qualità dei prompt
- [ ] Ottimizzazione automatica dei parametri
- [ ] Supporto per streaming responses
- [ ] Fallback a provider AI alternativi

---

**Nota**: Questa pipeline garantisce un'esperienza utente fluida anche quando i modelli AI restituiscono risposte in formato non standard o quando ci sono problemi di rete temporanei.
