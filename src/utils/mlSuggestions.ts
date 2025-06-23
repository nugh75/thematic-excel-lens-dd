
export interface SuggestionResult {
  cellId?: string;
  rowIndex?: number;
  suggestedLabels: string[];
  confidence: number;
  reason: string;
}

export class MLSuggestionEngine {
  private labelPatterns: Map<string, string[]> = new Map();
  private textSimilarity: Map<string, number> = new Map();

  trainFromExistingLabels(cellLabels: any[], rowLabels: any[], labels: any[], excelData: any) {
    // Analizza pattern testuali per suggerimenti
    cellLabels.forEach(cl => {
      const [rowIndex, colIndex] = cl.cellId.split('-').map(Number);
      const cellValue = excelData.rows[rowIndex]?.[colIndex]?.toString().toLowerCase() || '';
      
      cl.labelIds.forEach((labelId: string) => {
        const label = labels.find(l => l.id === labelId);
        if (label && cellValue) {
          if (!this.labelPatterns.has(label.id)) {
            this.labelPatterns.set(label.id, []);
          }
          this.labelPatterns.get(label.id)!.push(cellValue);
        }
      });
    });
  }

  calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  suggestLabelsForCell(rowIndex: number, colIndex: number, excelData: any, labels: any[]): SuggestionResult[] {
    const cellValue = excelData.rows[rowIndex]?.[colIndex];
    const cellText = typeof cellValue === 'string' ? cellValue : String(cellValue || '');
    const suggestions: SuggestionResult[] = [];
    
    if (!cellText || !cellText.trim()) return suggestions;
    
    // Suggerimenti basati su pattern testuali
    this.labelPatterns.forEach((patterns, labelId) => {
      let maxSimilarity = 0;
      let bestMatch = '';
      
      patterns.forEach(pattern => {
        const similarity = this.calculateTextSimilarity(cellText, pattern);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestMatch = pattern;
        }
      });
      
      if (maxSimilarity > 0.3) {
        suggestions.push({
          cellId: `${rowIndex}-${colIndex}`,
          suggestedLabels: [labelId],
          confidence: maxSimilarity,
          reason: `Simile a "${bestMatch}" (${(maxSimilarity * 100).toFixed(1)}% match)`
        });
      }
    });
    
    // Suggerimenti basati su parole chiave
    const keywordSuggestions = this.suggestByKeywords(cellText, labels);
    suggestions.push(...keywordSuggestions.map(s => ({
      ...s,
      cellId: `${rowIndex}-${colIndex}`
    })));
    
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  suggestByKeywords(text: string, labels: any[]): SuggestionResult[] {
    const suggestions: SuggestionResult[] = [];
    const lowerText = text.toLowerCase();
    
    labels.forEach(label => {
      const keywords = label.name.toLowerCase().split(/\s+/);
      let matches = 0;
      
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          matches++;
        }
      });
      
      if (matches > 0) {
        const confidence = matches / keywords.length;
        suggestions.push({
          suggestedLabels: [label.id],
          confidence,
          reason: `Contiene parole chiave di "${label.name}"`
        });
      }
    });
    
    return suggestions;
  }

  suggestLabelsForRow(rowIndex: number, excelData: any, labels: any[]): SuggestionResult[] {
    const rowData = excelData.rows[rowIndex] || [];
    const rowText = rowData.map(cell => {
      return typeof cell === 'string' ? cell : String(cell || '');
    }).join(' ').toLowerCase();
    
    if (!rowText || !rowText.trim()) return [];
    
    const suggestions = this.suggestByKeywords(rowText, labels);
    
    return suggestions.map(s => ({
      ...s,
      rowIndex
    })).sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  getPatternInsights(): { [labelId: string]: { commonWords: string[], frequency: number } } {
    const insights: { [labelId: string]: { commonWords: string[], frequency: number } } = {};
    
    this.labelPatterns.forEach((patterns, labelId) => {
      const allWords = patterns.join(' ').toLowerCase().split(/\s+/);
      const wordCount: { [word: string]: number } = {};
      
      allWords.forEach(word => {
        if (word.length > 2) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
      
      const commonWords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
      
      insights[labelId] = {
        commonWords,
        frequency: patterns.length
      };
    });
    
    return insights;
  }
}

export const mlEngine = new MLSuggestionEngine();
