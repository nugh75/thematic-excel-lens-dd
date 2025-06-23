export interface ExcelData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

// Tipi per le statistiche delle etichette per colonna
export interface LabelDistribution {
  label: string;
  count: number;
  percentage: number;
  examples: string[];
}

export interface ColumnStatsData {
  columnIndex: number;
  columnName: string;
  columnType: ColumnType;
  totalRows: number;
  labeledRows: number;
  coveragePercentage: number;
  uniqueLabels: number;
  labelDistribution: LabelDistribution[];
}

export interface ColumnStatsFilters {
  columnType?: ColumnType;
  minCoverage?: number;
  searchTerm?: string;
  sortBy?: 'name' | 'coverage' | 'labels' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export type ColumnType = 
  // Livello 1: Categorie principali
  | 'demographic' 
  | 'closed' 
  | 'open'
  // Livello 2: Sottotipi per domande chiuse
  | 'likert'
  | 'numeric' 
  | 'multiplechoice'
  // Livello 3: Sottotipi per domande anagrafiche
  | 'demographic_multiplechoice'
  | 'demographic_numeric'
  | 'demographic_code';

export interface ColumnMetadata {
  index: number;
  name: string;
  type: ColumnType;
  description?: string;
  isRequired?: boolean;
  autoDetected?: boolean;
  sampleValues?: string[];
  
  // Configurazioni specifiche per tipo
  likertScale?: {
    min: number;
    max: number;
    labels?: string[];
  };
  multipleChoiceOptions?: string[];
  numericRange?: {
    min?: number;
    max?: number;
    unit?: string;
  };
  codeFormat?: {
    pattern?: string;
    prefix?: string;
    length?: number;
  };
}

export interface ProjectConfig {
  columnMetadata: ColumnMetadata[];
  isConfigured: boolean;
  configuredAt?: number;
  configuredBy?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  parentId?: string;
  children?: Label[];
  count?: number;
}

export interface CellLabel {
  cellId: string;
  rowIndex: number;
  colIndex: number;
  labelIds: string[];
  userId?: string;
  timestamp?: number;
}

export interface RowLabel {
  rowIndex: number;
  labelIds: string[];
  userId?: string;
  timestamp?: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  email?: string;
  role?: 'admin' | 'annotator' | 'viewer';
  createdAt?: number;
}

export interface LabelingSession {
  id: string;
  name: string;
  createdAt: number;
  createdBy: string;
  cellLabels: CellLabel[];
  rowLabels: RowLabel[];
  labels: Label[];
}

export interface ThematicAnalysis {
  excelData: ExcelData | null;
  labels: Label[];
  cellLabels: CellLabel[];
  rowLabels: RowLabel[];
  users: User[];
  currentUser: User | null;
  sessions: LabelingSession[];
  currentSession: LabelingSession | null;
  projects: Project[];
  currentProject: Project | null;
}

export interface AnalysisStats {
  totalLabels: number;
  totalCellsLabeled: number;
  totalRowsLabeled: number;
  labelDistribution: { [labelId: string]: number };
  hierarchyDepth: number;
  userStats: { [userId: string]: { cellsLabeled: number; rowsLabeled: number } };
}

export interface ConflictResolution {
  cellId?: string;
  rowIndex?: number;
  conflictingLabels: { userId: string; labelIds: string[] }[];
  resolvedLabelIds: string[];
  resolvedBy: string;
  resolvedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  excelData: ExcelData;
  config: ProjectConfig;
  createdAt: number;
  createdBy: string;
  lastModified: number;
  isActive: boolean;
  collaborators: string[]; // User IDs
  labels: Label[];
  cellLabels: CellLabel[];
  rowLabels: RowLabel[];
}
