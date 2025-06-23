export interface AIModel {
  name: string;
  id: string;
  description?: string;
  free?: boolean;
}

export type AIProvider = 'openrouter' | 'openai';

export interface AISettings {
  provider: AIProvider;
  openrouterApiKey: string;
  openaiApiKey: string;
  selectedModel: string;
  enabled: boolean;
}

export interface LabelSuggestion {
  name: string;
  description: string;
  confidence: number;
  reasoning: string;
}

export interface AISuggestionResponse {
  suggestions: LabelSuggestion[];
  generalAdvice?: string;
}

// Modelli predefiniti per ogni provider
export const OPENROUTER_FREE_MODELS: AIModel[] = [
  {
    name: 'Llama 3.1 8B (Free)',
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    description: 'Modello Llama 3.1 8B gratuito',
    free: true
  },
  {
    name: 'Llama 3.2 3B (Free)',
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    description: 'Modello Llama 3.2 3B gratuito',
    free: true
  },
  {
    name: 'Mistral 7B (Free)',
    id: 'mistralai/mistral-7b-instruct:free',
    description: 'Modello Mistral 7B gratuito',
    free: true
  },
  {
    name: 'Mistral Small 3.2 24B (Free)',
    id: 'mistralai/mistral-small-3.2-24b-instruct:free',
    description: 'Modello Mistral Small 3.2 24B gratuito - più potente',
    free: true
  },
  {
    name: 'DeepSeek Chat v3 (Free)',
    id: 'deepseek/deepseek-chat-v3-0324:free',
    description: 'Modello DeepSeek Chat v3 gratuito',
    free: true
  },
  {
    name: 'DeepSeek R1 0528 (Free)',
    id: 'deepseek/deepseek-r1-0528:free',
    description: 'Modello DeepSeek R1 gratuito - versione 0528',
    free: true
  },
  {
    name: 'DeepSeek R1 (Free)',
    id: 'deepseek/deepseek-r1:free',
    description: 'Modello DeepSeek R1 gratuito - ultima versione',
    free: true
  },
  {
    name: 'Gemini 2.0 Flash (Free)',
    id: 'google/gemini-2.0-flash-exp:free',
    description: 'Google Gemini 2.0 Flash sperimentale gratuito',
    free: true
  },
  {
    name: 'Qwen 2.5 7B (Free)',
    id: 'qwen/qwen-2.5-7b-instruct:free',
    description: 'Modello Qwen 2.5 7B gratuito',
    free: true
  },
  {
    name: 'Phi-3 Medium (Free)',
    id: 'microsoft/phi-3-medium-128k-instruct:free',
    description: 'Modello Phi-3 Medium gratuito',
    free: true
  }
];

export const OPENAI_MODELS: AIModel[] = [
  {
    name: 'GPT-4o',
    id: 'gpt-4o',
    description: 'GPT-4 ottimizzato, più veloce'
  },
  {
    name: 'GPT-4o Mini',
    id: 'gpt-4o-mini',
    description: 'Versione più economica di GPT-4o'
  },
  {
    name: 'GPT-4 Turbo',
    id: 'gpt-4-turbo',
    description: 'GPT-4 con contesto esteso'
  },
  {
    name: 'GPT-3.5 Turbo',
    id: 'gpt-3.5-turbo',
    description: 'Modello veloce ed economico'
  }
];

class AIService {
  private settings: AISettings = {
    provider: (import.meta.env.VITE_DEFAULT_AI_PROVIDER as AIProvider) || 'openrouter',
    openrouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    selectedModel: import.meta.env.VITE_DEFAULT_OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
    enabled: import.meta.env.VITE_AI_ENABLED_DEFAULT === 'true' || false
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const saved = localStorage.getItem('ai-settings');
    if (saved) {
      const savedSettings = JSON.parse(saved);
      // Mantieni le chiavi dalle variabili d'ambiente se quelle salvate sono vuote
      this.settings = { 
        ...this.settings, 
        ...savedSettings,
        // Priorità alle variabili d'ambiente per le chiavi API se non vuote
        openrouterApiKey: savedSettings.openrouterApiKey || import.meta.env.VITE_OPENROUTER_API_KEY || '',
        openaiApiKey: savedSettings.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY || ''
      };
    }
    
    // Debug: verifica che abbiamo le chiavi corrette
    console.log('AI Settings loaded:', {
      provider: this.settings.provider,
      hasOpenRouterKey: !!this.settings.openrouterApiKey,
      hasOpenAIKey: !!this.settings.openaiApiKey,
      selectedModel: this.settings.selectedModel,
      enabled: this.settings.enabled
    });
  }

  private saveSettings() {
    localStorage.setItem('ai-settings', JSON.stringify(this.settings));
  }

  updateSettings(newSettings: Partial<AISettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings(): AISettings {
    return { ...this.settings };
  }

  // Funzione utile per debug - forza refresh delle impostazioni dalle variabili d'ambiente
  refreshFromEnvironment() {
    this.settings.openrouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY || this.settings.openrouterApiKey;
    this.settings.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || this.settings.openaiApiKey;
    this.saveSettings();
    console.log('Settings refreshed from environment');
  }

  // Funzione per debug delle chiavi (senza mostrare la chiave completa)
  debugApiKeys() {
    const openrouterKey = this.settings.openrouterApiKey;
    const openaiKey = this.settings.openaiApiKey;
    
    console.log('API Keys Status:', {
      openrouter: openrouterKey ? `${openrouterKey.substring(0, 8)}...${openrouterKey.substring(openrouterKey.length - 4)}` : 'MISSING',
      openai: openaiKey ? `${openaiKey.substring(0, 8)}...${openaiKey.substring(openaiKey.length - 4)}` : 'MISSING',
      provider: this.settings.provider,
      model: this.settings.selectedModel
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.settings.provider === 'openrouter') {
        // Test con una chiamata reale all'endpoint chat/completions
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.settings.openrouterApiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Thematic Analysis Tool'
          },
          body: JSON.stringify({
            model: this.settings.selectedModel,
            messages: [
              {
                role: 'user',
                content: 'Test connection. Please respond with "OK".'
              }
            ],
            temperature: 0.1,
            max_tokens: 10
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          return !!data.choices?.[0]?.message?.content;
        }
        return false;
      } else {
        // Test OpenAI con chiamata reale
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.settings.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: this.settings.selectedModel,
            messages: [
              {
                role: 'user',
                content: 'Test connection. Please respond with "OK".'
              }
            ],
            temperature: 0.1,
            max_tokens: 10
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          return !!data.choices?.[0]?.message?.content;
        }
        return false;
      }
    } catch (error) {
      console.error('Errore connessione AI:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<AIModel[]> {
    try {
      if (this.settings.provider === 'openrouter') {
        // Per OpenRouter, restituiamo i modelli gratuiti predefiniti
        // In alternativa, possiamo fare una chiamata API per ottenere tutti i modelli
        return OPENROUTER_FREE_MODELS;
      } else {
        // Per OpenAI, restituiamo la lista predefinita
        return OPENAI_MODELS;
      }
    } catch (error) {
      console.error('Errore nel recupero modelli:', error);
      return [];
    }
  }

  async generateCompletion(prompt: string): Promise<string> {
    if (!this.settings.enabled) {
      throw new Error('AI non abilitata');
    }

    try {
      if (this.settings.provider === 'openrouter') {
        return await this.generateOpenRouterCompletion(prompt);
      } else {
        return await this.generateOpenAICompletion(prompt);
      }
    } catch (error) {
      console.error('Errore generazione AI:', error);
      throw error;
    }
  }

  private async generateOpenRouterCompletion(prompt: string): Promise<string> {
    // Debug: verifica che abbiamo la chiave
    if (!this.settings.openrouterApiKey) {
      throw new Error('Chiave API OpenRouter mancante. Verifica la configurazione.');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.openrouterApiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Thematic Analysis Tool'
      },
      body: JSON.stringify({
        model: this.settings.selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        throw new Error(`Errore di autenticazione OpenRouter (401). Verifica che la chiave API sia corretta e valida. Dettagli: ${errorText}`);
      }
      throw new Error(`Errore OpenRouter API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async generateOpenAICompletion(prompt: string): Promise<string> {
    // Debug: verifica che abbiamo la chiave
    if (!this.settings.openaiApiKey) {
      throw new Error('Chiave API OpenAI mancante. Verifica la configurazione.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.settings.selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        throw new Error(`Errore di autenticazione OpenAI (401). Verifica che la chiave API sia corretta e valida. Dettagli: ${errorText}`);
      }
      throw new Error(`Errore OpenAI API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async suggestLabelsForColumn(
    columnName: string, 
    responses: string[], 
    existingLabels: string[] = []
  ): Promise<AISuggestionResponse> {
    const sampleResponses = responses.slice(0, 20); // Limitiamo a 20 risposte per performance
    
    const prompt = `
Sei un esperto di analisi tematica qualitativa. 
Analizza le seguenti risposte alla domanda "${columnName}" e suggerisci delle etichette tematiche appropriate.

Risposte da analizzare:
${sampleResponses.map((resp, i) => `${i + 1}. ${resp}`).join('\n')}

Etichette già esistenti nel progetto:
${existingLabels.join(', ')}

Per favore, suggerisci 3-5 nuove etichette tematiche che potrebbero essere utili per categorizzare queste risposte.
Per ogni etichetta fornisci:
- Nome dell'etichetta (breve e descrittivo)
- Descrizione dettagliata
- Livello di confidenza (0-100)
- Ragionamento per la scelta

Rispondi in formato JSON:
{
  "suggestions": [
    {
      "name": "Nome Etichetta",
      "description": "Descrizione dettagliata dell'etichetta",
      "confidence": 85,
      "reasoning": "Spiegazione del perché questa etichetta è appropriata"
    }
  ],
  "generalAdvice": "Consigli generali per l'analisi di questa colonna"
}
`;

    try {
      const response = await this.generateCompletion(prompt);
      
      // Prova a parsare la risposta JSON
      try {
        const parsed = JSON.parse(response);
        return parsed;
      } catch (parseError) {
        // Se il parsing fallisce, crea una risposta di fallback
        console.warn('Risposta AI non in formato JSON valido:', response);
        return {
          suggestions: [
            {
              name: "Suggerimento AI",
              description: response.substring(0, 200) + "...",
              confidence: 50,
              reasoning: "Risposta AI elaborata ma non strutturata"
            }
          ],
          generalAdvice: "Rivedi le risposte manualmente per identificare pattern tematici."
        };
      }
    } catch (error) {
      console.error('Errore suggerimenti AI:', error);
      throw error;
    }
  }

  async getGeneralAdvice(context: string, question: string): Promise<string> {
    const prompt = `
Sei un assistente esperto in analisi tematica qualitativa per ricerche accademiche.

Contesto: ${context}
Domanda: ${question}

Fornisci un consiglio pratico e specifico per migliorare l'analisi. 
Mantieni la risposta concisa ma informativa (massimo 200 parole).
`;

    try {
      return await this.generateCompletion(prompt);
    } catch (error) {
      console.error('Errore consiglio AI:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();

// Esponiamo il servizio per debug dalla console del browser
if (typeof window !== 'undefined') {
  (window as any).aiService = aiService;
  console.log('AI Service is available at window.aiService for debugging');
}
