/**
 * Servizio API per la persistenza dei dati sul server
 * Sostituisce il salvataggio locale nel browser con chiamate al backend
 */

import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  [key: string]: T;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  excelData?: any;
  config?: any;
  labels?: any[];
  cellLabels?: any[];
  rowLabels?: any[];
  sessions?: any[];
}

interface ProjectListItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  dataInfo: {
    hasData: boolean;
    rowCount: number;
    columnCount: number;
    labelsCount: number;
    cellLabelsCount: number;
  };
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ================== HEALTH CHECK ==================

  async healthCheck(): Promise<{ status: string; timestamp: string; redis: string }> {
    return this.request('/health');
  }

  // ================== PROGETTI ==================

  async getProjects(): Promise<{ projects: ProjectListItem[] }> {
    return this.request('/api/projects');
  }

  async getProject(projectId: string): Promise<{ project: Project }> {
    return this.request(`/api/projects/${projectId}`);
  }

  async createProject(projectData: {
    name: string;
    description?: string;
    excelData?: any;
    config?: any;
  }): Promise<{ project: Project }> {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(
    projectId: string, 
    updates: Partial<Project>
  ): Promise<{ project: Project }> {
    return this.request(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<{ message: string }> {
    return this.request(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // ================== BACKUP/IMPORT ==================

  async importProject(backupData: any, generateNewId: boolean = true): Promise<{ project: Project }> {
    return this.request('/api/projects/import', {
      method: 'POST',
      body: JSON.stringify({ backupData, generateNewId }),
    });
  }

  async exportProject(projectId: string): Promise<{ backupData: any }> {
    return this.request(`/api/projects/${projectId}/export`);
  }

  // ================== STATISTICHE ==================

  async getStats(): Promise<{
    totalProjects: number;
    totalLabels: number;
    totalCellLabels: number;
    totalRows: number;
    serverUptime: number;
    timestamp: string;
  }> {
    return this.request('/api/stats');
  }

  // ================== UTILITY ==================

  /**
   * Verifica se l'API è raggiungibile
   */
  async isOnline(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Auto-save automatico di un progetto
   */
  async autoSave(projectId: string, projectData: Partial<Project>): Promise<boolean> {
    try {
      await this.updateProject(projectId, projectData);
      return true;
    } catch (error) {
      console.warn('Auto-save fallito:', error);
      return false;
    }
  }

  /**
   * Sincronizza un progetto locale con il server
   */
  async syncProject(localProject: Project): Promise<Project> {
    try {
      // Prova ad aggiornare il progetto esistente
      const result = await this.updateProject(localProject.id, localProject);
      return result.project;
    } catch (error) {
      // Se non esiste, crealo
      const result = await this.createProject({
        name: localProject.name,
        description: localProject.description,
        excelData: localProject.excelData,
        config: localProject.config,
      });
      return result.project;
    }
  }

  /**
   * Download di un backup JSON
   */
  async downloadBackup(projectId: string, fileName?: string): Promise<void> {
    const result = await this.exportProject(projectId);
    
    const blob = new Blob([JSON.stringify(result.backupData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `backup-${projectId}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Istanza singleton del servizio API
export const apiService = new ApiService();

// Utility per gestire errori di rete
export const handleApiError = (error: Error): string => {
  if (error.message.includes('fetch')) {
    return 'Impossibile raggiungere il server. Verifica la connessione.';
  }
  if (error.message.includes('404')) {
    return 'Risorsa non trovata sul server.';
  }
  if (error.message.includes('500')) {
    return 'Errore interno del server. Riprova più tardi.';
  }
  return error.message || 'Errore sconosciuto durante la comunicazione con il server.';
};

// Hook per verificare lo stato dell'API
export const useApiStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const online = await apiService.isOnline();
      setIsOnline(online);
      setLastCheck(new Date());
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check ogni 30 secondi

    return () => clearInterval(interval);
  }, []);

  return { isOnline, lastCheck };
};

export default apiService;
