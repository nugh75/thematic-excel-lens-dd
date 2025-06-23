import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AIPipelineStatusProps {
  isProcessing: boolean;
  currentAttempt?: number;
  maxAttempts?: number;
  stage?: string;
  error?: string;
  success?: boolean;
}

export function AIPipelineStatus({ 
  isProcessing, 
  currentAttempt = 1, 
  maxAttempts = 3, 
  stage = '', 
  error, 
  success 
}: AIPipelineStatusProps) {
  if (!isProcessing && !error && !success) return null;

  const progress = maxAttempts > 0 ? (currentAttempt / maxAttempts) * 100 : 0;

  return (
    <Card className="mb-4 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {isProcessing && (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="font-medium">Pipeline AI in esecuzione...</span>
              <Badge variant="outline">
                Tentativo {currentAttempt}/{maxAttempts}
              </Badge>
            </>
          )}
          
          {success && (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-700">Elaborazione completata con successo!</span>
            </>
          )}
          
          {error && (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-700">Errore nella pipeline</span>
            </>
          )}
        </div>

        {stage && (
          <div className="text-sm text-muted-foreground mb-2">
            🔄 {stage}
          </div>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Strategia di parsing: {currentAttempt === 1 ? 'JSON diretto' : 
                                  currentAttempt === 2 ? 'Estrazione intelligente' : 
                                  'Fallback e ricostruzione'}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <strong>Dettagli errore:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {success && currentAttempt > 1 && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm text-green-700">
              ✅ Successo al tentativo {currentAttempt}! La pipeline robusta ha risolto automaticamente i problemi di parsing.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIPipelineStatus;
