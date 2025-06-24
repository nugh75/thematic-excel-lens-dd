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

// Sistema di classificazione gerarchico unificato
export interface ColumnClassification {
  type: 'anagrafica' | 'non_anagrafica' | 'non_classificata';
  subtype: 'chiusa' | 'aperta' | null;
  category: string | null; // Ora accetta qualsiasi stringa per categorie personalizzate
  confidence: number;
  aiGenerated: boolean;
  classifiedAt?: number;
  classifiedBy?: 'user' | 'ai' | 'auto';
}

// Categorie predefinite per riferimento
export const PREDEFINED_CATEGORIES = {
  anagrafica: [
    'età', 'genere', 'titolo_studio', 'professione', 'stato_civile', 
    'residenza', 'nazionalità', 'reddito', 'nucleo_familiare', 
    'settore_lavorativo', 'esperienza_lavorativa', 'lingua', 'disabilità'
  ],
  non_anagrafica: [
    'scala_likert', 'rating_numerico', 'scelta_multipla', 'scelta_singola',
    'si_no', 'vero_falso', 'graduatoria', 'matrice'
  ]
} as const;

// Legacy interface mantenuta per compatibilità con il vecchio sistema
export interface LegacyColumnClassification {
  level1: 'demographic' | 'non_demographic';
  level2?: 'closed' | 'open' | 'age' | 'gender' | 'location' | 'education' | 'profession' | 'other';
  level3?: 'structured' | 'unstructured' | 'numeric' | 'likert' | 'yesno' | 'multichoice' | 'singlechoice';
  finalType: ColumnType;
  confidence?: number;
  autoDetected?: boolean;
  classifiedAt?: number;
  classifiedBy?: 'user' | 'ai' | 'auto';
}

// Nuovi types per operazioni batch
export interface BatchClassificationOperation {
  selectedColumns: number[];
  step: ClassificationStep;
  classification: Partial<ColumnClassification>;
  timestamp: number;
  operationId: string;
}

export interface ColumnSelectionState {
  selectedColumns: Set<number>;
  selectAll: boolean;
  selectionMode: 'manual' | 'pattern' | 'type';
  filterPattern?: string;
  filterType?: ColumnType;
}

export enum ClassificationStep {
  SELECTION = 'selection',
  LEVEL1 = 'level1',
  LEVEL2 = 'level2', 
  LEVEL3 = 'level3',
  PREVIEW = 'preview',
  COMPLETE = 'complete'
}

export interface BatchClassificationState {
  currentStep: ClassificationStep;
  selectionState: ColumnSelectionState;
  pendingClassification: Partial<ColumnClassification>;
  previewChanges: Array<{
    columnIndex: number;
    columnName: string;
    oldType?: ColumnType;
    newType: ColumnType;
    oldClassification?: ColumnClassification;
    newClassification: ColumnClassification;
  }>;
  canUndo: boolean;
  operationHistory: BatchClassificationOperation[];
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

export interface Project {
  id: string;
  name: string;
  description: string;
  excelData: ExcelData;
  config: ProjectConfig;
  labels: Label[];
  cellLabels: CellLabel[];
  rowLabels: RowLabel[];
  createdAt: number;
  createdBy: string;
  lastModified: number;
  isActive: boolean;
  collaborators: string[];
}

// Tipo per le liste di progetti, più leggero di Project
export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  lastModified: number;
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
  projects: ProjectListItem[];
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
  cellId: string;
  conflictingLabelIds: string[];
  chosenLabelId: string;
  resolvedBy: string;
  resolvedAt: number;
  reason?: string;
}

export interface Label {
  id: string;
  name: string;
  description: string;
  color: string;
  tags?: TagPredefinito[];
  rules?: any; // Per regole di auto-etichettatura
  createdAt: number;
  createdBy: string;
}

export interface CellLabel {
  cellId: string; // es. "A1", "B2"
  labelIds: string[];
  userId?: string;
  timestamp?: number;
  conflict?: {
    originalLabelId: string;
    resolvedBy: string;
    resolvedAt: number;
  };
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
  email?: string;
  avatar?: string;
  color: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  lastSeen?: number;
  createdAt: number;
}

export interface LabelingSession {
  id: string;
  userId: string;
  projectId: string;
  startTime: number;
  endTime?: number;
  actions: any[]; // Log delle azioni per l'analisi del comportamento
}
