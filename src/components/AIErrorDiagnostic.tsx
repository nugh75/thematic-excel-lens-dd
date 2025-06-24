import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, RefreshCw, Settings, Info } from 'lucide-react';
import { Button } from './ui/button';

interface AIErrorDiagnosticProps {
  error: string;
  rawResponse?: string;
  onRetry?: () => void;
  onConfigureAI?: () => void;
}

export function AIErrorDiagnostic({ 
  error, 
  rawResponse, 
  onRetry, 
  onConfigureAI 
}: AIErrorDiagnosticProps) {
  
  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('parsare la risposta') || errorMessage.includes('formato JSON')) {
      return 'parsing';
    }
    if (errorMessage.includes('connessione') || errorMessage.includes('network')) {
      return 'connection';
    }
    if (errorMessage.includes('timeout')) {
      return 'timeout';
    }
    return 'general';
  };

  const getErrorSuggestions = (type: string) => {
    switch (type) {
      case 'parsing':
        return [
          'Il modello AI potrebbe non essere adatto per questo tipo di analisi',
          'Prova a riformulare il prompt più specificamente',
          'Riduci il numero di risposte da analizzare',
          'Verifica le impostazioni del modello AI'
        ];
      case 'connection':
        return [
          'Verifica la connessione internet',
          'Controlla le impostazioni AI nella sezione "AI Config"',
          'Verifica che il servizio AI sia attivo'
        ];
      case 'timeout':
        return [
          'Il servizio AI potrebbe essere sovraccarico',
          'Riduci la dimensione del dataset',
          'Riprova tra qualche minuto'
        ];
      default:
        return [
          'Verifica le impostazioni AI',
          'Prova con un prompt più semplice',
          'Controlla i log della console per dettagli'
        ];
    }
  };

  const errorType = getErrorType(error);
  const suggestions = getErrorSuggestions(errorType);

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Errore nell'analisi AI</AlertTitle>
        <AlertDescription className="mt-2">
          {error}
        </AlertDescription>
      </Alert>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Suggerimenti per risolvere il problema:</AlertTitle>
        <AlertDescription className="mt-2">
          <ul className="list-disc list-inside space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm">{suggestion}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      {rawResponse && rawResponse.length > 0 && (
        <Alert>
          <AlertTitle>Risposta AI ricevuta (per debug):</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="bg-gray-100 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
              {rawResponse.substring(0, 500)}
              {rawResponse.length > 500 && '...'}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Riprova
          </Button>
        )}
        {onConfigureAI && (
          <Button onClick={onConfigureAI} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configura AI
          </Button>
        )}
      </div>
    </div>
  );
}
