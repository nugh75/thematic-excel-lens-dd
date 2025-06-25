import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Globe,
  Server
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import StorageManager from './StorageManager';
import { robustApiService, ApiErrorType } from '../services/robustApiService';
import { StorageQuotaManager } from '../utils/storageQuotaManager';
import { getApiConfig } from '../config/api';

interface StorageInfo {
  usage: number;
  quota: number;
  percentage: number;
}

interface NetworkStatus {
  isOnline: boolean;
  apiReachable: boolean;
  lastCheck: Date;
}

const SystemDiagnostic = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    apiReachable: false,
    lastCheck: new Date()
  });
  const [isClearing, setIsClearing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Controlla quota storage
  const checkStorageQuota = async (): Promise<StorageInfo | null> => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (usage / quota) * 100 : 0;
        
        return { usage, quota, percentage };
      }
    } catch (error) {
      console.error('Error checking storage quota:', error);
    }
    return null;
  };

  // Controlla connessione API con nuovo servizio robusto
  const checkApiConnection = async (): Promise<boolean> => {
    try {
      return await robustApiService.healthCheck();
    } catch (error) {
      console.error('API connection check failed:', error);
      return false;
    }
  };

  // Determina URL API basato sull'ambiente con nuova configurazione
  const getApiUrl = (): string => {
    const config = getApiConfig();
    return config.baseUrl;
  };

  // Pulisce tutto lo storage del browser
  const clearBrowserStorage = async () => {
    setIsClearing(true);
    
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear IndexedDB
      if ('indexedDB' in window) {
        try {
          await new Promise((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase('anatema-offline-queue');
            deleteReq.onsuccess = () => resolve(true);
            deleteReq.onerror = () => reject(deleteReq.error);
          });
        } catch (error) {
          console.error('Error clearing IndexedDB:', error);
        }
      }

      // Clear service worker cache if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      toast({
        title: "Storage pulito",
        description: "Tutti i dati locali sono stati eliminati. La pagina verrà ricaricata.",
      });

      // Ricarica la pagina dopo 2 secondi
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error clearing storage:', error);
      toast({
        title: "Errore pulizia storage",
        description: "Si è verificato un errore durante la pulizia",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Effettua diagnosi completa
  const runFullDiagnostic = async () => {
    setIsChecking(true);
    
    try {
      const [storage, apiReachable] = await Promise.all([
        checkStorageQuota(),
        checkApiConnection()
      ]);

      setStorageInfo(storage);
      setNetworkStatus({
        isOnline: navigator.onLine,
        apiReachable,
        lastCheck: new Date()
      });

    } catch (error) {
      console.error('Error running diagnostic:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Effetto per diagnosi iniziale
  useEffect(() => {
    runFullDiagnostic();

    // Listener per cambi di connessione
    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: true }));
      checkApiConnection().then(apiReachable => {
        setNetworkStatus(prev => ({ ...prev, apiReachable, lastCheck: new Date() }));
      });
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: false, apiReachable: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Formatta bytes in formato leggibile
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageStatus = () => {
    if (!storageInfo) return { color: 'gray', text: 'Unknown' };
    if (storageInfo.percentage > 90) return { color: 'red', text: 'Critical' };
    if (storageInfo.percentage > 75) return { color: 'yellow', text: 'Warning' };
    return { color: 'green', text: 'Good' };
  };

  const storageStatus = getStorageStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Diagnostica Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Stato Storage Browser</h3>
              <Badge 
                variant={storageStatus.color === 'red' ? 'destructive' : 
                        storageStatus.color === 'yellow' ? 'default' : 'secondary'}
              >
                {storageStatus.text}
              </Badge>
            </div>
            
            {storageInfo ? (
              <div className="space-y-2">
                <Progress value={storageInfo.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Utilizzato: {formatBytes(storageInfo.usage)}</span>
                  <span>Quota: {formatBytes(storageInfo.quota)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Utilizzo: {storageInfo.percentage.toFixed(1)}%
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Impossibile determinare lo stato storage</p>
            )}
          </div>

          {/* Network Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Stato Connessione</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">Internet:</span>
                {networkStatus.isOnline ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Offline
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span className="text-sm">API:</span>
                {networkStatus.apiReachable ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Raggiungibile
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Non raggiungibile
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Ultimo controllo: {networkStatus.lastCheck.toLocaleTimeString()}
            </p>
            <p className="text-xs text-gray-500">
              URL API: {getApiUrl()}
            </p>
            <p className="text-xs text-gray-500">
              Ambiente: {getApiConfig().environment} | CORS: {getApiConfig().corsEnabled ? 'Abilitato' : 'Disabilitato'}
            </p>
            <p className="text-xs text-gray-500">
              Operazioni in coda: {robustApiService.pendingOperations}
            </p>
          </div>

          {/* Alerts */}
          {storageInfo && storageInfo.percentage > 85 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Storage quasi pieno</AlertTitle>
              <AlertDescription>
                Lo storage del browser è al {storageInfo.percentage.toFixed(1)}%. 
                Considera di pulire i dati per evitare errori.
              </AlertDescription>
            </Alert>
          )}

          {!networkStatus.apiReachable && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Server non raggiungibile</AlertTitle>
              <AlertDescription>
                Il server API non è raggiungibile. L'app funzionerà in modalità offline.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={runFullDiagnostic} 
              disabled={isChecking}
              variant="outline"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isChecking ? 'Controllo...' : 'Riesegui Diagnosi'}
            </Button>

            {storageInfo && storageInfo.percentage > 50 && (
              <Button 
                onClick={clearBrowserStorage} 
                disabled={isClearing}
                variant="destructive"
              >
                {isClearing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {isClearing ? 'Pulizia...' : 'Pulisci Storage'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gestione Storage Avanzata */}
      <StorageManager />
    </div>
  );
};

export default SystemDiagnostic;
