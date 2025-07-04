import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Sparkles, CheckCircle, XCircle, Plus } from 'lucide-react';
import { aiService, type LabelSuggestion } from '../services/aiService';
import { useAnalysisStore } from '../store/analysisStore';
import { useToast } from '../hooks/use-toast';

interface AISuggestionsProps {
  columnName: string;
  responses: string[];
  onLabelCreated?: () => void;
}

export function AISuggestions({ columnName, responses, onLabelCreated }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<LabelSuggestion[]>([]);
  const [generalAdvice, setGeneralAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { labels, addLabel } = useAnalysisStore();
  const { toast } = useToast();

  const aiSettings = aiService.getSettings();

  const generateSuggestions = async () => {
    if (!aiSettings.enabled) {
      setError('AI non abilitata. Vai alle impostazioni per configurarla.');
      return;
    }

    if (responses.length === 0) {
      setError('Nessuna risposta disponibile per generare suggerimenti.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuggestions([]);
    setGeneralAdvice('');

    try {
      const existingLabelNames = labels.map(label => label.name);
      const result = await aiService.suggestLabelsForColumn(
        columnName,
        responses.filter(r => r && typeof r === 'string' && r.trim()),
        existingLabelNames
      );

      setSuggestions(result.suggestions || []);
      setGeneralAdvice(result.generalAdvice || '');

      toast({
        title: "Suggerimenti generati",
        description: `Trovati ${result.suggestions?.length || 0} suggerimenti per la colonna "${columnName}".`,
      });
    } catch (err) {
      console.error('Errore generazione suggerimenti:', err);
      setError('Errore durante la generazione dei suggerimenti. Verifica la connessione a Ollama.');
    } finally {
      setIsLoading(false);
    }
  };

  const createLabelFromSuggestion = (suggestion: LabelSuggestion) => {
    const newLabel = {
      id: Date.now().toString(),
      name: suggestion.name,
      description: suggestion.description,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      tags: suggestion.tags || []
    };

    addLabel(newLabel);

    toast({
      title: "Etichetta creata",
      description: `L'etichetta "${suggestion.name}" è stata aggiunta al progetto.`,
    });

    onLabelCreated?.();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredResponses = responses.filter(r => r && typeof r === 'string' && r.trim());

  if (!aiSettings.enabled) {
    return (
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          L'assistenza AI non è abilitata. Vai alle impostazioni per configurare Ollama.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Suggerimenti AI per Etichette
        </CardTitle>
        <CardDescription>
          Analizza le risposte della colonna "{columnName}" per suggerire etichette tematiche appropriate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informazioni colonna */}
        <div className="text-sm text-muted-foreground">
          <strong>Risposte da analizzare:</strong> {filteredResponses.length}
          {filteredResponses.length > 20 && " (analizzando le prime 20)"}
        </div>

        {/* Pulsante genera suggerimenti */}
        <Button
          onClick={generateSuggestions}
          disabled={isLoading || filteredResponses.length === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando suggerimenti...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Genera Suggerimenti AI
            </>
          )}
        </Button>

        {/* Errori */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Consiglio generale */}
        {generalAdvice && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <strong className="text-blue-800">Consiglio AI:</strong>
            </div>
            <div className="max-h-32 overflow-y-auto bg-white p-3 rounded border">
              <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                {generalAdvice}
              </p>
            </div>
          </div>
        )}

        {/* Suggerimenti */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Etichette Suggerite</h4>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-medium break-words">{suggestion.name}</h5>
                        <Badge 
                          variant="secondary" 
                          className={`${getConfidenceColor(suggestion.confidence)} flex-shrink-0`}
                        >
                          {suggestion.confidence}% confidenza
                        </Badge>
                      </div>
                      
                      {/* Visualizzazione tag */}
                      {suggestion.tags && suggestion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suggestion.tags.map((tag, tagIndex) => (
                            <Badge 
                              key={tagIndex} 
                              variant="outline" 
                              className="text-xs bg-green-50 border-green-200 text-green-700"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-2 rounded max-h-16 overflow-y-auto">
                        <p className="text-sm text-muted-foreground break-words">
                          {suggestion.description}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-2 rounded max-h-20 overflow-y-auto">
                        <p className="text-xs text-gray-700 italic break-words">
                          <strong>Ragionamento:</strong> {suggestion.reasoning}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => createLabelFromSuggestion(suggestion)}
                      className="flex-shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Aggiungi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stato vuoto */}
        {!isLoading && suggestions.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Clicca su "Genera Suggerimenti AI" per analizzare le risposte</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
