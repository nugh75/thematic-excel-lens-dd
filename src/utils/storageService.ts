
interface StorageData {
  projects: { [key: string]: any };
  backups: { [key: string]: any };
  settings: any;
}

class StorageService {
  private dbName = 'ThematicAnalysisDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups', { keyPath: 'id' });
        }
      };
    });
  }

  async saveProject(projectId: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    
    await store.put({
      id: projectId,
      data,
      lastModified: Date.now()
    });
  }

  async loadProject(projectId: string): Promise<any> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    
    return new Promise((resolve, reject) => {
      const request = store.get(projectId);
      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
  }

  async createBackup(projectId: string, data: any): Promise<string> {
    if (!this.db) await this.init();
    
    const backupId = `${projectId}_${Date.now()}`;
    const transaction = this.db!.transaction(['backups'], 'readwrite');
    const store = transaction.objectStore('backups');
    
    await store.put({
      id: backupId,
      projectId,
      data,
      createdAt: Date.now()
    });
    
    return backupId;
  }

  async exportData(): Promise<string> {
    if (!this.db) await this.init();
    
    const data: any = {};
    const stores = ['projects', 'sessions', 'backups'];
    
    for (const storeName of stores) {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore('store');
      
      data[storeName] = await new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
      });
    }
    
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    for (const [storeName, items] of Object.entries(data)) {
      if (Array.isArray(items)) {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        for (const item of items) {
          await store.put(item);
        }
      }
    }
  }
}

export const storageService = new StorageService();
