/**
 * Storage Quota Manager - Gestisce i limiti di storage del browser
 */

export interface StorageQuotaInfo {
  usage: number;
  quota: number;
  percentage: number;
  available: number;
}

export interface StorageStats {
  localStorage: number;
  sessionStorage: number;
  indexedDB: number;
  cache: number;
  total: number;
}

export class StorageQuotaManager {
  private static readonly QUOTA_WARNING_THRESHOLD = 0.8; // 80%
  private static readonly QUOTA_CRITICAL_THRESHOLD = 0.95; // 95%
  private static readonly MAX_QUEUE_SIZE = 100;
  private static readonly EMERGENCY_QUEUE_SIZE = 10;

  /**
   * Verifica la quota storage disponibile
   */
  static async checkQuota(): Promise<StorageQuotaInfo | null> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        
        return {
          usage,
          quota,
          percentage: quota > 0 ? (usage / quota) : 0,
          available: quota - usage
        };
      }
    } catch (error) {
      console.error('Error checking storage quota:', error);
    }
    
    return null;
  }

  /**
   * Gestisce errori di quota superata
   */
  static async handleQuotaExceeded(): Promise<boolean> {
    try {
      const quota = await this.checkQuota();
      
      if (!quota) {
        // Fallback: pulizia generale
        await this.emergencyCleanup();
        return true;
      }

      if (quota.percentage > this.QUOTA_CRITICAL_THRESHOLD) {
        await this.emergencyCleanup();
        return true;
      } else if (quota.percentage > this.QUOTA_WARNING_THRESHOLD) {
        await this.selectiveCleanup();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling quota exceeded:', error);
      await this.emergencyCleanup();
      return true;
    }
  }

  /**
   * Pulizia d'emergenza - rimuove dati non essenziali
   */
  private static async emergencyCleanup(): Promise<void> {
    console.warn('Emergency storage cleanup initiated');
    
    // 1. Pulisci dati temporanei
    await this.clearTemporaryData();
    
    // 2. Tronca drasticamente la coda offline
    await this.truncateOfflineQueue(this.EMERGENCY_QUEUE_SIZE);
    
    // 3. Pulisci cache vecchia
    await this.clearOldCacheEntries();
    
    // 4. Pulisci sessionStorage
    this.clearSessionStorage();
    
    console.log('Emergency cleanup completed');
  }

  /**
   * Pulizia selettiva - mantiene dati essenziali
   */
  private static async selectiveCleanup(): Promise<void> {
    console.log('Selective storage cleanup initiated');
    
    // 1. Pulisci solo dati temporanei
    await this.clearTemporaryData();
    
    // 2. Tronca moderatamente la coda offline
    await this.truncateOfflineQueue(this.MAX_QUEUE_SIZE);
    
    // 3. Pulisci cache vecchia (mantieni recente)
    await this.clearOldCacheEntries(7); // Mantieni ultimi 7 giorni
    
    console.log('Selective cleanup completed');
  }

  /**
   * Pulisce dati temporanei dal localStorage
   */
  private static clearTemporaryData(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && this.isTemporaryKey(key)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing temporary key ${key}:`, error);
      }
    });
    
    console.log(`Removed ${keysToRemove.length} temporary items`);
  }

  /**
   * Determina se una chiave è temporanea
   */
  private static isTemporaryKey(key: string): boolean {
    const temporaryPrefixes = [
      'temp_',
      'cache_',
      '_temp',
      'ai_suggestion_cache',
      'upload_progress_',
      'download_',
      'preview_'
    ];
    
    return temporaryPrefixes.some(prefix => key.includes(prefix));
  }

  /**
   * Tronca la coda delle operazioni offline
   */
  private static async truncateOfflineQueue(maxSize: number): Promise<void> {
    try {
      const queueKey = 'offline-queue';
      const queueData = localStorage.getItem(queueKey);
      
      if (queueData) {
        const queue = JSON.parse(queueData);
        
        if (Array.isArray(queue) && queue.length > maxSize) {
          const truncated = queue.slice(-maxSize); // Mantieni solo gli ultimi
          localStorage.setItem(queueKey, JSON.stringify(truncated));
          console.log(`Offline queue truncated from ${queue.length} to ${truncated.length} items`);
        }
      }
    } catch (error) {
      console.error('Error truncating offline queue:', error);
      // In caso di errore, rimuovi completamente la coda
      localStorage.removeItem('offline-queue');
    }
  }

  /**
   * Pulisce entry di cache vecchie
   */
  private static async clearOldCacheEntries(daysToKeep: number = 3): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        
        for (const cacheName of cacheNames) {
          // Se il nome della cache contiene timestamp, verifica se è vecchia
          const timestampMatch = cacheName.match(/(\d{13})/); // 13 cifre = timestamp ms
          
          if (timestampMatch) {
            const timestamp = parseInt(timestampMatch[1]);
            if (timestamp < cutoffTime) {
              await caches.delete(cacheName);
              console.log(`Deleted old cache: ${cacheName}`);
            }
          }
        }
      } catch (error) {
        console.error('Error clearing old cache entries:', error);
      }
    }
  }

  /**
   * Pulisce sessionStorage
   */
  private static clearSessionStorage(): void {
    const keepKeys = ['currentUser', 'auth_token']; // Mantieni dati essenziali
    const toRemove: string[] = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && !keepKeys.includes(key)) {
        toRemove.push(key);
      }
    }
    
    toRemove.forEach(key => sessionStorage.removeItem(key));
    console.log(`Cleared ${toRemove.length} sessionStorage items`);
  }

  /**
   * Ottiene statistiche dettagliate dello storage
   */
  static async getStorageStats(): Promise<StorageStats> {
    const stats: StorageStats = {
      localStorage: 0,
      sessionStorage: 0,
      indexedDB: 0,
      cache: 0,
      total: 0
    };

    // localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        stats.localStorage += new Blob([key + value]).size;
      }
    }

    // sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key) || '';
        stats.sessionStorage += new Blob([key + value]).size;
      }
    }

    // Total (da quota se disponibile)
    const quota = await this.checkQuota();
    if (quota) {
      stats.total = quota.usage;
      stats.indexedDB = Math.max(0, quota.usage - stats.localStorage - stats.sessionStorage - stats.cache);
    }

    return stats;
  }

  /**
   * Verifica se è necessaria una pulizia
   */
  static async shouldCleanup(): Promise<{ needed: boolean; urgent: boolean; reason: string }> {
    const quota = await this.checkQuota();
    
    if (!quota) {
      return { needed: false, urgent: false, reason: 'Quota information not available' };
    }

    if (quota.percentage > this.QUOTA_CRITICAL_THRESHOLD) {
      return { 
        needed: true, 
        urgent: true, 
        reason: `Storage critically full: ${(quota.percentage * 100).toFixed(1)}%` 
      };
    }

    if (quota.percentage > this.QUOTA_WARNING_THRESHOLD) {
      return { 
        needed: true, 
        urgent: false, 
        reason: `Storage warning threshold exceeded: ${(quota.percentage * 100).toFixed(1)}%` 
      };
    }

    return { needed: false, urgent: false, reason: 'Storage usage within normal limits' };
  }

  /**
   * Monitora e gestisce automaticamente la quota
   */
  static async autoManage(): Promise<void> {
    const cleanup = await this.shouldCleanup();
    
    if (cleanup.needed) {
      console.log(`Auto-cleanup triggered: ${cleanup.reason}`);
      
      if (cleanup.urgent) {
        await this.emergencyCleanup();
      } else {
        await this.selectiveCleanup();
      }
    }
  }
}

// Utility function per wrappare operazioni che potrebbero causare QuotaExceededError
export const withQuotaHandling = async <T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('Quota exceeded, attempting cleanup...');
      
      const handled = await StorageQuotaManager.handleQuotaExceeded();
      
      if (handled && fallback) {
        return await fallback();
      } else if (handled) {
        // Retry original operation after cleanup
        return await operation();
      }
    }
    
    throw error;
  }
};

export default StorageQuotaManager;
