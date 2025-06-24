import React, { useEffect, useState } from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Trash2,
  RefreshCw
} from 'lucide-react';

interface OfflineStatusProps {
  className?: string;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({ className = '' }) => {
  const { 
    isServerOnline, 
    getPendingOperationsCount, 
    processOfflineQueue, 
    clearOfflineQueue 
  } = useAnalysisStore();
  
  const [pendingCount, setPendingCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update pending count periodically
  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getPendingOperationsCount());
    };

    updateCount();
    const interval = setInterval(updateCount, 1000);
    return () => clearInterval(interval);
  }, [getPendingOperationsCount]);

  const handleProcessQueue = async () => {
    setIsProcessing(true);
    try {
      await processOfflineQueue();
      setPendingCount(getPendingOperationsCount());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearQueue = () => {
    clearOfflineQueue();
    setPendingCount(0);
  };

  // Don't show if online and no pending operations
  if (isServerOnline && pendingCount === 0) {
    return null;
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm">Operazioni Offline</span>
          </div>
          <Badge variant={pendingCount > 0 ? "secondary" : "outline"}>
            {pendingCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {pendingCount > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>
                {pendingCount} {pendingCount === 1 ? 'operazione in coda' : 'operazioni in coda'}
              </span>
            </div>
            
            {isServerOnline ? (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleProcessQueue} 
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      Sincronizzando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-1" />
                      Sincronizza
                    </>
                  )}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleClearQueue}
                  disabled={isProcessing}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-orange-600">
                <Download className="w-4 h-4" />
                <span>Saranno sincronizzate quando tornerai online</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Tutte le modifiche sono sincronizzate</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
