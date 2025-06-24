import { Project } from '../types/analysis';

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  projectId: string;
  data?: Partial<Project>;
  timestamp: number;
  retryCount: number;
}

interface OfflineQueueState {
  operations: PendingOperation[];
  isProcessing: boolean;
}

class OfflineManager {
  private static instance: OfflineManager;
  private readonly STORAGE_KEY = 'offline_queue';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 secondi
  
  private constructor() {}

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  /**
   * Salva un'operazione in coda per quando si tornerà online
   */
  public queueOperation(
    type: PendingOperation['type'],
    projectId: string,
    data?: Partial<Project>
  ): void {
    const operation: PendingOperation = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      type,
      projectId,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    const queue = this.getQueue();
    queue.operations.push(operation);
    this.saveQueue(queue);

    console.log(`Operazione ${type} su progetto ${projectId} aggiunta alla coda offline`);
  }

  /**
   * Ottiene tutte le operazioni in coda
   */
  public getPendingOperations(): PendingOperation[] {
    return this.getQueue().operations;
  }

  /**
   * Rimuove un'operazione dalla coda
   */
  public removeOperation(operationId: string): void {
    const queue = this.getQueue();
    queue.operations = queue.operations.filter(op => op.id !== operationId);
    this.saveQueue(queue);
  }

  /**
   * Svuota completamente la coda
   */
  public clearQueue(): void {
    this.saveQueue({ operations: [], isProcessing: false });
  }

  /**
   * Processa tutte le operazioni in coda quando si torna online
   */
  public async processQueue(apiService: any): Promise<void> {
    const queue = this.getQueue();
    
    if (queue.isProcessing || queue.operations.length === 0) {
      return;
    }

    // Imposta flag di processing
    queue.isProcessing = true;
    this.saveQueue(queue);

    console.log(`Processando ${queue.operations.length} operazioni offline...`);

    const operationsToProcess = [...queue.operations];
    const completedOperations: string[] = [];
    const failedOperations: PendingOperation[] = [];

    for (const operation of operationsToProcess) {
      try {
        await this.executeOperation(operation, apiService);
        completedOperations.push(operation.id);
        console.log(`Operazione ${operation.type} completata per progetto ${operation.projectId}`);
      } catch (error) {
        operation.retryCount++;
        
        if (operation.retryCount < this.MAX_RETRIES) {
          failedOperations.push(operation);
          console.warn(`Operazione ${operation.id} fallita, riprovando (${operation.retryCount}/${this.MAX_RETRIES})`);
        } else {
          console.error(`Operazione ${operation.id} fallita definitivamente dopo ${this.MAX_RETRIES} tentativi`);
        }
      }
    }

    // Aggiorna la coda rimuovendo le operazioni completate
    const updatedQueue = this.getQueue();
    updatedQueue.operations = updatedQueue.operations.filter(
      op => !completedOperations.includes(op.id)
    ).concat(failedOperations);
    updatedQueue.isProcessing = false;
    this.saveQueue(updatedQueue);

    if (failedOperations.length > 0) {
      // Riprova le operazioni fallite dopo un delay
      setTimeout(() => {
        this.processQueue(apiService);
      }, this.RETRY_DELAY);
    }
  }

  /**
   * Esegue una singola operazione tramite API
   */
  private async executeOperation(operation: PendingOperation, apiService: any): Promise<void> {
    switch (operation.type) {
      case 'create':
        if (operation.data) {
          await apiService.createProject(operation.data);
        }
        break;
      case 'update':
        if (operation.data) {
          await apiService.updateProject(operation.projectId, operation.data);
        }
        break;
      case 'delete':
        await apiService.deleteProject(operation.projectId);
        break;
      default:
        throw new Error(`Tipo di operazione non supportato: ${operation.type}`);
    }
  }

  /**
   * Salva un progetto localmente per la modalità offline
   */
  public saveProjectLocally(project: Project): void {
    const localStorageKey = `offline_project_${project.id}`;
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(project));
      console.log(`Progetto ${project.id} salvato localmente`);
    } catch (error) {
      console.error('Errore nel salvataggio locale del progetto:', error);
    }
  }

  /**
   * Carica un progetto salvato localmente
   */
  public loadProjectLocally(projectId: string): Project | null {
    const localStorageKey = `offline_project_${projectId}`;
    try {
      const projectData = localStorage.getItem(localStorageKey);
      return projectData ? JSON.parse(projectData) : null;
    } catch (error) {
      console.error('Errore nel caricamento locale del progetto:', error);
      return null;
    }
  }

  /**
   * Rimuove un progetto salvato localmente
   */
  public removeProjectLocally(projectId: string): void {
    const localStorageKey = `offline_project_${projectId}`;
    localStorage.removeItem(localStorageKey);
  }

  /**
   * Ottiene tutti i progetti salvati localmente
   */
  public getLocalProjects(): Project[] {
    const projects: Project[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('offline_project_')) {
        try {
          const projectData = localStorage.getItem(key);
          if (projectData) {
            projects.push(JSON.parse(projectData));
          }
        } catch (error) {
          console.error(`Errore nel parsing del progetto locale ${key}:`, error);
        }
      }
    }
    return projects;
  }

  /**
   * Controlla se ci sono operazioni in coda
   */
  public hasPendingOperations(): boolean {
    return this.getQueue().operations.length > 0;
  }

  /**
   * Ottiene il numero di operazioni in coda
   */
  public getPendingOperationsCount(): number {
    return this.getQueue().operations.length;
  }

  private getQueue(): OfflineQueueState {
    try {
      const queueData = localStorage.getItem(this.STORAGE_KEY);
      return queueData ? JSON.parse(queueData) : { operations: [], isProcessing: false };
    } catch (error) {
      console.error('Errore nel caricamento della coda offline:', error);
      return { operations: [], isProcessing: false };
    }
  }

  private saveQueue(queue: OfflineQueueState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Errore nel salvataggio della coda offline:', error);
    }
  }
}

// Esporta l'istanza singleton
export const offlineManager = OfflineManager.getInstance();
