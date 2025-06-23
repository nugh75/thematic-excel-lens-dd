
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class PerformanceCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minuti

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export class DataProcessor {
  private cache = new PerformanceCache();
  
  processLargeDataset(data: any[], chunkSize: number = 1000): Promise<any[]> {
    const cacheKey = `processed_${JSON.stringify(data).slice(0, 100)}`;
    const cached = this.cache.get<any[]>(cacheKey);
    
    if (cached) return Promise.resolve(cached);
    
    return new Promise<any[]>((resolve) => {
      const result: any[] = [];
      let index = 0;
      
      const processChunk = () => {
        const chunk = data.slice(index, index + chunkSize);
        result.push(...chunk.map(item => this.processItem(item)));
        
        index += chunkSize;
        
        if (index < data.length) {
          setTimeout(processChunk, 0); // Yield to main thread
        } else {
          this.cache.set(cacheKey, result);
          resolve(result);
        }
      };
      
      processChunk();
    });
  }
  
  private processItem(item: any): any {
    // Elaborazione base dell'elemento
    return {
      ...item,
      processed: true,
      timestamp: Date.now()
    };
  }
  
  debounce<T extends (...args: any[]) => void>(
    func: T, 
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
  
  throttle<T extends (...args: any[]) => void>(
    func: T, 
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }
}

export const performanceCache = new PerformanceCache();
export const dataProcessor = new DataProcessor();

// Auto-cleanup della cache ogni 10 minuti
setInterval(() => {
  performanceCache.cleanup();
}, 10 * 60 * 1000);
