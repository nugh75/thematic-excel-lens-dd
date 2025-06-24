import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, MessageCircle, Lightbulb } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useToast } from '../hooks/use-toast';

interface AIConsultantProps {
  context: string;
  placeholder?: string;
  title?: string;
  description?: string;
}

export function AIConsultant({ 
  context, 
  placeholder = "Chiedi un consiglio all'AI per questa fase dell'analisi...",
  title = "Consulente AI",
  description = "Ottieni consigli personalizzati per migliorare la tua analisi tematica"
}: AIConsultantProps) {
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const aiSettings = aiService.getSettings();

  const getAdvice = async () => {
    if (!aiSettings.enabled) {
      setError('AI non abilitata. Vai alle impostazioni per configurarla.');
      return;
    }

    if (!question.trim()) {
      setError('Inserisci una domanda per ottenere un consiglio.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAdvice('');

    try {
      const response = await aiService.getGeneralAdvice(context, question);
      setAdvice(response);
      
      toast({
        title: "Consiglio ricevuto",
        description: "L'AI ha fornito un consiglio per la tua domanda.",
      });
    } catch (err) {
      console.error('Errore consiglio AI:', err);
      setError('Errore durante la richiesta di consiglio. Verifica la connessione a Ollama.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Come posso migliorare la qualità delle mie etichette?",
    "Quali pattern dovrei cercare in questi dati?",
    "Come posso evitare bias nell'analisi?",
    "Suggerimenti per una categorizzazione più efficace?",
    "Come validare la consistenza delle mie etichette?"
  ];

  if (!aiSettings.enabled) {
    return (
      <Alert>
        <MessageCircle className="h-4 w-4" />
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
          <MessageCircle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Domande rapide */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Domande rapide:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickQuestions.map((q, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuestion(q)}
                className="text-xs h-auto py-2 px-3 text-left whitespace-normal"
                title={q}
              >
                {q.length > 40 ? q.substring(0, 40) + '...' : q}
              </Button>
            ))}
          </div>
        </div>

        {/* Area di input per la domanda */}
        <div className="space-y-2">
          <label htmlFor="question" className="text-sm font-medium">
            La tua domanda:
          </label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        </div>

        {/* Pulsante per ottenere consiglio */}
        <Button
          onClick={getAdvice}
          disabled={isLoading || !question.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Consultando l'AI...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Ottieni Consiglio
            </>
          )}
        </Button>

        {/* Errori */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Risposta AI */}
        {advice && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <strong className="text-blue-800">Consiglio AI:</strong>
            </div>
            <div className="max-h-60 overflow-y-auto bg-white p-3 rounded border">
              <div className="whitespace-pre-wrap text-sm break-words leading-relaxed">
                {advice}
              </div>
            </div>
          </div>
        )}

        {/* Contesto */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          <strong>Contesto analisi:</strong> {context}
        </div>
      </CardContent>
    </Card>
  );
}
