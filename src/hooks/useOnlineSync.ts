import { useEffect } from 'react';
import { useAnalysisStore } from '../store/analysisStore';

/**
 * Hook per gestire automaticamente la sincronizzazione quando si torna online
 */
export const useOnlineSync = () => {
  const { 
    isServerOnline, 
    setServerOnline, 
    processOfflineQueue,
    getPendingOperationsCount 
  } = useAnalysisStore();

  useEffect(() => {
    const handleOnline = async () => {
      console.log('Network is back online, checking server and processing queue...');
      
      try {
        // Test server connection with AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/health', { 
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setServerOnline(true);
          
          // Process offline queue if there are pending operations
          const pendingCount = getPendingOperationsCount();
          if (pendingCount > 0) {
            console.log(`Processing ${pendingCount} pending operations...`);
            await processOfflineQueue();
          }
        }
      } catch (error) {
        console.warn('Server still not reachable despite network being online:', error);
        setServerOnline(false);
      }
    };

    const handleOffline = () => {
      console.log('Network went offline');
      setServerOnline(false);
    };

    // Listen for browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial network status
    if (navigator.onLine) {
      handleOnline();
    } else {
      setServerOnline(false);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setServerOnline, processOfflineQueue, getPendingOperationsCount]);

  // Periodic server health check
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('/api/health', { 
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const wasOnline = isServerOnline;
        const isNowOnline = response.ok;
        
        if (!wasOnline && isNowOnline) {
          // Server is back online, process queue
          setServerOnline(true);
          const pendingCount = getPendingOperationsCount();
          if (pendingCount > 0) {
            await processOfflineQueue();
          }
        } else if (wasOnline && !isNowOnline) {
          // Server went offline
          setServerOnline(false);
        }
      } catch (error) {
        if (isServerOnline) {
          setServerOnline(false);
        }
      }
    };

    // Check server health every 30 seconds
    const interval = setInterval(checkServerHealth, 30000);
    
    return () => clearInterval(interval);
  }, [isServerOnline, setServerOnline, processOfflineQueue, getPendingOperationsCount]);
};
