import { Project } from '../types/analysis';

/**
 * Sistema di backup robusto per Thematic Excel Lens
 * Supporta backup/ripristino in formato JSON e integrazione con Excel
 */

export interface BackupData {
  version: string;
  timestamp: string;
  project: Project;
  metadata: {
    appVersion: string;
    exportedBy: string;
    description?: string;
    tags?: string[];
  };
}

export interface BackupInfo {
  id: string;
  name: string;
  description?: string;
  timestamp: string;
  size: number;
  format: 'json' | 'excel' | 'tar.gz';
  version: string;
}

/**
 * Crea un backup completo del progetto corrente in formato JSON
 */
export const createJSONBackup = (
  project: Project, 
  description?: string,
  tags?: string[]
): BackupData => {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    project: JSON.parse(JSON.stringify(project)), // Deep clone
    metadata: {
      appVersion: '1.0.0',
      exportedBy: 'Thematic Excel Lens',
      description,
      tags
    }
  };
};

/**
 * Esporta un backup come file JSON scaricabile
 */
export const exportJSONBackup = (backupData: BackupData, filename?: string): void => {
  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Valida un file di backup JSON
 */
export const validateBackupJSON = (jsonData: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!jsonData.version) {
    errors.push('Versione backup mancante');
  }
  
  if (!jsonData.timestamp) {
    errors.push('Timestamp backup mancante');
  }
  
  if (!jsonData.project) {
    errors.push('Dati progetto mancanti');
  } else {
    if (!jsonData.project.id) {
      errors.push('ID progetto mancante');
    }
    if (!jsonData.project.name) {
      errors.push('Nome progetto mancante');
    }
    if (!jsonData.project.excelData) {
      errors.push('Dati Excel mancanti');
    }
  }
  
  if (!jsonData.metadata) {
    errors.push('Metadati backup mancanti');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Ripristina un progetto da backup JSON
 */
export const restoreFromJSONBackup = (jsonData: any): { success: boolean; project?: Project; errors?: string[] } => {
  const validation = validateBackupJSON(jsonData);
  
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }
  
  try {
    // Aggiorna l'ID del progetto e il timestamp per evitare conflitti
    const restoredProject: Project = {
      ...jsonData.project,
      id: `restored_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: `${jsonData.project.name} (Ripristinato)`
    };
    
    return {
      success: true,
      project: restoredProject
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Errore durante il ripristino: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`]
    };
  }
};

/**
 * Carica e analizza un file JSON di backup
 */
export const loadJSONBackupFile = (file: File): Promise<{ success: boolean; backupData?: BackupData; errors?: string[] }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const validation = validateBackupJSON(jsonData);
        
        if (validation.valid) {
          resolve({
            success: true,
            backupData: jsonData
          });
        } else {
          resolve({
            success: false,
            errors: validation.errors
          });
        }
      } catch (error) {
        resolve({
          success: false,
          errors: [`Errore parsing JSON: ${error instanceof Error ? error.message : 'File non valido'}`]
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['Errore lettura file']
      });
    };
    
    reader.readAsText(file);
  });
};

/**
 * Crea un backup integrato con Excel (crea dati con metadati incorporati)
 */
export const createExcelBackupWithMetadata = (
  project: Project,
  description?: string
): { excelData: any; metadata: BackupData } => {
  const backupData = createJSONBackup(project, description);
  
  // Crea una struttura estesa con i metadati
  const excelWithMetadata = {
    fileName: `${project.excelData.fileName}_backup_${new Date().toISOString().slice(0, 10)}`,
    headers: [
      ...project.excelData.headers,
      '__BACKUP_VERSION__',
      '__BACKUP_TIMESTAMP__', 
      '__PROJECT_ID__',
      '__PROJECT_NAME__'
    ],
    rows: project.excelData.rows.map((row, index) => [
      ...row,
      index === 0 ? backupData.version : '',
      index === 0 ? backupData.timestamp : '',
      index === 0 ? project.id : '',
      index === 0 ? project.name : ''
    ]),
    // Aggiungi i metadati come proprietà separate
    backupMetadata: {
      version: backupData.version,
      timestamp: backupData.timestamp,
      project: project,
      description: description,
      originalHeaders: project.excelData.headers,
      config: JSON.stringify(project.config)
    }
  };
  
  return {
    excelData: excelWithMetadata,
    metadata: backupData
  };
};

/**
 * Estrae i metadati di backup da un file Excel con backup integrato
 */
export const extractBackupFromExcel = (excelData: any): { 
  hasBackup: boolean; 
  backupData?: BackupData; 
  originalData?: any;
  errors?: string[] 
} => {
  try {
    // Controlla se ha i metadati di backup
    if (!excelData.backupMetadata) {
      // Prova a verificare se ci sono colonne di backup negli header
      const headers = excelData.headers || [];
      const hasBackupHeaders = headers.some((h: string) => h.startsWith('__BACKUP_'));
      
      if (!hasBackupHeaders) {
        return { hasBackup: false };
      }
      
      // Estrai dati dalle colonne di backup
      const versionCol = headers.findIndex((h: string) => h === '__BACKUP_VERSION__');
      const timestampCol = headers.findIndex((h: string) => h === '__BACKUP_TIMESTAMP__');
      const projectIdCol = headers.findIndex((h: string) => h === '__PROJECT_ID__');
      const projectNameCol = headers.findIndex((h: string) => h === '__PROJECT_NAME__');
      
      if (versionCol === -1 || timestampCol === -1) {
        return { hasBackup: false };
      }
      
      // Prendi i metadati dalla prima riga
      const firstRow = excelData.rows[0] || [];
      const version = firstRow[versionCol];
      const timestamp = firstRow[timestampCol];
      const projectId = firstRow[projectIdCol];
      const projectName = firstRow[projectNameCol];
      
      // Rimuovi le colonne di backup per ottenere i dati originali
      const originalHeaders = headers.filter((h: string) => !h.startsWith('__BACKUP_'));
      const originalRows = excelData.rows.map((row: any[]) => 
        row.filter((_, index) => !headers[index]?.startsWith('__BACKUP_'))
      );
      
      const originalData = {
        headers: originalHeaders,
        rows: originalRows,
        fileName: excelData.fileName?.replace('_backup_', '_') || 'restored_file.xlsx'
      };
      
      const backupData: BackupData = {
        version: version || '1.0.0',
        timestamp: timestamp || new Date().toISOString(),
        project: {
          id: projectId || `restored_${Date.now()}`,
          name: projectName || 'Progetto Ripristinato',
          excelData: originalData,
          config: { columnMetadata: [], isConfigured: false }, // Configurazione vuota
          createdAt: Date.now(),
          createdBy: 'backup_restore',
          lastModified: Date.now(),
          isActive: true,
          collaborators: [],
          labels: [],
          cellLabels: [],
          rowLabels: []
        },
        metadata: {
          appVersion: '1.0.0',
          exportedBy: 'Thematic Excel Lens',
          description: 'Ripristinato da backup Excel'
        }
      };
      
      return {
        hasBackup: true,
        backupData,
        originalData
      };
    }
    
    // Se ha metadati completi
    const metadata = excelData.backupMetadata;
    let projectConfig;
    try {
      projectConfig = JSON.parse(metadata.config);
    } catch {
      projectConfig = { columnMetadata: [], isConfigured: false };
    }
    
    const originalData = {
      headers: metadata.originalHeaders,
      rows: excelData.rows,
      fileName: excelData.fileName
    };
    
    const backupData: BackupData = {
      version: metadata.version,
      timestamp: metadata.timestamp,
      project: {
        ...metadata.project,
        config: projectConfig,
        excelData: originalData
      },
      metadata: {
        appVersion: '1.0.0',
        exportedBy: 'Thematic Excel Lens',
        description: metadata.description
      }
    };
    
    return {
      hasBackup: true,
      backupData,
      originalData
    };
  } catch (error) {
    return {
      hasBackup: false,
      errors: [`Errore estrazione backup: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`]
    };
  }
};

/**
 * Ottiene informazioni sui backup disponibili (placeholder per futura implementazione con storage locale)
 */
export const getAvailableBackups = (): BackupInfo[] => {
  // TODO: Implementare con localStorage o IndexedDB per backup persistenti
  const stored = localStorage.getItem('thematic_backups_list');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

/**
 * Salva informazioni backup nel storage locale
 */
export const saveBackupInfo = (backupInfo: BackupInfo): void => {
  const existing = getAvailableBackups();
  const updated = [...existing, backupInfo];
  localStorage.setItem('thematic_backups_list', JSON.stringify(updated));
};

/**
 * Rimuove informazioni backup dal storage locale
 */
export const removeBackupInfo = (backupId: string): void => {
  const existing = getAvailableBackups();
  const updated = existing.filter(b => b.id !== backupId);
  localStorage.setItem('thematic_backups_list', JSON.stringify(updated));
};
