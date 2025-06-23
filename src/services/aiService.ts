export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export type AIProvider = 'ollama' | 'openai';

export interface AISettings {
  provider: AIProvider;
  ollamaUrl: string;
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
export const OLLAMA_MODELS = [
  'llama3',
  'llama2',
  'mistral',
  'codellama',
  'qwen2.5:7b',
  'mixtral:8x7b',
  'phi3',
  'gemma2'
];

export const OPENAI_MODELS = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'gpt-4o',
  'gpt-4o-mini'
];

class AIService {
  private settings: AISettings = {
    provider: 'ollama',
    ollamaUrl: 'http://localhost:11434',
    openaiApiKey: '',
    selectedModel: 'llama3',
    enabled: false
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const saved = localStorage.getItem('ai-settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
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

  async testConnection(): Promise<boolean> {
    try {
      if (this.settings.provider === 'ollama') {
        const response = await fetch(`${this.settings.ollamaUrl}/api/tags`);
        return response.ok;
      } else {
        // Test OpenAI
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${this.settings.openaiApiKey}`,
          },
        });
        return response.ok;
      }
    } catch (error) {
      console.error('Errore connessione AI:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      if (this.settings.provider === 'ollama') {
        const response = await fetch(`${this.settings.ollamaUrl}/api/tags`);
        if (!response.ok) throw new Error('Errore nel recupero modelli Ollama');
        
        const data = await response.json();
        return data.models || [];
      } else {
        // Per OpenAI, restituiamo la lista predefinita
        return OPENAI_MODELS.map(name => ({
          name,
          size: 0,
          digest: '',
          modified_at: new Date().toISOString()
        }));
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
      if (this.settings.provider === 'ollama') {
        return await this.generateOllamaCompletion(prompt);
      } else {
        return await this.generateOpenAICompletion(prompt);
      }
    } catch (error) {
      console.error('Errore generazione AI:', error);
      throw error;
    }
  }

  private async generateOllamaCompletion(prompt: string): Promise<string> {
    const response = await fetch(`${this.settings.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.settings.selectedModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Errore Ollama API: ${response.status}`);
    }

    const data = await response.json();
    return data.response || '';
  }

  private async generateOpenAICompletion(prompt: string): Promise<string> {
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
      throw new Error(`Errore OpenAI API: ${response.status}`);
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
