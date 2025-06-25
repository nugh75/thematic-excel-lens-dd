import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ThematicAnalysis, 
  Label, 
  CellLabel, 
  RowLabel, 
  ExcelData, 
  User, 
  LabelingSession, 
  ConflictResolution, 
  Project, 
  ColumnMetadata, 
  ColumnType, 
  ColumnClassification, 
  ProjectListItem
} from '../types/analysis';
import { apiService } from '../services/apiService';
import { offlineManager } from '../services/offlineManager';

// Variabile per il debouncing dell'autosave
let autoSaveTimeout: NodeJS.Timeout | null = null;

interface AnalysisState extends ThematicAnalysis {
  projects: ProjectListItem[];
  currentProject: Project | null;
  setExcelData: (data: ExcelData) => void;
  addLabel: (label: Omit<Label, 'id'>) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;
  mergeLabels: (sourceLabels: string[], targetLabel: string) => void;
  addCellLabel: (cellLabel: CellLabel) => void;
  removeCellLabel: (cellId: string, labelId: string) => void;
  addRowLabel: (rowLabel: RowLabel) => void;
  removeRowLabel: (rowIndex: number, labelId: string) => void;
  clearAnalysis: () => void;
  getLabelStats: () => { [labelId: string]: number };
  
  // User management
  addUser: (user: Omit<User, 'id'>) => void;
  setCurrentUser: (userId: string) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  
  // Project management methods
  createProject: (name: string, description: string, excelData: ExcelData) => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  addCollaborator: (projectId: string, userId: string) => void;
  removeCollaborator: (projectId: string, userId: string) => void;
  switchProject: (projectId: string) => Promise<void>;
  
  // API Integration methods
  syncWithServer: () => Promise<void>;
  getServerProjects: () => Promise<void>;
  importProjectFromBackup: (backupData: any) => Promise<void>;
  exportProjectToBackup: (projectId?: string) => Promise<void>;
  autoSaveProject: () => Promise<boolean>;
  
  // Offline management
  processOfflineQueue: () => Promise<void>;
  getPendingOperationsCount: () => number;
  clearOfflineQueue: () => void;
  
  // Server status
  isServerOnline: boolean;
  setServerOnline: (online: boolean) => void;
  isSaving: boolean;
  lastSaved: number | null;
  error: string | null;
  
  // Column configuration
  configureColumns: (columnMetadata: ColumnMetadata[]) => void;
  updateColumnType: (columnIndex: number, type: ColumnType) => void;
  updateColumnMetadata: (metadata: ColumnMetadata) => void;
  
  // Batch classification functions
  bulkClassifyColumns: (columnIndexes: number[], classification: Partial<ColumnClassification>) => void;
  updateMultipleColumnMetadata: (updates: Array<{index: number, metadata: Partial<ColumnMetadata>}>) => void;
  selectColumnsByPattern: (pattern: string, caseSensitive?: boolean) => number[];
  selectColumnsByType: (type: ColumnType, includeUnclassified?: boolean) => number[];
  selectColumnsByRange: (startIndex: number, endIndex: number) => number[];
  previewBatchClassification: (columnIndexes: number[], classification: Partial<ColumnClassification>) => Array<{
    columnIndex: number;
    columnName: string;
    oldType?: ColumnType;
    newType: ColumnType;
    oldClassification?: ColumnClassification;
    newClassification: ColumnClassification;
  }>;
  
  getOpenQuestionColumns: () => ColumnMetadata[];
  getClosedQuestionColumns: () => ColumnMetadata[];
  getDemographicColumns: () => ColumnMetadata[];
  
  // Computed properties for easy access
  columnMetadata: ColumnMetadata[];
}

const defaultUser: User = {
  id: 'default-user',
  name: 'Utente Principale',
  color: '#3B82F6',
  isActive: true,
  role: 'admin',
  createdAt: Date.now(),
};

// Auto-detect column type based on header name and sample values
const autoDetectColumnType = (headerName: string, sampleValues: string[]): ColumnType => {
  const header = headerName.toLowerCase();
  
  // Demographic indicators
  const demographicKeywords = [
    'età', 'age', 'sesso', 'sex', 'genere', 'gender', 'città', 'city', 'provincia', 'region',
    'titolo', 'education', 'istruzione', 'lavoro', 'job', 'professione', 'profession',
    'nome', 'name', 'cognome', 'surname', 'email', 'telefono', 'phone', 'indirizzo', 'address',
    'cap', 'codice', 'id', 'anagrafica', 'demographic', 'stato civile', 'marital'
  ];
  
  // Check for demographic fields first
  if (demographicKeywords.some(keyword => header.includes(keyword))) {
    // More specific demographic typing
    if (header.includes('età') || header.includes('age') || header.includes('anno')) {
      return 'demographic_age';
    }
    if (header.includes('sesso') || header.includes('genere') || header.includes('gender')) {
      return 'demographic_gender';
    }
    if (header.includes('città') || header.includes('provincia') || header.includes('regione')) {
      return 'demographic_location';
    }
    if (header.includes('istruzione') || header.includes('education') || header.includes('titolo')) {
      return 'demographic_education';
    }
    if (header.includes('lavoro') || header.includes('professione') || header.includes('profession')) {
      return 'demographic_profession';
    }
    // Default demographic
    return 'demographic_other';
  }
  
  // Question type indicators
  const likertKeywords = ['scala', 'scale', 'valuta', 'rate', 'rating', 'soddisfazione', 'satisfaction', 'accordo'];
  const numericKeywords = ['numero', 'number', 'quantità', 'quantity', 'prezzo', 'price', 'euro', 'dollaro', 'valore'];
  
  // Analyze sample values
  if (sampleValues.length > 0) {
    const uniqueValues = [...new Set(sampleValues)];
    const avgLength = sampleValues.reduce((sum, val) => sum + val.length, 0) / sampleValues.length;
    
    // Check if values look like numeric
    const numericValues = sampleValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (numericValues.length > sampleValues.length * 0.8) {
      // Check if it's a Likert scale (1-5, 1-7, 1-10)
      const likertValues = numericValues.filter(v => v >= 1 && v <= 10 && Number.isInteger(v));
      if (likertValues.length > sampleValues.length * 0.7) {
        const min = Math.min(...likertValues);
        const max = Math.max(...likertValues);
        if (min === 1 && (max === 5 || max === 7 || max === 10)) {
          return 'closed_likert';
        }
      }
      return 'closed_numeric';
    }
    
    // Check for Likert keywords in header
    if (likertKeywords.some(keyword => header.includes(keyword))) {
      return 'closed_likert';
    }
    
    // Check for numeric keywords in header
    if (numericKeywords.some(keyword => header.includes(keyword))) {
      return 'closed_numeric';
    }
    
    // If few unique values and short text, likely multiple choice
    if (uniqueValues.length <= 10 && avgLength <= 50) {
      return 'closed_singlechoice';
    }
    
    // If many unique values or long text, likely open question
    if (uniqueValues.length > 10 || avgLength > 50) {
      return 'open';
    }
  }
  
  // Default to open for unknown cases
  return 'open';
};

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      excelData: null,
      labels: [],
      cellLabels: [],
      rowLabels: [],
      users: [defaultUser],
      currentUser: defaultUser,
      sessions: [],
      currentSession: null,
      projects: [],
      currentProject: null,
      isServerOnline: true,
      isSaving: false,
      lastSaved: null,
      error: null,
      columnMetadata: [],

      // setExcelData now simply triggers project creation
      setExcelData: (data: ExcelData) => {
        const { saveCurrentProject, createProject } = get();
        // Prima salva il lavoro corrente, poi crea il nuovo progetto
        saveCurrentProject().then(() => {
          createProject(data.fileName, `Progetto creato da ${data.fileName}`, data);
        });
      },

      addLabel: (labelData) => {
        const newLabel: Label = { ...labelData, id: Date.now().toString() };
        set((state) => ({ labels: [...state.labels, newLabel] }));
        get().autoSaveProject();
      },

      updateLabel: (id, updates) => {
        set((state) => ({
          labels: state.labels.map((label) =>
            label.id === id ? { ...label, ...updates } : label
          ),
        }));
        get().autoSaveProject();
      },

      deleteLabel: (id) => {
        set((state) => ({
          labels: state.labels.filter((label) => label.id !== id),
          cellLabels: state.cellLabels.map((cellLabel) => ({
            ...cellLabel,
            labelIds: cellLabel.labelIds.filter((labelId) => labelId !== id),
          })),
          rowLabels: state.rowLabels.map((rowLabel) => ({
            ...rowLabel,
            labelIds: rowLabel.labelIds.filter((labelId) => labelId !== id),
          })),
        }));
        get().autoSaveProject();
      },

      mergeLabels: (sourceLabels, targetLabel) => {
        set((state) => {
          const targetExists = state.labels.some(label => label.id === targetLabel);
          if (!targetExists) {
            return state;
          }

          const updatedCellLabels = state.cellLabels.map(cellLabel => ({
            ...cellLabel,
            labelIds: [...new Set(cellLabel.labelIds.map(id => sourceLabels.includes(id) ? targetLabel : id))]
          }));

          const updatedRowLabels = state.rowLabels.map(rowLabel => ({
            ...rowLabel,
            labelIds: [...new Set(rowLabel.labelIds.map(id => sourceLabels.includes(id) ? targetLabel : id))]
          }));

          const updatedLabels = state.labels.filter(label => !sourceLabels.includes(label.id));

          return {
            labels: updatedLabels,
            cellLabels: updatedCellLabels,
            rowLabels: updatedRowLabels,
          };
        });
        get().autoSaveProject();
      },

      addCellLabel: (cellLabel) => {
        set((state) => {
          const existingIndex = state.cellLabels.findIndex(cl => cl.cellId === cellLabel.cellId);
          if (existingIndex >= 0) {
            const updatedCellLabels = [...state.cellLabels];
            updatedCellLabels[existingIndex] = {
              ...updatedCellLabels[existingIndex],
              labelIds: [...new Set([...updatedCellLabels[existingIndex].labelIds, ...cellLabel.labelIds])],
              timestamp: Date.now(),
              userId: state.currentUser?.id,
            };
            return { cellLabels: updatedCellLabels };
          } else {
            return { cellLabels: [...state.cellLabels, { ...cellLabel, userId: state.currentUser?.id, timestamp: Date.now() }] };
          }
        });
        get().autoSaveProject();
      },

      removeCellLabel: (cellId, labelId) => {
        set((state) => ({
          cellLabels: state.cellLabels.map((cellLabel) =>
            cellLabel.cellId === cellId
              ? { ...cellLabel, labelIds: cellLabel.labelIds.filter((id) => id !== labelId), timestamp: Date.now() }
              : cellLabel
          ).filter((cellLabel) => cellLabel.labelIds.length > 0),
        }));
        get().autoSaveProject();
      },

      addRowLabel: (rowLabel) => {
        set((state) => {
          const existingIndex = state.rowLabels.findIndex(rl => rl.rowIndex === rowLabel.rowIndex);
          if (existingIndex >= 0) {
            const updatedRowLabels = [...state.rowLabels];
            updatedRowLabels[existingIndex] = {
              ...updatedRowLabels[existingIndex],
              labelIds: [...new Set([...updatedRowLabels[existingIndex].labelIds, ...rowLabel.labelIds])],
              timestamp: Date.now(),
              userId: state.currentUser?.id,
            };
            return { rowLabels: updatedRowLabels };
          } else {
            return { rowLabels: [...state.rowLabels, { ...rowLabel, userId: state.currentUser?.id, timestamp: Date.now() }] };
          }
        });
        get().autoSaveProject();
      },

      removeRowLabel: (rowIndex, labelId) => {
        set((state) => ({
          rowLabels: state.rowLabels.map((rowLabel) =>
            rowLabel.rowIndex === rowIndex
              ? { ...rowLabel, labelIds: rowLabel.labelIds.filter((id) => id !== labelId), timestamp: Date.now() }
              : rowLabel
          ).filter((rowLabel) => rowLabel.labelIds.length > 0),
        }));
        get().autoSaveProject();
      },

      clearAnalysis: () => set({ 
        excelData: null, 
        labels: [], 
        cellLabels: [], 
        rowLabels: [],
        sessions: [],
        currentSession: null,
        currentProject: null,
        columnMetadata: [],
        isSaving: false,
        lastSaved: null,
        error: null,
      }),

      // Project management
      createProject: async (name, description, excelData) => {
        const { currentUser } = get();
        const columnMetadata: ColumnMetadata[] = excelData.headers.map((header, index) => {
            const sampleValues = excelData.rows.slice(0, 10).map(row => row[index]).filter(Boolean);
            return {
              index,
              name: header,
              type: autoDetectColumnType(header, sampleValues),
              autoDetected: true,
              sampleValues: sampleValues.slice(0, 5),
            };
        });

        try {
          const newProjectData = {
            name,
            description,
            excelData,
            config: { columnMetadata, isConfigured: false },
            createdBy: currentUser?.id || 'unknown',
          };
          const { project: newProject } = await apiService.createProject(newProjectData as any);
          
          const newProjectListItem: ProjectListItem = {
            id: newProject.id,
            name: newProject.name,
            description: newProject.description,
            createdAt: newProject.createdAt,
            lastModified: newProject.lastModified,
          };

          set((state) => ({
            projects: [...state.projects, newProjectListItem],
            currentProject: newProject,
            excelData: newProject.excelData,
            labels: newProject.labels || [],
            cellLabels: newProject.cellLabels || [],
            rowLabels: newProject.rowLabels || [],
            columnMetadata: newProject.config.columnMetadata || [],
            isServerOnline: true,
            lastSaved: newProject.lastModified,
            error: null,
          }));
        } catch (error) {
          console.error('Errore creazione progetto, fallback locale:', error);
          const newProject: Project = {
            id: `local_${Date.now().toString()}`,
            name,
            description,
            excelData,
            config: { columnMetadata, isConfigured: false },
            createdAt: Date.now(),
            createdBy: currentUser?.id || 'unknown',
            lastModified: Date.now(),
            isActive: true,
            collaborators: [currentUser?.id || 'unknown'],
            labels: [],
            cellLabels: [],
            rowLabels: [],
          };
          const newProjectListItem: ProjectListItem = {
            id: newProject.id,
            name: newProject.name,
            description: newProject.description,
            createdAt: newProject.createdAt,
            lastModified: newProject.lastModified,
          };
          set((state) => ({
            projects: [...state.projects, newProjectListItem],
            currentProject: newProject,
            excelData,
            labels: [],
            cellLabels: [],
            rowLabels: [],
            columnMetadata,
            isServerOnline: false,
            error: "Creazione progetto fallita. Lavorando in modalità offline."
          }));
        }
      },

      loadProject: async (projectId) => {
        try {
          const { project } = await apiService.getProject(projectId);
          
          // Validazione robusta dei dati del progetto
          if (!project) {
            throw new Error('Progetto non trovato');
          }
          
          set({
            currentProject: project,
            excelData: project.excelData || null,
            labels: project.labels || [],
            cellLabels: project.cellLabels || [],
            rowLabels: project.rowLabels || [],
            columnMetadata: project.config?.columnMetadata || [],
            isServerOnline: true,
            lastSaved: project.lastModified,
            error: null,
          });
        } catch (error) {
          console.error("Failed to load project from server:", error);
          set({ 
            isServerOnline: false, 
            error: "Caricamento fallito. Server non raggiungibile.",
            currentProject: null,
            excelData: null,
            labels: [],
            cellLabels: [],
            rowLabels: [],
            columnMetadata: []
          });
          // Fallback to local version if available
          const localProject = get().projects.find(p => p.id === projectId);
          if (localProject) {
            // This is a ProjectListItem, we can't load full data offline if not already present
            console.warn(`Project ${projectId} not fully available offline.`);
          }
        }
      },

      saveCurrentProject: async () => {
        const { currentProject, labels, cellLabels, rowLabels, columnMetadata, isServerOnline } = get();
        if (!currentProject || currentProject.id.startsWith('local_')) {
          return; // Non salvare progetti locali o non esistenti
        }

        set({ isSaving: true, error: null });

        if (isServerOnline) {
          try {
            const projectUpdate = {
              name: currentProject.name,
              description: currentProject.description,
              labels,
              cellLabels,
              rowLabels,
              config: { ...currentProject.config, columnMetadata },
              lastModified: Date.now(),
            };
            const { project: updatedProject } = await apiService.updateProject(currentProject.id, projectUpdate as any);
            set(state => ({
              currentProject: updatedProject,
              isServerOnline: true,
              isSaving: false,
              lastSaved: updatedProject.lastModified,
              error: null,
              projects: state.projects.map(p =>
                p.id === updatedProject.id
                  ? { ...p, name: updatedProject.name, description: updatedProject.description, lastModified: updatedProject.lastModified }
                  : p
              ),
            }));
          } catch (error) {
            console.error("Failed to save project to server:", error);
            set({ isServerOnline: false, isSaving: false, error: "Salvataggio fallito. Controlla la connessione." });
          }
        } else {
          // Server offline - salva in coda per la sincronizzazione
          console.warn("Server is offline. Queuing project changes for later sync.");
          
          // Salva localmente il progetto
          if (currentProject) {
            offlineManager.saveProjectLocally(currentProject);
            offlineManager.queueOperation('update', currentProject.id, currentProject);
          }
          
          set({ 
            isSaving: false, 
            error: "Offline: modifiche salvate localmente e in coda per la sincronizzazione." 
          });
        }
      },

      autoSaveProject: () => {
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout);
        }
        autoSaveTimeout = setTimeout(() => {
          get().saveCurrentProject();
        }, 2000); // Debounce di 2 secondi
        return Promise.resolve(true);
      },

      deleteProject: async (projectId) => {
        try {
          await apiService.deleteProject(projectId);
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== projectId),
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
            isServerOnline: true,
            error: null,
          }));
        } catch (error) {
          console.error("Failed to delete project on server:", error);
          set({ isServerOnline: false, error: "Eliminazione fallita." });
        }
      },
      
      setServerOnline: (online: boolean) => {
        if (online) {
            set({ isServerOnline: true, error: null });
        } else {
            set({ isServerOnline: false, error: "Connessione persa con il server." });
        }
      },

      updateProject: async (projectId, updates) => {
        try {
          const { project: updatedProject } = await apiService.updateProject(projectId, updates as any);
          set(state => {
            const updatedCurrentProject = state.currentProject?.id === projectId 
                ? { ...state.currentProject, ...updatedProject } 
                : state.currentProject;

            return {
              projects: state.projects.map(p => p.id === projectId ? { ...p, ...updatedProject } : p),
              currentProject: updatedCurrentProject,
            };
          });
        } catch (error) {
          console.error("Failed to update project:", error);
          set({ error: "Aggiornamento progetto fallito." });
        }
      },

      getServerProjects: async () => {
        try {
          const { projects } = await apiService.getProjects();
          set({ projects: projects, isServerOnline: true });
        } catch (error) {
          console.error("Failed to get projects from server:", error);
          set({ isServerOnline: false, error: "Impossibile caricare i progetti." });
        }
      },

      importProjectFromBackup: async (backupData) => {
        try {
          const { project } = await apiService.importProject(backupData);
          const newListItem: ProjectListItem = { 
              id: project.id, 
              name: project.name, 
              description: project.description, 
              createdAt: project.createdAt, 
              lastModified: project.lastModified 
          };
          set(state => ({ projects: [...state.projects, newListItem] }));
        } catch (error) {
          console.error("Failed to import project:", error);
          set({ error: "Importazione fallita." });
        }
      },

      exportProjectToBackup: async (projectId) => {
        const idToExport = projectId || get().currentProject?.id;
        if (!idToExport) return;
        try {
          await apiService.exportProject(idToExport);
        } catch (error) {
          console.error("Failed to export project:", error);
          set({ error: "Esportazione fallita." });
        }
      },

      addCollaborator: (projectId, userId) => {
        console.log('addCollaborator not implemented', projectId, userId);
      },

      removeCollaborator: (projectId, userId) => {
        console.log('removeCollaborator not implemented', projectId, userId);
      },

      switchProject: async (projectId) => {
        await get().loadProject(projectId);
      },

      getLabelStats: () => {
        const { cellLabels, rowLabels, labels } = get();
        const stats: { [labelId: string]: number } = {};
        labels.forEach(l => stats[l.id] = 0);
        cellLabels.forEach(cl => cl.labelIds.forEach(lId => { if(stats[lId] !== undefined) stats[lId]++; }));
        rowLabels.forEach(rl => rl.labelIds.forEach(lId => { if(stats[lId] !== undefined) stats[lId]++; }));
        return stats;
      },

      addUser: (user) => set(state => ({ users: [...state.users, { ...user, id: `user_${Date.now()}` }]})),
      setCurrentUser: (userId) => set(state => ({ currentUser: state.users.find(u => u.id === userId) || null })),
      removeUser: (userId) => set(state => ({ users: state.users.filter(u => u.id !== userId) })),
      updateUser: (userId, updates) => set(state => ({ 
          users: state.users.map(u => u.id === userId ? { ...u, ...updates } : u)
      })),
      
      syncWithServer: async () => {
        await get().getServerProjects();
        if (get().currentProject) {
          await get().loadProject(get().currentProject.id);
        }
      },

      configureColumns: (columnMetadata) => {
        set({ columnMetadata });
        get().autoSaveProject();
      },

      updateColumnType: (columnIndex, type) => {
        set(state => ({
          columnMetadata: state.columnMetadata.map(c => 
            c.index === columnIndex ? { ...c, type, autoDetected: false } : c
          )
        }));
        get().autoSaveProject();
      },

      updateColumnMetadata: (metadata) => {
        set(state => ({
          columnMetadata: state.columnMetadata.map(c => 
            c.index === metadata.index ? metadata : c
          )
        }));
        get().autoSaveProject();
      },

      bulkClassifyColumns: (columnIndexes, classification) => {
        set(state => ({
          columnMetadata: state.columnMetadata.map(c =>
            columnIndexes.includes(c.index)
              ? { ...c, classification: { ...c.classification, ...classification, confidence: 1, aiGenerated: false, classifiedBy: 'user' } as ColumnClassification }
              : c
          )
        }));
        get().autoSaveProject();
      },

      updateMultipleColumnMetadata: (updates) => {
        set(state => ({
          columnMetadata: state.columnMetadata.map(meta => {
            const update = updates.find(u => u.index === meta.index);
            return update ? { ...meta, ...update.metadata } : meta;
          })
        }));
        get().autoSaveProject();
      },

      selectColumnsByPattern: (pattern, caseSensitive = false) => {
        const { columnMetadata } = get();
        const regex = new RegExp(pattern, caseSensitive ? '' : 'i');
        return columnMetadata
          .filter(meta => regex.test(meta.name))
          .map(meta => meta.index);
      },

      selectColumnsByType: (type, includeUnclassified = false) => {
        const { columnMetadata } = get();
        return columnMetadata
          .filter(meta => meta.type === type)
          .map(meta => meta.index);
      },

      selectColumnsByRange: (startIndex, endIndex) => {
        const { columnMetadata } = get();
        return columnMetadata
          .filter(meta => meta.index >= startIndex && meta.index <= endIndex)
          .map(meta => meta.index);
      },

      previewBatchClassification: (columnIndexes, classification) => {
        const { columnMetadata } = get();
        return columnMetadata
          .filter(meta => columnIndexes.includes(meta.index))
          .map(meta => ({
            columnIndex: meta.index,
            columnName: meta.name,
            oldType: meta.type,
            newType: meta.type, // Placeholder, logic needs to be defined
            oldClassification: meta.classification,
            newClassification: { ...meta.classification, ...classification } as ColumnClassification,
          }));
      },

      getOpenQuestionColumns: () => get().columnMetadata.filter(c => c.type === 'open'),
      getClosedQuestionColumns: () => get().columnMetadata.filter(c => c.type.startsWith('closed')),
      getDemographicColumns: () => get().columnMetadata.filter(c => c.type.startsWith('demographic')),

      // Offline management methods
      processOfflineQueue: async () => {
        const { isServerOnline } = get();
        if (!isServerOnline) {
          console.log("Server offline, cannot process queue");
          return;
        }

        try {
          await offlineManager.processQueue(apiService);
          console.log("Offline queue processed successfully");
          
          // Refresh projects after processing queue
          const { getServerProjects } = get();
          await getServerProjects();
        } catch (error) {
          console.error("Error processing offline queue:", error);
          set({ error: "Errore nella sincronizzazione delle modifiche offline" });
        }
      },

      getPendingOperationsCount: () => {
        return offlineManager.getPendingOperationsCount();
      },

      clearOfflineQueue: () => {
        offlineManager.clearQueue();
        console.log("Offline queue cleared");
      },

    }),
    {
      name: 'thematic-analysis-storage',
      // getStorage: () => localStorage, // o sessionStorage, o indexedDB
    }
  )
);
