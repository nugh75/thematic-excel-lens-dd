import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Sparkles, Plus, Brain, CheckCircle } from 'lucide-react';
import { aiService, type LabelSuggestion } from '../services/aiService';
import { useAnalysisStore } from '../store/analysisStore';
import { useToast } from '../hooks/use-toast';

export function AILabelGenerator() {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<(LabelSuggestion & { selected: boolean })[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const { excelData, labels, addLabel } = useAnalysisStore();
  const { toast } = useToast();

  const aiSettings = aiService.getSettings();

  const defaultPrompts = [
    'Crea etichette per categorizzare le risposte in base ai temi principali emersi',
    'Identifica pattern emotivi nelle risposte e crea etichette appropriate',
    'Analizza le risposte e crea etichette basate sui problemi o bisogni identificati',
    'Classifica le risposte in base al livello di soddisfazione o gradimento',
    'Identifica categorie demografiche o comportamentali nelle risposte',
    'Crea etichette per tematiche positive e negative nelle risposte'
  ];

  const generateLabels = async () => {
    if (!aiSettings.enabled) {
      setError('AI non abilitata. Vai alla configurazione per attivarla.');
      return;
    }

    if (!selectedColumn) {
      setError('Seleziona una colonna da analizzare.');
      return;
    }

    if (!userPrompt.trim()) {
      setError('Inserisci un prompt per guidare la generazione delle etichette.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuggestions([]);

    try {
      const columnIndex = excelData?.headers.findIndex(h => h === selectedColumn) ?? -1;
      if (columnIndex === -1) {
        throw new Error('Colonna non trovata');
      }

      const responses = excelData?.rows.map(row => {
        const cellValue = row[columnIndex];
        return typeof cellValue === 'string' ? cellValue : String(cellValue || '');
      }).filter(r => r && typeof r === 'string' && r.trim()) ?? [];
      
      if (responses.length === 0) {
        throw new Error('Nessuna risposta trovata nella colonna selezionata');
      }

      const customPrompt = `
${userPrompt}

Analizza le seguenti risposte e crea 5-8 etichette tematiche specifiche basate sulla richiesta dell'utente.

Risposte da analizzare:
${responses.slice(0, 30).map((resp, i) => `${i + 1}. ${resp}`).join('\n')}

Etichette già esistenti nel progetto (evita duplicati):
${labels.map(l => l.name).join(', ')}

Rispondi in formato JSON:
{
  "suggestions": [
    {
      "name": "Nome Etichetta",
      "description": "Descrizione dettagliata dell'etichetta e quando usarla",
      "confidence": 85,
      "reasoning": "Ragionamento basato sui dati analizzati e il prompt dell'utente"
    }
  ],
  "generalAdvice": "Consigli per l'uso di queste etichette nell'analisi"
}`;

      const response = await aiService.generateCompletion(customPrompt);
      
      try {
        const parsed = JSON.parse(response);
        const suggestionsWithSelection = (parsed.suggestions || []).map((s: LabelSuggestion) => ({
          ...s,
          selected: false
        }));
        
        setSuggestions(suggestionsWithSelection);
        
        toast({
          title: "Etichette generate",
          description: `L'AI ha generato ${suggestionsWithSelection.length} etichette basate sul tuo prompt.`,
        });
      } catch (parseError) {
        throw new Error('Risposta AI non valida. Riprova con un prompt diverso.');
      }
    } catch (err: any) {
      console.error('Errore generazione etichette:', err);
      setError(err.message || 'Errore durante la generazione delle etichette.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelection = (index: number) => {
    setSuggestions(prev => prev.map((s, i) => 
      i === index ? { ...s, selected: !s.selected } : s
    ));
  };

  const selectAll = () => {
    setSuggestions(prev => prev.map(s => ({ ...s, selected: true })));
  };

  const selectNone = () => {
    setSuggestions(prev => prev.map(s => ({ ...s, selected: false })));
  };

  const createSelectedLabels = () => {
    const selectedSuggestions = suggestions.filter(s => s.selected);
    
    if (selectedSuggestions.length === 0) {
      toast({
        title: "Nessuna etichetta selezionata",
        description: "Seleziona almeno una etichetta da creare.",
        variant: "destructive",
      });
      return;
    }

    let createdCount = 0;
    selectedSuggestions.forEach(suggestion => {
      const newLabel = {
        id: Date.now().toString() + Math.random(),
        name: suggestion.name,
        description: suggestion.description,
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
      };
      
      addLabel(newLabel);
      createdCount++;
    });

    toast({
      title: "Etichette create",
      description: `${createdCount} nuove etichette sono state aggiunte al progetto.`,
    });

    // Reset dopo creazione
    setSuggestions([]);
    setUserPrompt('');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Generatore AI di Etichette
        </CardTitle>
        <CardDescription>
          Utilizza l'AI per generare automaticamente etichette personalizzate basate sui tuoi dati
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selezione colonna */}
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

        {/* Prompt personalizzato */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Prompt personalizzato (descrivi che tipo di etichette vuoi):
          </label>
          <Textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Es: Crea etichette per categorizzare le risposte in base ai sentimenti espressi..."
            rows={3}
          />
          
          {/* Prompt suggeriti */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Prompt suggeriti:</label>
            <div className="flex flex-wrap gap-2">
              {defaultPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setUserPrompt(prompt)}
                  className="text-xs h-auto py-1 px-2"
                >
                  {prompt.substring(0, 50)}...
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Pulsante genera */}
        <Button
          onClick={generateLabels}
          disabled={isGenerating || !selectedColumn || !userPrompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando etichette...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Genera Etichette AI
            </>
          )}
        </Button>

        {/* Errori */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Risultati */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Etichette generate ({suggestions.length})</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Seleziona tutto
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  Deseleziona tutto
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-colors ${
                    suggestion.selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={suggestion.selected}
                      onCheckedChange={() => toggleSelection(index)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{suggestion.name}</h5>
                        <Badge 
                          variant="secondary" 
                          className={getConfidenceColor(suggestion.confidence)}
                        >
                          {suggestion.confidence}% confidenza
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                      
                      <p className="text-xs text-gray-600 italic">
                        <strong>Ragionamento:</strong> {suggestion.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {suggestions.some(s => s.selected) && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">
                  {suggestions.filter(s => s.selected).length} etichette selezionate
                </span>
                <Button onClick={createSelectedLabels}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Etichette Selezionate
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Stato vuoto */}
        {!isGenerating && suggestions.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Configura i parametri e clicca su "Genera Etichette AI"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
