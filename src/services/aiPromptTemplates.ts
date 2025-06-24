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

TAG DISPONIBILI PER CATEGORIZZAZIONE (scegli 1-3 tag appropriati per ogni etichetta):
Emozioni, Problemi, Soddisfazione, Demografia, Sentiment, Comportamentali, Tematiche, Urgenza, Qualità, Servizio, Prodotto, Processo, Comunicazione, Esperienza, Feedback, Miglioramenti

ISTRUZIONI CRITICHE:
1. Rispondi SOLO con JSON valido
2. Non aggiungere testo prima o dopo il JSON
3. Non usare markdown o formattazione
4. Ogni etichetta deve avere name, description, confidence, reasoning e tags
5. I tag devono essere scelti dalla lista predefinita sopra
6. Seleziona 1-3 tag appropriati per ogni etichetta

JSON RICHIESTO:
{
  "suggestions": [
    {
      "name": "Nome Etichetta",
      "description": "Descrizione dettagliata",
      "confidence": 85,
      "reasoning": "Ragionamento specifico",
      "tags": ["Tag1", "Tag2"]
    }
  ],
  "generalAdvice": "Consigli per l'analisi"
}`,

  fallbackPrompt: `Crea 3 etichette semplici per questi dati: {{responses}}

Rispondi solo con questo JSON:
{
  "suggestions": [
    {"name": "Tema 1", "description": "Descrizione breve", "confidence": 70, "reasoning": "Basato sui dati", "tags": ["Tematiche"]},
    {"name": "Tema 2", "description": "Descrizione breve", "confidence": 70, "reasoning": "Basato sui dati", "tags": ["Feedback"]},
    {"name": "Tema 3", "description": "Descrizione breve", "confidence": 70, "reasoning": "Basato sui dati", "tags": ["Esperienza"]}
  ],
  "generalAdvice": "Rivedi manualmente i temi identificati"
}`,

  expectedFormat: 'JSON con suggestions array e generalAdvice string',
  
  validationRules: [
    (data) => data.hasOwnProperty('suggestions'),
    (data) => Array.isArray(data.suggestions),
    (data) => data.suggestions.length > 0,
    (data) => data.suggestions.every((s: any) => 
      s.name && s.description && typeof s.confidence === 'number' && s.reasoning && Array.isArray(s.tags)
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

  fallbackPrompt: `Analizza queste risposte e suggerisci etichette: {{responsesToAnalyze}}

Etichette disponibili: {{availableLabels}}

IMPORTANTE: Rispondi SOLO in formato JSON senza altro testo.

{
  "suggestions": [
    {"responseIndex": 0, "suggestedLabelId": "prima_etichetta_disponibile", "confidence": 60, "reasoning": "Analisi automatica - verifica manualmente"}
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

/**
 * Interfaccia per i prompt di sistema personalizzati
 */
export interface CustomSystemPrompts {
  labelGeneration?: string;
  labelSuggestion?: string;
  generalAdvice?: string;
}

/**
 * Recupera i prompt di sistema personalizzati dal localStorage
 */
export function getCustomSystemPrompts(): CustomSystemPrompts {
  try {
    const saved = localStorage.getItem('ai-system-prompts');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Errore nel caricamento dei prompt personalizzati:', error);
    return {};
  }
}

/**
 * Ottiene il prompt di sistema per un tipo specifico, con fallback al predefinito
 */
export function getSystemPrompt(type: keyof CustomSystemPrompts): string {
  const customPrompts = getCustomSystemPrompts();
  const customPrompt = customPrompts[type];
  
  if (customPrompt && customPrompt.trim()) {
    return customPrompt;
  }
  
  // Fallback ai prompt predefiniti
  switch (type) {
    case 'labelGeneration':
      return LABEL_GENERATION_TEMPLATE.systemMessage;
    case 'labelSuggestion':
      return LABEL_SUGGESTION_TEMPLATE.systemMessage;
    case 'generalAdvice':
      return GENERAL_ADVICE_TEMPLATE.systemMessage;
    default:
      return 'Sei un assistente AI specializzato in analisi tematica qualitativa.';
  }
}
