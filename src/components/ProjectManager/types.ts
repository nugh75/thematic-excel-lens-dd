// Tipi sicuri per il sistema di gestione progetti
export interface SafeExcelData {
  fileName: string;
  headers: string[];
  rows: any[][];
}

export interface SafeProject {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  lastModified: number;
  createdBy: string;
  collaborators: string[];
  labels: any[]; // Manterremo il tipo esistente per ora
  cellLabels: any[]; // Manterremo il tipo esistente per ora
  rowLabels: any[]; // Manterremo il tipo esistente per ora
  excelData?: SafeExcelData;
}

export interface SafeUser {
  id: string;
  name: string;
  email?: string;
  role?: string;
  color: string;
}

// Adapter per convertire ProjectListItem in SafeProject
export const adaptProjectListItem = (project: any): SafeProject | null => {
  if (!project?.id || !project?.name) {
    return null;
  }
  
  return {
    id: project.id,
    name: project.name,
    description: project.description || '',
    createdAt: project.createdAt || Date.now(),
    lastModified: project.lastModified || Date.now(),
    createdBy: project.createdBy || '',
    collaborators: Array.isArray(project.collaborators) ? project.collaborators : [],
    labels: Array.isArray(project.labels) ? project.labels : [],
    cellLabels: Array.isArray(project.cellLabels) ? project.cellLabels : [],
    rowLabels: Array.isArray(project.rowLabels) ? project.rowLabels : [],
    excelData: project.excelData ? {
      fileName: project.excelData.fileName || 'File sconosciuto',
      headers: Array.isArray(project.excelData.headers) ? project.excelData.headers : [],
      rows: Array.isArray(project.excelData.rows) ? project.excelData.rows : []
    } : undefined
  };
};

// Funzioni helper per accesso sicuro ai dati
export const getProjectFileName = (project?: SafeProject): string => {
  if (!project?.excelData?.fileName) {
    return 'File non disponibile';
  }
  return project.excelData.fileName;
};

export const getProjectDimensions = (project?: SafeProject): string => {
  if (!project?.excelData) {
    return '0 righe × 0 colonne';
  }
  
  const rows = project.excelData.rows?.length || 0;
  const cols = project.excelData.headers?.length || 0;
  return `${rows} righe × ${cols} colonne`;
};

export const getProjectStats = (project?: SafeProject) => {
  if (!project) {
    return {
      labels: 0,
      cellLabels: 0,
      rowLabels: 0
    };
  }
  
  return {
    labels: project.labels?.length || 0,
    cellLabels: project.cellLabels?.length || 0,
    rowLabels: project.rowLabels?.length || 0
  };
};

export const isProjectValid = (project?: any): project is SafeProject => {
  return project && 
         typeof project.id === 'string' && 
         typeof project.name === 'string' &&
         typeof project.createdAt === 'number' &&
         Array.isArray(project.collaborators);
};

// Utility per formattare date in modo sicuro
export const formatDate = (timestamp?: number): string => {
  if (!timestamp || typeof timestamp !== 'number') {
    return 'Data non disponibile';
  }
  
  try {
    return new Date(timestamp).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Data non valida';
  }
};

// Utility per ottenere nomi utenti in modo sicuro
export const getUserName = (userId: string, users: SafeUser[]): string => {
  if (!userId || !Array.isArray(users)) {
    return 'Utente sconosciuto';
  }
  
  const user = users.find(u => u?.id === userId);
  return user?.name || 'Utente sconosciuto';
};

export const getCollaboratorNames = (collaboratorIds: string[], users: SafeUser[]): string[] => {
  if (!Array.isArray(collaboratorIds) || !Array.isArray(users)) {
    return [];
  }
  
  return collaboratorIds
    .map(id => getUserName(id, users))
    .filter(name => name !== 'Utente sconosciuto');
};
