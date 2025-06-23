import { AIPromptTemplate } from './robustAIPipeline';

/**
 * Template per la generazione di etichette
 */
export const LABEL_GENERATION_TEMPLATE: AIPromptTemplate = {
  systemMessage: 'Sei un esperto in analisi tematica qualitativa. Rispondi sempre e solo in formato JSON valido, senza testo aggiuntivo.',
  
  userPromptTemplate: `{{userPrompt}}

Analizza le seguenti risposte e crea 5-8 etichette tematiche specifiche basate sulla richiesta dell'utente.

RISPOSTE DA ANALIZZARE:
{{responses}}

ETICHETTE GIÀ ESISTENTI (evita duplicati):
{{existingLabels}}

ISTRUZIONI CRITICHE:
1. Rispondi SOLO con JSON valido
2. Non aggiungere testo prima o dopo il JSON
3. Non usare markdown o formattazione
4. Ogni etichetta deve avere name, description, confidence, reasoning

JSON RICHIESTO:
{
  "suggestions": [
    {
      "name": "Nome Etichetta",
      "description": "Descrizione dettagliata",
      "confidence": 85,
      "reasoning": "Ragionamento specifico"
    }
  ],
  "generalAdvice": "Consigli per l'analisi"
}`,

  fallbackPrompt: `Crea 3 etichette semplici per questi dati: {{responses}}

Rispondi solo con questo JSON:
{
  "suggestions": [
    {"name": "Tema 1", "description": "Descrizione breve", "confidence": 70, "reasoning": "Basato sui dati"},
    {"name": "Tema 2", "description": "Descrizione breve", "confidence": 70, "reasoning": "Basato sui dati"},
    {"name": "Tema 3", "description": "Descrizione breve", "confidence": 70, "reasoning": "Basato sui dati"}
  ],
  "generalAdvice": "Rivedi manualmente i temi identificati"
}`,

  expectedFormat: 'JSON con suggestions array e generalAdvice string',
  
  validationRules: [
    (data) => data.hasOwnProperty('suggestions'),
    (data) => Array.isArray(data.suggestions),
    (data) => data.suggestions.length > 0,
    (data) => data.suggestions.every((s: any) => 
      s.name && s.description && typeof s.confidence === 'number' && s.reasoning
    )
  ]
};

/**
 * Template per i suggerimenti di etichette esistenti
 */
export const LABEL_SUGGESTION_TEMPLATE: AIPromptTemplate = {
  systemMessage: 'Sei un assistente per analisi tematica. Suggerisci etichette esistenti per le risposte. Rispondi solo in JSON valido.',
  
  userPromptTemplate: `Analizza le risposte e suggerisci quale delle etichette esistenti è più appropriata per ogni risposta.

ETICHETTE DISPONIBILI:
{{availableLabels}}

RISPOSTE DA ANALIZZARE:
{{responsesToAnalyze}}

ISTRUZIONI:
1. Rispondi SOLO con JSON valido
2. Per ogni risposta, suggerisci l'etichetta più appropriata
3. Includi confidence (0-100) e reasoning

JSON RICHIESTO:
{
  "suggestions": [
    {
      "responseIndex": 0,
      "suggestedLabelId": "id_etichetta",
      "confidence": 85,
      "reasoning": "Spiegazione breve"
    }
  ]
}`,

  fallbackPrompt: `Suggerisci etichette per queste risposte: {{responsesToAnalyze}}

Etichette disponibili: {{availableLabels}}

Rispondi solo con:
{
  "suggestions": [
    {"responseIndex": 0, "suggestedLabelId": "prima_etichetta_disponibile", "confidence": 60, "reasoning": "Analisi automatica"}
  ]
}`,

  expectedFormat: 'JSON con suggestions array',
  
  validationRules: [
    (data) => data.hasOwnProperty('suggestions'),
    (data) => Array.isArray(data.suggestions),
    (data) => data.suggestions.every((s: any) => 
      typeof s.responseIndex === 'number' && 
      s.suggestedLabelId && 
      typeof s.confidence === 'number' && 
      s.reasoning
    )
  ]
};

/**
 * Template per consigli generali
 */
export const GENERAL_ADVICE_TEMPLATE: AIPromptTemplate = {
  systemMessage: 'Sei un consulente esperto in analisi qualitativa. Fornisci consigli pratici e specifici.',
  
  userPromptTemplate: `Contesto: {{context}}
Domanda: {{question}}

Fornisci un consiglio pratico e specifico per migliorare l'analisi. 
Mantieni la risposta concisa ma informativa (massimo 200 parole).

Rispondi in formato JSON:
{
  "advice": "Il tuo consiglio qui",
  "suggestions": ["Suggerimento 1", "Suggerimento 2", "Suggerimento 3"]
}`,

  fallbackPrompt: `Dai un consiglio per: {{question}}

Rispondi solo con:
{
  "advice": "Consiglio generale sull'analisi tematica",
  "suggestions": ["Rivedi i dati", "Identifica pattern", "Categorizza temi"]
}`,

  expectedFormat: 'JSON con advice string e suggestions array',
  
  validationRules: [
    (data) => data.hasOwnProperty('advice'),
    (data) => typeof data.advice === 'string',
    (data) => data.advice.length > 10
  ]
};
