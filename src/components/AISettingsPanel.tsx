import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle, Bot, Server, Cloud } from 'lucide-react';
import { aiService, type AISettings, type AIModel, OPENROUTER_FREE_MODELS, OPENAI_MODELS } from '../services/aiService';
import { useToast } from '../hooks/use-toast';

export function AISettingsPanel() {
  const [settings, setSettings] = useState<AISettings>(aiService.getSettings());
  const [models, setModels] = useState<AIModel[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (settings.enabled && connectionStatus === 'connected') {
      loadModels();
    }
  }, [settings.enabled, settings.provider, connectionStatus]);

  const handleSettingsChange = (key: keyof AISettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    
    // Se cambiamo provider, resettiamo il modello
    if (key === 'provider') {
      newSettings.selectedModel = value === 'openrouter' ? 'meta-llama/llama-3.1-8b-instruct:free' : 'gpt-3.5-turbo';
      setConnectionStatus('unknown');
      setModels([]);
    }
    
    setSettings(newSettings);
    aiService.updateSettings(newSettings);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await aiService.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
      if (isConnected) {
        toast({
          title: "Connessione riuscita",
          description: `${settings.provider.toUpperCase()} è raggiungibile e funzionante.`,
        });
      } else {
        toast({
          title: "Connessione fallita",
          description: `Impossibile raggiungere ${settings.provider.toUpperCase()}. Verifica la configurazione.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Errore di connessione",
        description: "Si è verificato un errore durante il test della connessione.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const availableModels = await aiService.getAvailableModels();
      setModels(availableModels);
      
      // Se non c'è un modello selezionato e ci sono modelli disponibili, seleziona il primo
      if (!settings.selectedModel && availableModels.length > 0) {
        handleSettingsChange('selectedModel', availableModels[0].id);
      }
    } catch (error) {
      toast({
        title: "Errore caricamento modelli",
        description: "Impossibile recuperare i modelli disponibili.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const ConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bot className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Configurazione AI
        </CardTitle>
        <CardDescription>
          Configura l'integrazione con OpenRouter (modelli gratuiti) o OpenAI (cloud premium)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Abilitazione AI */}
        <div className="flex items-center space-x-2">
          <Switch
            id="ai-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => handleSettingsChange('enabled', enabled)}
          />
          <Label htmlFor="ai-enabled">Abilita assistenza AI</Label>
        </div>

        {settings.enabled && (
          <>
            {/* Selezione Provider */}
            <div className="space-y-2">
              <Label htmlFor="provider-select">Provider AI</Label>
              <Select
                value={settings.provider}
                onValueChange={(value: 'openrouter' | 'openai') => handleSettingsChange('provider', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openrouter">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      OpenRouter (Modelli Gratuiti)
                    </div>
                  </SelectItem>
                  <SelectItem value="openai">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      OpenAI (Premium)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.provider === 'openrouter' 
                  ? 'OpenRouter offre accesso a modelli AI gratuiti inclusi Llama, Mistral e altri'
                  : 'OpenAI offre modelli premium GPT-4 e GPT-3.5 (richiede API key e crediti)'
                }
              </p>
            </div>

            {/* Configurazione OpenRouter */}
            {settings.provider === 'openrouter' && (
              <div className="space-y-2">
                <Label htmlFor="openrouter-key">API Key OpenRouter</Label>
                <div className="flex space-x-2">
                  <Input
                    id="openrouter-key"
                    type="password"
                    value={settings.openrouterApiKey}
                    onChange={(e) => handleSettingsChange('openrouterApiKey', e.target.value)}
                    placeholder="sk-or-..."
                  />
                  <Button
                    onClick={testConnection}
                    disabled={isTestingConnection || !settings.openrouterApiKey}
                    variant="outline"
                    size="sm"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ConnectionStatusIcon />
                    )}
                    Test
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Crea un account gratuito su{' '}
                  <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">
                    openrouter.ai
                  </a>{' '}
                  per ottenere la tua API key gratuita
                </p>
              </div>
            )}

            {/* Configurazione OpenAI */}
            {settings.provider === 'openai' && (
              <div className="space-y-2">
                <Label htmlFor="openai-key">API Key OpenAI</Label>
                <div className="flex space-x-2">
                  <Input
                    id="openai-key"
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) => handleSettingsChange('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                  />
                  <Button
                    onClick={testConnection}
                    disabled={isTestingConnection || !settings.openaiApiKey}
                    variant="outline"
                    size="sm"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ConnectionStatusIcon />
                    )}
                    Test
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ottieni la tua API key da{' '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
                    platform.openai.com
                  </a>
                </p>
              </div>
            )}

            {/* Status connessione */}
            {connectionStatus !== 'unknown' && (
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <ConnectionStatusIcon />
                  {connectionStatus === 'connected' 
                    ? `Connessione a ${settings.provider.toUpperCase()} stabilita con successo`
                    : `Impossibile connettersi a ${settings.provider.toUpperCase()}. Verifica la configurazione.`
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Selezione modello */}
            <div className="space-y-2">
              <Label htmlFor="model-select">Modello AI</Label>
              <div className="flex space-x-2">
                <Select
                  value={settings.selectedModel}
                  onValueChange={(model) => handleSettingsChange('selectedModel', model)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un modello" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.provider === 'openrouter' ? (
                      // Modelli OpenRouter gratuiti
                      OPENROUTER_FREE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            {model.description && (
                              <span className="text-xs text-muted-foreground">{model.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      // Modelli OpenAI
                      OPENAI_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            {model.description && (
                              <span className="text-xs text-muted-foreground">{model.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={loadModels}
                  disabled={isLoadingModels}
                  variant="outline"
                  size="sm"
                >
                  {isLoadingModels ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Aggiorna'
                  )}
                </Button>
              </div>
            </div>

            {/* Informazioni sui modelli */}
            {settings.provider === 'openrouter' && (
              <div className="space-y-2">
                <Label>Modelli OpenRouter Gratuiti ({OPENROUTER_FREE_MODELS.length})</Label>
                <div className="text-sm text-muted-foreground">
                  Llama 3.1 8B, Mistral 7B, Qwen 2.5 7B, Phi-3 Medium e altri modelli gratuiti
                </div>
                <div className="text-xs text-green-600 font-medium">
                  ✓ Tutti i modelli sono completamente gratuiti
                </div>
              </div>
            )}

            {settings.provider === 'openai' && (
              <div className="space-y-2">
                <Label>Modelli OpenAI Premium ({OPENAI_MODELS.length})</Label>
                <div className="text-sm text-muted-foreground">
                  GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo - modelli avanzati a pagamento
                </div>
                <div className="text-xs text-orange-600 font-medium">
                  ⚠️ Richiede crediti OpenAI per l'utilizzo
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
