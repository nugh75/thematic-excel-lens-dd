import { useApiConfig, debugLog } from '../hooks/useApiConfig';
import { Project, ProjectListItem, User } from '../types/analysis';

// Interfaccia per le risposte API standardizzate
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Service wrapper che usa il nuovo sistema di configurazione
class ApiServiceNew {
  private apiRequest: any;
  private config: any;
  private networkStatus: any;

  constructor() {
    // Verrà inizializzato quando il hook sarà disponibile
    this.apiRequest = null;
    this.config = null;
    this.networkStatus = null;
  }

  // Inizializza il service con i dati del hook
  initialize(apiRequest: any, config: any, networkStatus: any) {
    this.apiRequest = apiRequest;
    this.config = config;
    this.networkStatus = networkStatus;
  }

  // Wrapper per le chiamate API con gestione errori migliorata
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ data: T | null; success: boolean; error: string | null }> {
    
    if (!this.apiRequest) {
      return { data: null, success: false, error: 'API service not initialized' };
    }

    debugLog(`Making API request to: ${endpoint}`, options);

    try {
      const result = await this.apiRequest<ApiResponse<T>>(endpoint, options);
      
      if (result.error) {
        debugLog(`API request failed: ${result.error}`);
        return { data: null, success: false, error: result.error };
      }

      if (result.data?.success === false) {
        const errorMessage = result.data.error || result.data.message || 'Unknown server error';
        debugLog(`Server returned error: ${errorMessage}`);
        return { data: null, success: false, error: errorMessage };
      }

      debugLog(`API request successful`, result.data?.data);
      return { 
        data: result.data?.data || result.data, 
        success: true, 
        error: null 
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debugLog(`API request exception: ${errorMessage}`);
      return { data: null, success: false, error: errorMessage };
    }
  }

  // Health check per verificare stato server
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.makeRequest('/health');
      return result.success;
    } catch (error) {
      debugLog('Health check failed', error);
      return false;
    }
  }

  // Progetti
  async getProjects(): Promise<{ data: ProjectListItem[] | null; error: string | null }> {
    const result = await this.makeRequest<ProjectListItem[]>('/api/projects');
    
    if (!result.success) {
      // Prova endpoint alternativi
      const fallbackResult = await this.makeRequest<ProjectListItem[]>('/projects');
      if (fallbackResult.success) {
        return { data: fallbackResult.data, error: null };
      }
    }
    
    return { data: result.data, error: result.error };
  }

  async getProject(projectId: string): Promise<{ data: Project | null; error: string | null }> {
    return await this.makeRequest<Project>(`/api/projects/${projectId}`);
  }

  async createProject(projectData: {
    name: string;
    description: string;
    excelData: any;
    createdBy: string;
  }): Promise<{ data: Project | null; error: string | null }> {
    return await this.makeRequest<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(
    projectId: string, 
    updates: Partial<Project>
  ): Promise<{ data: Project | null; error: string | null }> {
    return await this.makeRequest<Project>(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<{ data: boolean; error: string | null }> {
    const result = await this.makeRequest<{ success: boolean }>(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
    
    return { 
      data: result.success && !!result.data?.success, 
      error: result.error 
    };
  }

  // Utenti
  async getUsers(): Promise<{ data: User[] | null; error: string | null }> {
    return await this.makeRequest<User[]>('/api/users');
  }

  async createUser(userData: Omit<User, 'id'>): Promise<{ data: User | null; error: string | null }> {
    return await this.makeRequest<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Collaboratori
  async addCollaborator(
    projectId: string, 
    userId: string
  ): Promise<{ data: boolean; error: string | null }> {
    const result = await this.makeRequest<{ success: boolean }>(`/api/projects/${projectId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    
    return { 
      data: result.success && !!result.data?.success, 
      error: result.error 
    };
  }

  async removeCollaborator(
    projectId: string, 
    userId: string
  ): Promise<{ data: boolean; error: string | null }> {
    const result = await this.makeRequest<{ success: boolean }>(`/api/projects/${projectId}/collaborators/${userId}`, {
      method: 'DELETE',
    });
    
    return { 
      data: result.success && !!result.data?.success, 
      error: result.error 
    };
  }

  // Backup e sincronizzazione
  async backupProject(projectId: string): Promise<{ data: any | null; error: string | null }> {
    return await this.makeRequest(`/api/projects/${projectId}/backup`);
  }

  async restoreProject(backupData: any): Promise<{ data: Project | null; error: string | null }> {
    return await this.makeRequest<Project>('/api/projects/restore', {
      method: 'POST',
      body: JSON.stringify({ backupData }),
    });
  }

  // Getter per stato
  get isHealthy(): boolean {
    return this.networkStatus?.isOnline && this.networkStatus?.apiReachable;
  }

  get baseUrl(): string {
    return this.config?.baseUrl || '';
  }

  get environment(): string {
    return this.config?.environment || 'unknown';
  }

  get lastLatency(): number | null {
    return this.networkStatus?.latency || null;
  }
}

// Esporta l'istanza singleton
export const apiServiceNew = new ApiServiceNew();

// Hook per utilizzare il service in componenti React
export const useApiService = () => {
  const { apiRequest, config, networkStatus, isHealthy } = useApiConfig();
  
  // Inizializza il service
  if (apiRequest && config && networkStatus) {
    apiServiceNew.initialize(apiRequest, config, networkStatus);
  }

  return {
    apiService: apiServiceNew,
    isHealthy,
    config,
    networkStatus
  };
};

export default apiServiceNew;
