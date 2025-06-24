import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Target, CheckCircle, X, Brain, RefreshCw, ArrowRight } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useAnalysisStore } from '../store/analysisStore';
import { useToast } from '../hooks/use-toast';
import { AIErrorDiagnostic } from './AIErrorDiagnostic';

interface ResponseSuggestion {
  responseText: string;
  responseIndex: number;
  columnIndex: number;
  suggestedLabelId: string;
  confidence: number;
  reasoning: string;
}

export function AISuggestionAssistant() {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string>('');
  const [rawResponse, setRawResponse] = useState<string>('');
  const [autoMode, setAutoMode] = useState(false);
  
  const { excelData, labels, addCellLabel, cellLabels } = useAnalysisStore();
  const { toast } = useToast();

  const aiSettings = aiService.getSettings();

  const analyzeResponses = async () => {
    if (!aiSettings.enabled) {
      setError('AI non abilitata. Vai alla configurazione per attivarla.');
      return;
    }

    if (!selectedColumn) {
      setError('Seleziona una colonna da analizzare.');
      return;
    }

    if (labels.length === 0) {
      setError('Nessuna etichetta disponibile. Crea almeno un\'etichetta prima di procedere.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setSuggestions([]);
    setCurrentIndex(0);

    try {
      const columnIndex = excelData?.headers.findIndex(h => h === selectedColumn) ?? -1;
      if (columnIndex === -1) {
        throw new Error('Colonna non trovata');
      }

      const responses = excelData?.rows.map((row, index) => {
        const cellValue = row[columnIndex];
        const text = typeof cellValue === 'string' ? cellValue : String(cellValue || '');
        return { text, index };
      }).filter(r => r.text && typeof r.text === 'string' && r.text.trim()) ?? [];
      
      if (responses.length === 0) {
        throw new Error('Nessuna risposta trovata nella colonna selezionata');
      }

      // Analizza solo le prime 10 risposte per evitare sovraccarico
      const samplesToAnalyze = responses.slice(0, 10);

      console.log('🚀 Avvio analisi AI con pipeline robusta');
      
      // Usa la pipeline robusta
      const result = await aiService.suggestExistingLabelsRobust(
        labels,
        samplesToAnalyze
      );

      if (result.success && result.data) {
        const suggestionsWithText = (result.data.suggestions || [])
          .map((s: any) => {
            const responseData = samplesToAnalyze.find(r => r.index === s.responseIndex);
            return responseData ? {
              ...s,
              responseText: responseData.text,
              columnIndex,
            } : null;
          })
          .filter(Boolean) as ResponseSuggestion[];
        
        setSuggestions(suggestionsWithText);
        
        toast({
          title: "Analisi completata con successo! 🎉",
          description: `L'AI ha analizzato ${suggestionsWithText.length} risposte dopo ${result.attempts} tentativo/i.`,
        });
      } else {
        // Gestione più dettagliata degli errori AI
        const errorMessage = getDetailedErrorMessage(result.error, result.rawResponse);
        setRawResponse(result.rawResponse || '');
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error('Errore analisi AI:', err);
      
      // Feedback migliorato per l'utente
      const userFriendlyMessage = getUserFriendlyErrorMessage(err.message);
      setError(userFriendlyMessage);
      
      toast({
        title: "Errore nell'analisi AI",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Funzione helper per messaggi di errore dettagliati  
  const getDetailedErrorMessage = (error: string | undefined, rawResponse: string | undefined): string => {
    if (error?.includes('Impossibile parsare la risposta')) {
      return `L'AI ha fornito una risposta in formato non riconosciuto. Prova a:
• Riformulare il prompt più specificamente
• Verificare che il modello AI sia appropriato per questo tipo di analisi
• Ridurre il numero di risposte da analizzare`;
    }
    
    if (error?.includes('timeout') || error?.includes('network')) {
      return 'Problema di connessione con il servizio AI. Verifica la connessione e riprova.';
    }
    
    return error || 'La pipeline robusta non è riuscita ad analizzare le risposte';
  };

  // Funzione helper per messaggi user-friendly
  const getUserFriendlyErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes('formato non riconosciuto')) {
      return 'L\'AI ha difficoltà a comprendere questo tipo di contenuto. Prova con un dataset più semplice o verifica le impostazioni AI.';
    }
    
    if (errorMessage.includes('connessione')) {
      return 'Problema di connessione al servizio AI. Controlla le impostazioni nella sezione "AI Config".';
    }
    
    if (errorMessage.includes('parsare la risposta')) {
      return 'Risposta AI non valida. Il modello potrebbe non essere adatto per questo tipo di analisi.';
    }
    
    return errorMessage.length > 100 ? 
      'Errore nell\'analisi AI. Verifica le impostazioni e riprova.' : 
      errorMessage;
  };

  const getCurrentSuggestion = () => suggestions[currentIndex] || null;

  const acceptSuggestion = async () => {
    const suggestion = getCurrentSuggestion();
    if (!suggestion) return;

    const cellId = `${suggestion.responseIndex}-${suggestion.columnIndex}`;
    
    // Verifica se la cella è già etichettata
    const existingLabel = cellLabels.find(cl => cl.cellId === cellId);
    if (existingLabel && existingLabel.labelIds.includes(suggestion.suggestedLabelId)) {
      toast({
        title: "Etichetta già presente",
        description: "Questa cella ha già l'etichetta suggerita.",
        variant: "destructive",
      });
      nextSuggestion();
      return;
    }

    addCellLabel({
      cellId,
      rowIndex: suggestion.responseIndex,
      colIndex: suggestion.columnIndex,
      labelIds: [suggestion.suggestedLabelId],
    });

    const labelName = labels.find(l => l.id === suggestion.suggestedLabelId)?.name || 'Sconosciuta';
    
    toast({
      title: "Suggerimento accettato",
      description: `Etichetta "${labelName}" applicata alla risposta.`,
    });

    nextSuggestion();
  };

  const rejectSuggestion = () => {
    const suggestion = getCurrentSuggestion();
    if (!suggestion) return;

    toast({
      title: "Suggerimento rifiutato",
      description: "Passando al prossimo suggerimento.",
    });

    nextSuggestion();
  };

  const nextSuggestion = () => {
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Fine suggerimenti
      toast({
        title: "Suggerimenti completati",
        description: "Hai esaminato tutti i suggerimenti AI.",
      });
    }
  };

  const previousSuggestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const getLabelInfo = (labelId: string) => {
    return labels.find(l => l.id === labelId);
  };

  const autoAcceptHighConfidence = async () => {
    setAutoMode(true);
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence >= 85);
    
    for (const suggestion of highConfidenceSuggestions) {
      const cellId = `${suggestion.responseIndex}-${suggestion.columnIndex}`;
      const existingLabel = cellLabels.find(cl => cl.cellId === cellId);
      
      if (!existingLabel || !existingLabel.labelIds.includes(suggestion.suggestedLabelId)) {
        addCellLabel({
          cellId,
          rowIndex: suggestion.responseIndex,
          colIndex: suggestion.columnIndex,
          labelIds: [suggestion.suggestedLabelId],
        });
      }
    }
    
    toast({
      title: "Auto-applicazione completata",
      description: `Applicate ${highConfidenceSuggestions.length} etichette con alta confidenza.`,
    });
    
    setAutoMode(false);
  };

  if (!aiSettings.enabled) {
    return (
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          L'AI non è abilitata. Vai alla scheda "AI Config" per configurare OpenRouter o OpenAI.
        </AlertDescription>
      </Alert>
    );
  }

  const currentSuggestion = getCurrentSuggestion();
  const labelInfo = currentSuggestion ? getLabelInfo(currentSuggestion.suggestedLabelId) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Assistente AI per Suggerimenti Etichette
        </CardTitle>
        <CardDescription>
          L'AI analizza le risposte e suggerisce quale etichetta esistente applicare
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configurazione */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Colonna da analizzare:</label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una colonna" />
              </SelectTrigger>
              <SelectContent>
                {excelData?.headers.map((header, index) => (
                  <SelectItem key={index} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={analyzeResponses}
              disabled={isAnalyzing || !selectedColumn}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizzando...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analizza e Suggerisci
                </>
              )}
            </Button>

            {suggestions.length > 0 && (
              <Button
                variant="outline"
                onClick={autoAcceptHighConfidence}
                disabled={autoMode}
              >
                {autoMode ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Auto-Applica (≥85%)
              </Button>
            )}
          </div>
        </div>

        {/* Errori con diagnostica migliorata */}
        {error && (
          <AIErrorDiagnostic 
            error={error}
            rawResponse={rawResponse}
            onRetry={analyzeResponses}
            onConfigureAI={() => {
              // Redirect to AI config (implementare se necessario)
              toast({
                title: "Configurazione AI",
                description: "Vai alla sezione 'AI Config' per configurare le impostazioni AI."
              });
            }}
          />
        )}

        {/* Suggerimenti */}
        {suggestions.length > 0 && currentSuggestion && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Suggerimento {currentIndex + 1} di {suggestions.length}
              </h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousSuggestion}
                  disabled={currentIndex === 0}
                >
                  ← Precedente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSuggestion}
                  disabled={currentIndex === suggestions.length - 1}
                >
                  Successivo →
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              {/* Risposta da etichettare */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Risposta (Riga {currentSuggestion.responseIndex + 1}):
                </label>
                <div className="mt-1 p-3 bg-muted/50 rounded border text-sm">
                  "{currentSuggestion.responseText}"
                </div>
              </div>

              {/* Etichetta suggerita */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Etichetta suggerita:
                </label>
                <div className="mt-2 flex items-center gap-3">
                  {labelInfo && (
                    <>
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: labelInfo.color }}
                      />
                      <span className="font-medium">{labelInfo.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={getConfidenceColor(currentSuggestion.confidence)}
                      >
                        {currentSuggestion.confidence}% confidenza
                      </Badge>
                    </>
                  )}
                </div>
                
                {labelInfo?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {labelInfo.description}
                  </p>
                )}
              </div>

              {/* Ragionamento AI */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ragionamento AI:
                </label>
                <p className="text-sm mt-1 italic text-gray-600">
                  {currentSuggestion.reasoning}
                </p>
              </div>

              {/* Azioni */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={acceptSuggestion}
                  className="flex-1"
                  variant="default"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accetta Suggerimento
                </Button>
                <Button
                  onClick={rejectSuggestion}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Rifiuta
                </Button>
              </div>
            </div>

            {/* Progresso */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / suggestions.length) * 100}%` }}
                />
              </div>
              <span>{Math.round(((currentIndex + 1) / suggestions.length) * 100)}%</span>
            </div>
          </div>
        )}

        {/* Stato vuoto */}
        {!isAnalyzing && suggestions.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Seleziona una colonna e clicca su "Analizza e Suggerisci"</p>
            <p className="text-sm mt-1">L'AI esaminerà le risposte e suggerirà etichette appropriate</p>
          </div>
        )}

        {/* Suggerimenti completati */}
        {suggestions.length > 0 && currentIndex >= suggestions.length - 1 && currentIndex > 0 && (
          <div className="text-center py-6 border-t">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="font-medium">Tutti i suggerimenti esaminati!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Puoi analizzare un'altra colonna o rivedere i suggerimenti precedenti
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
