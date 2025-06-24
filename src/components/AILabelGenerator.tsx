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
import AIPipelineStatus from './AIPipelineStatus';

export function AILabelGenerator() {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<(LabelSuggestion & { selected: boolean })[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineState, setPipelineState] = useState({
    currentAttempt: 1,
    maxAttempts: 3,
    stage: '',
    success: false
  });
  const [error, setError] = useState<string>('');
  const { excelData, labels, addLabel } = useAnalysisStore();
  const { toast } = useToast();

  const aiSettings = aiService.getSettings();

  const defaultPrompts = [
    'Crea etichette per categorizzare le risposte in base ai temi principali emersi. Identifica i macro-argomenti e le categorie tematiche ricorrenti.',
    'Identifica pattern emotivi nelle risposte e crea etichette appropriate per emozioni, sentimenti e stati d\'animo espressi (es: gioia, frustrazione, soddisfazione, preoccupazione).',
    'Analizza le risposte e crea etichette basate sui problemi, bisogni, criticità o richieste specifiche identificate nelle risposte.',
    'Classifica le risposte in base al livello di soddisfazione, gradimento o valutazione espressa (es: molto soddisfatto, parzialmente soddisfatto, insoddisfatto).',
    'Identifica categorie demografiche, comportamentali o caratteristiche degli utenti che emergono dalle risposte (es: età, esperienza, ruolo, competenze).',
    'Crea etichette per distinguere feedback positivi, negativi, neutri e suggerimenti di miglioramento nelle risposte.',
    'Analizza le risposte per identificare priorità, urgenze o importanza relativa dei temi trattati.',
    'Categorizza le risposte in base al tipo di contenuto: opinioni personali, fatti oggettivi, proposte, domande, lamentele.'
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
    setPipelineState({
      currentAttempt: 1,
      maxAttempts: 3,
      stage: 'Preparazione dei dati...',
      success: false
    });

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

      console.log('🚀 Avvio generazione etichette con pipeline robusta');
      const existingLabelNames = labels.map(l => l.name);
      
      setPipelineState(prev => ({ ...prev, stage: 'Invio richiesta all\'AI...' }));
      
      // Usa la pipeline robusta
      const result = await aiService.generateLabelsRobust(
        userPrompt,
        responses,
        existingLabelNames
      );

      if (result.success && result.data) {
        setPipelineState(prev => ({ 
          ...prev, 
          stage: 'Elaborazione completata!',
          success: true,
          currentAttempt: result.attempts 
        }));

        const suggestionsWithSelection = (result.data.suggestions || []).map((s: LabelSuggestion) => ({
          ...s,
          selected: false
        }));
        
        setSuggestions(suggestionsWithSelection);
        
        toast({
          title: "Etichette generate con successo! 🎉",
          description: `L'AI ha generato ${suggestionsWithSelection.length} etichette dopo ${result.attempts} tentativo/i.`,
        });
      } else {
        throw new Error(result.error || 'La pipeline robusta non è riuscita a generare etichette valide');
      }
    } catch (err: any) {
      console.error('Errore generazione etichette:', err);
      setError(err.message || 'Errore durante la generazione delle etichette.');
      setPipelineState(prev => ({ ...prev, stage: 'Errore nella pipeline' }));
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
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
        tags: suggestion.tags || []
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
    if (confidence >= 80) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (confidence >= 60) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
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
    <div className="space-y-4">
      <AIPipelineStatus
        isProcessing={isGenerating}
        currentAttempt={pipelineState.currentAttempt}
        maxAttempts={pipelineState.maxAttempts}
        stage={pipelineState.stage}
        error={error}
        success={pipelineState.success}
      />
      
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
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Prompt suggeriti (clicca per usare):</label>
            <div className="space-y-2">
              {defaultPrompts.map((prompt, index) => (
                <div key={index} className="group">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserPrompt(prompt)}
                    className="w-full text-left justify-start h-auto py-3 px-4 whitespace-normal leading-relaxed hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    title={`Clicca per usare: ${prompt}`}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 break-words">
                        {prompt}
                      </span>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Suggerimento per l'utente */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">💡 Suggerimento:</p>
                  <p>
                    Puoi personalizzare questi prompt o scriverne uno completamente nuovo. 
                    Sii specifico su cosa vuoi categorizzare (es: emozioni, temi, problemi, etc.).
                  </p>
                </div>
              </div>
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

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                    suggestion.selected 
                      ? 'border-blue-300 bg-blue-50 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={suggestion.selected}
                      onCheckedChange={() => toggleSelection(index)}
                      className="mt-1 flex-shrink-0"
                    />
                    
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h5 className="font-medium text-gray-900 break-words flex-1">
                          {suggestion.name}
                        </h5>
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
                      
                      <div className="bg-gray-50 p-3 rounded border max-h-20 overflow-y-auto">
                        <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
                          {suggestion.description}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded border max-h-24 overflow-y-auto">
                        <div className="text-xs text-gray-700">
                          <span className="font-medium text-blue-800">Ragionamento AI:</span>
                          <p className="mt-1 italic break-words whitespace-pre-wrap leading-relaxed">
                            {suggestion.reasoning}
                          </p>
                        </div>
                      </div>
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
    </div>
  );
}
