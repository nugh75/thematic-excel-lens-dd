/**
 * Pipeline AI Robusta per Analisi Tematica
 * Sistema avanzato con retry automatico, fallback e parsing intelligente
 */

export interface AIProcessingResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  rawResponse?: string;
}

export interface AIRetryConfig {
  maxAttempts: number;
  delayMs: number;
  exponentialBackoff: boolean;
}

export interface AIPromptTemplate {
  systemMessage: string;
  userPromptTemplate: string;
  fallbackPrompt?: string;
  expectedFormat: string;
  validationRules: Array<(data: any) => boolean>;
}

class RobustAIPipeline {
  private defaultRetryConfig: AIRetryConfig = {
    maxAttempts: 3,
    delayMs: 1000,
    exponentialBackoff: true
  };

  /**
   * Esegue una richiesta AI con retry automatico e fallback
   */
  async processWithRetry<T>(
    aiService: any,
    promptTemplate: AIPromptTemplate,
    promptData: Record<string, any>,
    retryConfig?: Partial<AIRetryConfig>
  ): Promise<AIProcessingResult<T>> {
    const config = { ...this.defaultRetryConfig, ...retryConfig };
    let lastError = '';
    let rawResponse = '';

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        console.log(`🔄 Tentativo AI ${attempt}/${config.maxAttempts}`);
        
        // Costruisci il prompt
        const prompt = this.buildPrompt(promptTemplate, promptData, attempt);
        
        // Esegui la richiesta
        rawResponse = await aiService.generateCompletion(prompt);
        
        // Log dettagliato per debug
        console.log(`📥 Risposta AI (tentativo ${attempt}):`, {
          length: rawResponse.length,
          firstChars: rawResponse.substring(0, 200),
          containsJson: rawResponse.includes('{') && rawResponse.includes('}'),
          containsMarkdown: rawResponse.includes('```')
        });
        
        // Prova il parsing
        const parseResult = this.parseAIResponse(rawResponse, promptTemplate);
        
        if (parseResult.success) {
          console.log(`✅ Parsing riuscito al tentativo ${attempt}`);
          return {
            success: true,
            data: parseResult.data,
            attempts: attempt,
            rawResponse
          };
        } else {
          lastError = parseResult.error || 'Parsing fallito';
          console.warn(`⚠️ Parsing fallito al tentativo ${attempt}: ${lastError}`);
        }
      } catch (error: any) {
        lastError = error.message || 'Errore di rete';
        console.error(`❌ Errore al tentativo ${attempt}:`, error);
      }

      // Aspetta prima del prossimo tentativo (eccetto l'ultimo)
      if (attempt < config.maxAttempts) {
        const delay = config.exponentialBackoff 
          ? config.delayMs * Math.pow(2, attempt - 1)
          : config.delayMs;
        console.log(`⏳ Attendo ${delay}ms prima del prossimo tentativo...`);
        await this.sleep(delay);
      }
    }

    // Se tutti i tentativi falliscono, prova il fallback
    if (promptTemplate.fallbackPrompt) {
      console.log(`🔄 Provo con prompt di fallback...`);
      try {
        const fallbackPrompt = this.buildFallbackPrompt(promptTemplate, promptData);
        rawResponse = await aiService.generateCompletion(fallbackPrompt);
        
        const parseResult = this.parseAIResponse(rawResponse, promptTemplate);
        if (parseResult.success) {
          console.log(`✅ Fallback riuscito`);
          return {
            success: true,
            data: parseResult.data,
            attempts: config.maxAttempts + 1,
            rawResponse
          };
        }
      } catch (fallbackError) {
        console.error(`❌ Anche il fallback è fallito:`, fallbackError);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: config.maxAttempts,
      rawResponse
    };
  }

  /**
   * Costruisce il prompt basandosi sul template e sui dati
   */
  private buildPrompt(
    template: AIPromptTemplate, 
    data: Record<string, any>, 
    attempt: number
  ): string {
    let prompt = template.userPromptTemplate;
    
    // Sostituisci le variabili nel template
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Aggiungi istruzioni più stringenti per tentativi successivi
    if (attempt > 1) {
      prompt += `\n\n⚠️ IMPORTANTE (Tentativo ${attempt}): Il tentativo precedente ha fallito il parsing. Assicurati di rispondere ESCLUSIVAMENTE in formato JSON valido, senza testo aggiuntivo, commenti o formattazione markdown.`;
    }

    return prompt;
  }

  /**
   * Costruisce un prompt di fallback semplificato
   */
  private buildFallbackPrompt(template: AIPromptTemplate, data: Record<string, any>): string {
    if (!template.fallbackPrompt) return '';
    
    let prompt = template.fallbackPrompt;
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return prompt;
  }

  /**
   * Parsing intelligente della risposta AI con multiple strategie
   */
  private parseAIResponse(response: string, template: AIPromptTemplate): { success: boolean; data?: any; error?: string } {
    console.log(`🔍 Inizio parsing della risposta...`);

    // Strategia 1: JSON diretto
    try {
      const parsed = JSON.parse(response);
      if (this.validateResponse(parsed, template)) {
        console.log(`✅ Parsing diretto riuscito`);
        return { success: true, data: parsed };
      } else {
        console.log(`❌ Validazione fallita per parsing diretto`);
      }
    } catch (error) {
      console.log(`❌ Parsing JSON diretto fallito:`, error);
    }

    // Strategia 2: Estrazione JSON con regex
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (this.validateResponse(parsed, template)) {
          console.log(`✅ Estrazione JSON riuscita`);
          return { success: true, data: parsed };
        }
      }
    } catch (error) {
      console.log(`❌ Estrazione JSON fallita:`, error);
    }

    // Strategia 3: Pulizia da markdown e caratteri speciali
    try {
      const cleaned = response
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
      
      const parsed = JSON.parse(cleaned);
      if (this.validateResponse(parsed, template)) {
        console.log(`✅ Pulizia markdown riuscita`);
        return { success: true, data: parsed };
      }
    } catch (error) {
      console.log(`❌ Pulizia markdown fallita:`, error);
    }

    // Strategia 4: Estrazione JSON bilanciato
    try {
      const extracted = this.extractBalancedJson(response);
      if (extracted) {
        const parsed = JSON.parse(extracted);
        if (this.validateResponse(parsed, template)) {
          console.log(`✅ Estrazione bilanciata riuscita`);
          return { success: true, data: parsed };
        }
      }
    } catch (error) {
      console.log(`❌ Estrazione bilanciata fallita:`, error);
    }

    // Strategia 5: Parsing parziale e ricostruzione
    try {
      const reconstructed = this.attemptReconstruction(response, template);
      if (reconstructed && this.validateResponse(reconstructed, template)) {
        console.log(`✅ Ricostruzione riuscita`);
        return { success: true, data: reconstructed };
      }
    } catch (error) {
      console.log(`❌ Ricostruzione fallita:`, error);
    }

    // Strategia 6: Creazione risposta di emergenza basata sul contenuto
    try {
      const emergencyResponse = this.createEmergencyResponse(response, template);
      if (emergencyResponse) {
        console.log(`⚡ Risposta di emergenza creata`);
        return { success: true, data: emergencyResponse };
      }
    } catch (error) {
      console.log(`❌ Risposta di emergenza fallita:`, error);
    }

    // Log dettagliato per debug
    console.error(`🚨 PARSING COMPLETO FALLITO`, {
      responseLength: response.length,
      responsePreview: response.substring(0, 500),
      templateExpectedFormat: template.expectedFormat
    });

    return { 
      success: false, 
      error: `Impossibile parsare la risposta AI. La risposta ricevuta non è in formato JSON valido. Preview: "${response.substring(0, 100)}..."` 
    };
  }

  /**
   * Estrae JSON bilanciato dalla risposta
   */
  private extractBalancedJson(text: string): string | null {
    const firstBrace = text.indexOf('{');
    if (firstBrace === -1) return null;

    let braceCount = 0;
    let i = firstBrace;

    for (; i < text.length; i++) {
      if (text[i] === '{') braceCount++;
      if (text[i] === '}') {
        braceCount--;
        if (braceCount === 0) break;
      }
    }

    return braceCount === 0 ? text.substring(firstBrace, i + 1) : null;
  }

  /**
   * Tenta di ricostruire JSON parziale
   */
  private attemptReconstruction(response: string, template: AIPromptTemplate): any | null {
    try {
      // Cerca pattern comuni e prova a ricostruire
      const lines = response.split('\n');
      let jsonLines: string[] = [];
      let inJson = false;

      for (const line of lines) {
        if (line.trim().startsWith('{')) inJson = true;
        if (inJson) jsonLines.push(line);
        if (line.trim().endsWith('}') && inJson) break;
      }

      if (jsonLines.length > 0) {
        const reconstructed = jsonLines.join('\n');
        return JSON.parse(reconstructed);
      }
    } catch (error) {
      console.log(`Ricostruzione fallita:`, error);
    }

    return null;
  }

  /**
   * Valida la risposta secondo le regole del template
   */
  private validateResponse(data: any, template: AIPromptTemplate): boolean {
    if (!data || typeof data !== 'object') return false;

    // Applica le regole di validazione
    for (const rule of template.validationRules) {
      if (!rule(data)) {
        console.log(`❌ Regola di validazione fallita`);
        return false;
      }
    }

    return true;
  }

  /**
   * Utility per aspettare
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Crea una risposta di emergenza quando il parsing fallisce completamente
   */
  private createEmergencyResponse(response: string, template: AIPromptTemplate): any | null {
    // Identifica il tipo di template per creare una risposta appropriata
    if (template.expectedFormat?.includes('suggestions array')) {
      // Per template di suggerimenti o generazione etichette
      const suggestions = this.extractSuggestionsFromText(response);
      
      if (suggestions.length > 0) {
        return {
          suggestions,
          generalAdvice: "Risposta estratta automaticamente. Verifica manualmente i risultati."
        };
      }
    }
    
    // Fallback generico per qualsiasi template
    return {
      error: "Risposta AI non interpretabile",
      rawContent: response.substring(0, 500),
      suggestions: [],
      generalAdvice: "L'AI ha fornito una risposta in formato non riconosciuto. Prova a riformulare il prompt."
    };
  }

  /**
   * Estrae suggerimenti dal testo libero quando il JSON non è disponibile
   */
  private extractSuggestionsFromText(text: string): any[] {
    const suggestions: any[] = [];
    
    // Cerca pattern comuni per nomi di etichette
    const labelPatterns = [
      /(?:nome|titolo|etichetta):\s*["']?([^"'\n]+)["']?/gi,
      /(?:tema|categoria):\s*["']?([^"'\n]+)["']?/gi,
      /["']([^"']+)["']\s*-\s*[^.\n]{10,}/gi,
      /^\d+\.\s*([^-\n]{3,30})/gm
    ];
    
    let suggestionIndex = 0;
    
    for (const pattern of labelPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null && suggestions.length < 5) {
        const name = match[1]?.trim();
        if (name && name.length > 2 && name.length < 50) {
          suggestions.push({
            name: name,
            description: `Estratto automaticamente dal contenuto: "${name}"`,
            confidence: 60,
            reasoning: "Etichetta identificata tramite pattern recognition nel testo"
          });
          suggestionIndex++;
        }
      }
    }
    
    // Se non troviamo niente, creiamo un suggerimento generico
    if (suggestions.length === 0) {
      suggestions.push({
        name: "Tema Identificato",
        description: "Contenuto rilevato ma formato non riconosciuto",
        confidence: 40,
        reasoning: "Creato automaticamente per preservare il contenuto AI"
      });
    }
    
    return suggestions;
  }
}

export const robustAIPipeline = new RobustAIPipeline();
