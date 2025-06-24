
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Brain, Lightbulb, TrendingUp, Zap } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { mlEngine, SuggestionResult } from '../utils/mlSuggestions';
import { toast } from '@/hooks/use-toast';

const SuggestionPanel = () => {
  const { excelData, labels, cellLabels, rowLabels, addCellLabel, addRowLabel } = useAnalysisStore();
  const [suggestions, setSuggestions] = useState<SuggestionResult[]>([]);
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);

  useEffect(() => {
    if (excelData && labels.length > 0) {
      // Addestra il motore ML
      mlEngine.trainFromExistingLabels(cellLabels, rowLabels, labels, excelData);
      
      if (autoSuggest && selectedCell) {
        generateSuggestions();
      }
    }
  }, [excelData, labels, cellLabels, rowLabels, selectedCell, autoSuggest]);

  const generateSuggestions = () => {
    if (!selectedCell || !excelData) return;
    
    const cellSuggestions = mlEngine.suggestLabelsForCell(
      selectedCell.row, 
      selectedCell.col, 
      excelData, 
      labels
    );
    
    const rowSuggestions = mlEngine.suggestLabelsForRow(
      selectedCell.row, 
      excelData, 
      labels
    );
    
    setSuggestions([...cellSuggestions, ...rowSuggestions]);
  };

  const applySuggestion = (suggestion: SuggestionResult) => {
    if (suggestion.cellId) {
      addCellLabel({
        cellId: suggestion.cellId,
        rowIndex: selectedCell?.row || 0,
        colIndex: selectedCell?.col || 0,
        labelIds: suggestion.suggestedLabels
      });
    } else if (suggestion.rowIndex !== undefined) {
      addRowLabel({
        rowIndex: suggestion.rowIndex,
        labelIds: suggestion.suggestedLabels
      });
    }
    
    toast({
      title: "Suggerimento applicato",
      description: "Etichetta aggiunta con successo",
    });
    
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const getLabelName = (labelId: string) => {
    return labels.find(l => l.id === labelId)?.name || 'Etichetta sconosciuta';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'bg-green-500';
    if (confidence > 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Suggerimenti AI
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Auto-suggerimenti</span>
            <Switch 
              checked={autoSuggest} 
              onCheckedChange={setAutoSuggest}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!selectedCell ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Seleziona una cella per ricevere suggerimenti</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun suggerimento disponibile</p>
            <Button 
              variant="outline" 
              onClick={generateSuggestions}
              className="mt-2"
            >
              Genera Suggerimenti
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Cella {selectedCell.row + 1}-{selectedCell.col + 1}
              </span>
            </div>
            
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {suggestion.suggestedLabels.map(labelId => (
                      <Badge key={labelId} variant="secondary" className="text-xs">
                        {getLabelName(labelId)}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div 
                      className={`w-2 h-2 rounded-full ${getConfidenceColor(suggestion.confidence)}`}
                      title={`Confidenza: ${(suggestion.confidence * 100).toFixed(1)}%`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {(suggestion.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-2 rounded text-sm text-muted-foreground max-h-20 overflow-y-auto">
                  <p className="break-words">{suggestion.reason}</p>
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => applySuggestion(suggestion)}
                  className="w-full"
                >
                  Applica Suggerimento
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionPanel;
