import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Brain, 
  Target, 
  Sparkles, 
  Info,
  Copy,
  CheckCircle 
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface SystemPrompts {
  labelGeneration: string;
  labelSuggestion: string;
  generalAdvice: string;
}

const DEFAULT_PROMPTS: SystemPrompts = {
  labelGeneration: `Sei un esperto in analisi tematica qualitativa. Il tuo compito è analizzare i dati forniti e generare etichette significative per categorizzare e codificare il contenuto.

ISTRUZIONI:
- Analizza attentamente il contenuto dei dati
- Genera etichette che catturano temi, pattern e significati chiave
- Le etichette devono essere specifiche ma non troppo granulari
- Usa un linguaggio chiaro e professionale
- Considera il contesto dell'analisi tematica qualitativa
- Fornisci una breve descrizione per ogni etichetta

FORMATO RISPOSTA:
Restituisci SOLO un array JSON valido di oggetti con questa struttura:
[
  {
    "name": "Nome etichetta",
    "description": "Descrizione dettagliata dell'etichetta",
    "reasoning": "Spiegazione del perché questa etichetta è rilevante"
  }
]`,

  labelSuggestion: `Sei un assistente AI specializzato in analisi tematica qualitativa. Il tuo compito è suggerire quale etichetta esistente si adatta meglio a specifiche risposte o contenuti.

ISTRUZIONI:
- Analizza il contenuto fornito nel contesto delle etichette disponibili
- Suggerisci l'etichetta più appropriata basandoti su:
  * Rilevanza tematica
  * Similarità semantica
  * Contesto dell'analisi qualitativa
- Fornisci un livello di confidenza (0-100)
- Spiega il ragionamento dietro la tua scelta
- Se nessuna etichetta è appropriata, indica "nessuna_corrispondenza"

FORMATO RISPOSTA:
Restituisci SOLO un oggetto JSON valido con questa struttura:
{
  "suggestedLabelId": "id_dell_etichetta_o_nessuna_corrispondenza",
  "confidence": 85,
  "reasoning": "Spiegazione dettagliata del perché questa etichetta è stata scelta"
}`,

  generalAdvice: `Sei un consulente esperto in metodologie di ricerca qualitativa e analisi tematica. Il tuo ruolo è fornire consigli strategici e metodologici per migliorare l'analisi dei dati.

FOCUS AREAS:
- Metodologie di codifica e categorizzazione
- Strategie per identificare pattern e temi
- Best practices per l'analisi tematica
- Suggerimenti per migliorare la qualità dell'analisi
- Consigli su strutturazione e organizzazione dei dati
- Approcci per validare e verificare i risultati

STILE:
- Professionale ma accessibile
- Basato su evidenze e metodologie consolidate
- Pratico e implementabile
- Considera le limitazioni e sfide reali dell'analisi qualitativa

Fornisci sempre risposte strutturate, actionable e contestualizzate ai dati specifici dell'utente.`
};

export function AISystemPromptConfig() {
  const [prompts, setPrompts] = useState<SystemPrompts>(DEFAULT_PROMPTS);
  const [activeTab, setActiveTab] = useState<keyof SystemPrompts>('labelGeneration');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = () => {
    const savedPrompts = localStorage.getItem('ai-system-prompts');
    if (savedPrompts) {
      try {
        const parsed = JSON.parse(savedPrompts);
        setPrompts({ ...DEFAULT_PROMPTS, ...parsed });
      } catch (error) {
        console.error('Errore nel caricamento dei prompt:', error);
        toast({
          title: "Errore di caricamento",
          description: "Impossibile caricare i prompt salvati. Utilizzando quelli predefiniti.",
          variant: "destructive",
        });
      }
    }
  };

  const savePrompts = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('ai-system-prompts', JSON.stringify(prompts));
      setHasChanges(false);
      toast({
        title: "Prompt salvati",
        description: "I prompt di sistema sono stati aggiornati con successo.",
      });
    } catch (error) {
      toast({
        title: "Errore di salvataggio",
        description: "Impossibile salvare i prompt di sistema.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = (promptType?: keyof SystemPrompts) => {
    if (promptType) {
      const newPrompts = { ...prompts, [promptType]: DEFAULT_PROMPTS[promptType] };
      setPrompts(newPrompts);
      setHasChanges(true);
      toast({
        title: "Prompt ripristinato",
        description: `Il prompt per ${getPromptDisplayName(promptType)} è stato ripristinato al valore predefinito.`,
      });
    } else {
      setPrompts(DEFAULT_PROMPTS);
      setHasChanges(true);
      toast({
        title: "Tutti i prompt ripristinati",
        description: "Tutti i prompt sono stati ripristinati ai valori predefiniti.",
      });
    }
  };

  const handlePromptChange = (promptType: keyof SystemPrompts, value: string) => {
    setPrompts(prev => ({ ...prev, [promptType]: value }));
    setHasChanges(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiato",
        description: "Prompt copiato negli appunti.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare il prompt.",
        variant: "destructive",
      });
    }
  };

  const getPromptDisplayName = (promptType: keyof SystemPrompts): string => {
    switch (promptType) {
      case 'labelGeneration': return 'Generazione Etichette';
      case 'labelSuggestion': return 'Suggerimento Etichette';
      case 'generalAdvice': return 'Consigli Generali';
      default: return '';
    }
  };

  const getPromptIcon = (promptType: keyof SystemPrompts) => {
    switch (promptType) {
      case 'labelGeneration': return <Sparkles className="h-4 w-4" />;
      case 'labelSuggestion': return <Target className="h-4 w-4" />;
      case 'generalAdvice': return <Brain className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getPromptDescription = (promptType: keyof SystemPrompts): string => {
    switch (promptType) {
      case 'labelGeneration': 
        return 'Configura come l\'AI genera nuove etichette per l\'analisi tematica';
      case 'labelSuggestion': 
        return 'Configura come l\'AI suggerisce etichette esistenti per specifici contenuti';
      case 'generalAdvice': 
        return 'Configura il comportamento dell\'AI quando fornisce consigli metodologici';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Configurazione Prompt di Sistema AI
          </CardTitle>
          <CardDescription>
            Personalizza i prompt di sistema per controllare il comportamento dell'AI nelle diverse funzioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasChanges && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Hai modifiche non salvate nei prompt di sistema.</span>
                <div className="flex gap-2">
                  <Button onClick={savePrompts} disabled={isSaving} size="sm">
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salva
                  </Button>
                  <Button onClick={() => resetToDefault()} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4" />
                    Ripristina Tutto
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof SystemPrompts)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="labelGeneration" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generazione
              </TabsTrigger>
              <TabsTrigger value="labelSuggestion" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Suggerimenti
              </TabsTrigger>
              <TabsTrigger value="generalAdvice" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Consigli
              </TabsTrigger>
            </TabsList>

            {Object.entries(prompts).map(([key, prompt]) => (
              <TabsContent key={key} value={key} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPromptIcon(key as keyof SystemPrompts)}
                        {getPromptDisplayName(key as keyof SystemPrompts)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyToClipboard(prompt)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => resetToDefault(key as keyof SystemPrompts)}
                          variant="outline"
                          size="sm"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {getPromptDescription(key as keyof SystemPrompts)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`prompt-${key}`}>Prompt di Sistema</Label>
                      <Textarea
                        id={`prompt-${key}`}
                        value={prompt}
                        onChange={(e) => handlePromptChange(key as keyof SystemPrompts, e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                        placeholder="Inserisci il prompt di sistema..."
                      />
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant={prompt === DEFAULT_PROMPTS[key as keyof SystemPrompts] ? "default" : "secondary"}>
                          {prompt === DEFAULT_PROMPTS[key as keyof SystemPrompts] ? "Predefinito" : "Personalizzato"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {prompt.length} caratteri
                        </span>
                      </div>
                      
                      {prompt !== DEFAULT_PROMPTS[key as keyof SystemPrompts] && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Modificato
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-between pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              I prompt personalizzati vengono salvati localmente nel browser
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button onClick={() => loadPrompts()} variant="outline">
                  Annulla Modifiche
                </Button>
              )}
              <Button onClick={savePrompts} disabled={!hasChanges || isSaving}>
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salva Tutti i Prompt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AISystemPromptConfig;
