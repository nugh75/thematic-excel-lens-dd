import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Database, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  HardDrive
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAnalysisStore } from '../store/analysisStore';

interface StorageStats {
  localStorage: {
    used: number;
    items: number;
    largestKey: string;
    largestSize: number;
  };
  sessionStorage: {
    used: number;
    items: number;
  };
  indexedDB: {
    databases: string[];
    totalSize: number;
  };
  quota: {
    usage: number;
    quota: number;
    percentage: number;
  } | null;
}

const StorageManager = () => {
  const { processOfflineQueue, getPendingOperationsCount, clearOfflineQueue } = useAnalysisStore();
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Analizza lo stato dello storage
  const analyzeStorage = async () => {
    setIsAnalyzing(true);
    
    try {
      // Analizza localStorage
      let localStorageUsed = 0;
      let largestKey = '';
      let largestSize = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          const size = new Blob([value]).size;
          localStorageUsed += size;
          
          if (size > largestSize) {
            largestSize = size;
            largestKey = key;
          }
        }
      }

      // Analizza sessionStorage
      let sessionStorageUsed = 0;
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key) || '';
          sessionStorageUsed += new Blob([value]).size;
        }
      }

      // Analizza quota
      let quota = null;
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          quota = {
            usage: estimate.usage || 0,
            quota: estimate.quota || 0,
            percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
          };
        } catch (error) {
          console.error('Error getting storage estimate:', error);
        }
      }

      // Analizza IndexedDB (semplificato)
      const indexedDBInfo = {
        databases: ['anatema-offline-queue'], // Known database
        totalSize: 0 // Difficile da calcolare senza aprire il DB
      };

      setStorageStats({
        localStorage: {
          used: localStorageUsed,
          items: localStorage.length,
          largestKey,
          largestSize
        },
        sessionStorage: {
          used: sessionStorageUsed,
          items: sessionStorage.length
        },
        indexedDB: indexedDBInfo,
        quota
      });

    } catch (error) {
      console.error('Error analyzing storage:', error);
      toast({
        title: "Errore analisi storage",
        description: "Impossibile analizzare lo storage del browser",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Pulisce localStorage selettivamente
  const cleanLocalStorage = async (type: 'all' | 'cache' | 'projects' | 'offline') => {
    setIsCleaning(true);
    
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          switch (type) {
            case 'all':
              keysToRemove.push(key);
              break;
            case 'cache':
              if (key.includes('cache') || key.includes('temp')) {
                keysToRemove.push(key);
              }
              break;
            case 'projects':
              if (key.includes('project') || key.includes('analysis')) {
                keysToRemove.push(key);
              }
              break;
            case 'offline':
              if (key.includes('offline') || key.includes('queue')) {
                keysToRemove.push(key);
              }
              break;
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      toast({
        title: "Storage pulito",
        description: `Rimossi ${keysToRemove.length} elementi dal localStorage`,
      });

      // Ri-analizza dopo la pulizia
      await analyzeStorage();

    } catch (error) {
      console.error('Error cleaning storage:', error);
      toast({
        title: "Errore pulizia",
        description: "Si è verificato un errore durante la pulizia",
        variant: "destructive"
      });
    } finally {
      setIsCleaning(false);
    }
  };

  // Pulisce IndexedDB
  const cleanIndexedDB = async () => {
    try {
      if ('indexedDB' in window) {
        await new Promise((resolve, reject) => {
          const deleteReq = indexedDB.deleteDatabase('anatema-offline-queue');
          deleteReq.onsuccess = () => resolve(true);
          deleteReq.onerror = () => reject(deleteReq.error);
        });

        toast({
          title: "IndexedDB pulito",
          description: "Database offline eliminato con successo",
        });

        await analyzeStorage();
      }
    } catch (error) {
      console.error('Error cleaning IndexedDB:', error);
      toast({
        title: "Errore pulizia IndexedDB",
        description: "Impossibile eliminare il database offline",
        variant: "destructive"
      });
    }
  };

  // Processa la coda offline
  const handleProcessOfflineQueue = async () => {
    try {
      await processOfflineQueue();
      toast({
        title: "Coda processata",
        description: "Tutte le operazioni offline sono state elaborate",
      });
      await analyzeStorage();
    } catch (error) {
      toast({
        title: "Errore processamento",
        description: "Impossibile processare la coda offline",
        variant: "destructive"
      });
    }
  };

  // Effetto per analisi iniziale
  useEffect(() => {
    analyzeStorage();
  }, []);

  // Formatta bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pendingOps = getPendingOperationsCount();

  return (
    <div className="space-y-6">
      {/* Panoramica Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestione Storage Browser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {storageStats ? (
            <>
              {/* Quota generale */}
              {storageStats.quota && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quota Browser</span>
                    <Badge variant={storageStats.quota.percentage > 80 ? 'destructive' : 'secondary'}>
                      {storageStats.quota.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={storageStats.quota.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Utilizzato: {formatBytes(storageStats.quota.usage)}</span>
                    <span>Disponibile: {formatBytes(storageStats.quota.quota)}</span>
                  </div>
                </div>
              )}

              {/* localStorage */}
              <div className="border rounded p-3">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  localStorage
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Dimensione:</span>
                    <span>{formatBytes(storageStats.localStorage.used)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Elementi:</span>
                    <span>{storageStats.localStorage.items}</span>
                  </div>
                  {storageStats.localStorage.largestKey && (
                    <div className="flex justify-between">
                      <span>Elemento più grande:</span>
                      <span className="text-xs truncate max-w-32">
                        {storageStats.localStorage.largestKey} ({formatBytes(storageStats.localStorage.largestSize)})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* sessionStorage */}
              <div className="border rounded p-3">
                <h4 className="font-medium mb-2">sessionStorage</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Dimensione:</span>
                    <span>{formatBytes(storageStats.sessionStorage.used)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Elementi:</span>
                    <span>{storageStats.sessionStorage.items}</span>
                  </div>
                </div>
              </div>

              {/* Coda Offline */}
              <div className="border rounded p-3">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Coda Operazioni Offline
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operazioni in attesa:</span>
                    <Badge variant={pendingOps > 0 ? 'default' : 'secondary'}>
                      {pendingOps}
                    </Badge>
                  </div>
                  {pendingOps > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Operazioni pendenti</AlertTitle>
                      <AlertDescription>
                        Ci sono {pendingOps} operazioni in attesa di sincronizzazione con il server.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Caricamento statistiche storage...</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={analyzeStorage} 
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Aggiorna
            </Button>

            {pendingOps > 0 && (
              <Button 
                onClick={handleProcessOfflineQueue}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Processa Coda ({pendingOps})
              </Button>
            )}

            <Button 
              onClick={() => cleanLocalStorage('cache')}
              disabled={isCleaning}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Pulisci Cache
            </Button>

            <Button 
              onClick={() => cleanLocalStorage('offline')}
              disabled={isCleaning}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Pulisci Offline
            </Button>

            <Button 
              onClick={cleanIndexedDB}
              disabled={isCleaning}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Pulisci IndexedDB
            </Button>

            {storageStats?.quota && storageStats.quota.percentage > 50 && (
              <Button 
                onClick={() => cleanLocalStorage('all')}
                disabled={isCleaning}
                variant="destructive"
                size="sm"
              >
                {isCleaning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Pulisci Tutto
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageManager;
