
export interface ExcelData {
  headers: string[];
  rows: string[][];
  fileName: string;
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
