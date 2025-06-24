export interface ExcelData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

// Tag predefiniti per la categorizzazione delle etichette
export const TAG_PREDEFINITI = [
  'Emozioni',
  'Problemi',
  'Soddisfazione', 
  'Demografia',
  'Sentiment',
  'Comportamentali',
  'Tematiche',
  'Urgenza',
  'Qualità',
  'Servizio',
  'Prodotto',
  'Processo',
  'Comunicazione',
  'Esperienza',
  'Feedback',
  'Miglioramenti'
] as const;

export type TagPredefinito = typeof TAG_PREDEFINITI[number];

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
  | 'demographic'     // Anagrafiche
  | 'non_demographic' // Non anagrafiche
  
  // Livello 2: Per non anagrafiche
  | 'closed'          // Chiuse
  | 'open'            // Aperte
  
  // Livello 3: Sottotipi per domande aperte
  | 'open_structured'    // Aperte strutturate
  | 'open_unstructured'  // Aperte non strutturate
  
  // Livello 3: Sottotipi per domande chiuse
  | 'closed_numeric'        // Numeriche
  | 'closed_likert'         // Likert/scale
  | 'closed_yesno'          // Sì e No
  | 'closed_multichoice'    // Scelta multipla
  | 'closed_singlechoice'   // Scelta singola
  
  // Livello 2: Sottotipi per domande anagrafiche
  | 'demographic_age'       // Età
  | 'demographic_gender'    // Genere
  | 'demographic_location'  // Posizione geografica
  | 'demographic_education' // Livello di istruzione
  | 'demographic_profession'// Professione
  | 'demographic_other';    // Altre informazioni anagrafiche

export interface ColumnClassification {
  level1: 'demographic' | 'non_demographic';
  level2?: 'closed' | 'open' | 'age' | 'gender' | 'location' | 'education' | 'profession' | 'other';
  level3?: 'structured' | 'unstructured' | 'numeric' | 'likert' | 'yesno' | 'multichoice' | 'singlechoice';
  finalType: ColumnType;
  confidence?: number;
  autoDetected?: boolean;
  classifiedAt?: number;
  classifiedBy?: 'user' | 'ai' | 'auto';
}

export interface ColumnMetadata {
  index: number;
  name: string;
  type: ColumnType;
  classification?: ColumnClassification;
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
  yesNoFormat?: {
    yesValues: string[];
    noValues: string[];
  };
  demographicDetails?: {
    subtype: string;
    expectedFormat?: string;
    validationRules?: string[];
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
  tags?: string[];
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
  passwordHash?: string;
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
