import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThematicAnalysis, Label, CellLabel, RowLabel, ExcelData, User, LabelingSession, ConflictResolution, Project, ColumnMetadata, ColumnType } from '../types/analysis';

interface AnalysisStore extends ThematicAnalysis {
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
  createProject: (name: string, description: string, excelData: ExcelData) => void;
  loadProject: (projectId: string) => void;
  saveCurrentProject: () => void;
  deleteProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  addCollaborator: (projectId: string, userId: string) => void;
  removeCollaborator: (projectId: string, userId: string) => void;
  switchProject: (projectId: string) => void;
  
  // Column configuration
  configureColumns: (columnMetadata: ColumnMetadata[]) => void;
  updateColumnType: (columnIndex: number, type: ColumnType) => void;
  getOpenQuestionColumns: () => ColumnMetadata[];
  getClosedQuestionColumns: () => ColumnMetadata[];
  getDemographicColumns: () => ColumnMetadata[];
  
  // Session management
  createSession: (name: string) => void;
  loadSession: (sessionId: string) => void;
  saveCurrentSession: () => void;
  deleteSession: (sessionId: string) => void;
  
  // Conflict resolution
  getConflicts: () => ConflictResolution[];
  resolveConflict: (conflict: ConflictResolution) => void;
  mergeUserLabels: (userIds: string[]) => void;
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
      return 'demographic_numeric';
    }
    if (header.includes('cap') || header.includes('codice') || header.includes('id')) {
      return 'demographic_code';
    }
    // Default demographic to multiple choice (gender, education, etc.)
    return 'demographic_multiplechoice';
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
          return 'likert';
        }
      }
      return 'numeric';
    }
    
    // Check for Likert keywords in header
    if (likertKeywords.some(keyword => header.includes(keyword))) {
      return 'likert';
    }
    
    // Check for numeric keywords in header
    if (numericKeywords.some(keyword => header.includes(keyword))) {
      return 'numeric';
    }
    
    // If few unique values and short text, likely multiple choice
    if (uniqueValues.length <= 10 && avgLength <= 50) {
      return 'multiplechoice';
    }
    
    // If many unique values or long text, likely open question
    if (uniqueValues.length > 10 || avgLength > 50) {
      return 'open';
    }
  }
  
  // Default to open for unknown cases
  return 'open';
};

export const useAnalysisStore = create<AnalysisStore>()(
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

      setExcelData: (data) => {
        const { currentUser, saveCurrentProject } = get();
        
        // Salva il progetto corrente se esiste
        saveCurrentProject();
        
        // Auto-detect column types
        const columnMetadata: ColumnMetadata[] = data.headers.map((header, index) => {
          const sampleValues = data.rows.slice(0, 10).map(row => row[index]).filter(Boolean);
          const detectedType = autoDetectColumnType(header, sampleValues);
          
          return {
            index,
            name: header,
            type: detectedType,
            autoDetected: true,
            sampleValues: sampleValues.slice(0, 5),
          };
        });
        
        // Crea un nuovo progetto per il file caricato
        const newProject: Project = {
          id: Date.now().toString(),
          name: data.fileName,
          description: `Progetto creato da ${data.fileName}`,
          excelData: data,
          config: {
            columnMetadata,
            isConfigured: false,
          },
          createdAt: Date.now(),
          createdBy: currentUser?.id || 'unknown',
          lastModified: Date.now(),
          isActive: true,
          collaborators: [currentUser?.id || 'unknown'],
          labels: [],
          cellLabels: [],
          rowLabels: [],
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
          excelData: data,
          labels: [],
          cellLabels: [],
          rowLabels: [],
        }));
      },

      addLabel: (labelData) => {
        const id = Date.now().toString();
        const newLabel: Label = { ...labelData, id };
        set((state) => ({ labels: [...state.labels, newLabel] }));
        // Auto-save al progetto corrente
        setTimeout(() => get().saveCurrentProject(), 100);
      },

      updateLabel: (id, updates) => {
        set((state) => ({
          labels: state.labels.map((label) =>
            label.id === id ? { ...label, ...updates } : label
          ),
        }));
        // Auto-save al progetto corrente
        setTimeout(() => get().saveCurrentProject(), 100);
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
        // Auto-save al progetto corrente
        setTimeout(() => get().saveCurrentProject(), 100);
      },

      mergeLabels: (sourceLabels, targetLabel) => {
        set((state) => {
          // Verifica che l'etichetta target esista
          const targetExists = state.labels.some(label => label.id === targetLabel);
          if (!targetExists) return state;

          // Aggiorna tutti i riferimenti dalle etichette sorgente all'etichetta target
          const updatedCellLabels = state.cellLabels.map(cellLabel => ({
            ...cellLabel,
            labelIds: cellLabel.labelIds.map(labelId => 
              sourceLabels.includes(labelId) ? targetLabel : labelId
            ).filter((labelId, index, arr) => arr.indexOf(labelId) === index) // Rimuovi duplicati
          }));

          const updatedRowLabels = state.rowLabels.map(rowLabel => ({
            ...rowLabel,
            labelIds: rowLabel.labelIds.map(labelId => 
              sourceLabels.includes(labelId) ? targetLabel : labelId
            ).filter((labelId, index, arr) => arr.indexOf(labelId) === index) // Rimuovi duplicati
          }));

          // Rimuovi le etichette sorgente
          const updatedLabels = state.labels.filter(label => !sourceLabels.includes(label.id));

          return {
            labels: updatedLabels,
            cellLabels: updatedCellLabels,
            rowLabels: updatedRowLabels,
          };
        });
        // Auto-save al progetto corrente
        setTimeout(() => get().saveCurrentProject(), 100);
      },

      addCellLabel: (cellLabel) => {
        set((state) => {
          const currentUser = state.currentUser;
          const labelWithUser = {
            ...cellLabel,
            userId: currentUser?.id,
            timestamp: Date.now(),
          };

          const existingIndex = state.cellLabels.findIndex(
            (cl) => cl.cellId === cellLabel.cellId
          );
          
          if (existingIndex >= 0) {
            const updatedCellLabels = [...state.cellLabels];
            updatedCellLabels[existingIndex] = {
              ...updatedCellLabels[existingIndex],
              labelIds: [...new Set([...updatedCellLabels[existingIndex].labelIds, ...cellLabel.labelIds])],
              timestamp: Date.now(),
            };
            return { cellLabels: updatedCellLabels };
          } else {
            return { cellLabels: [...state.cellLabels, labelWithUser] };
          }
        });
        // Auto-save al progetto corrente
        setTimeout(() => get().saveCurrentProject(), 100);
      },

      removeCellLabel: (cellId, labelId) => {
        set((state) => ({
          cellLabels: state.cellLabels.map((cellLabel) =>
            cellLabel.cellId === cellId
              ? {
                  ...cellLabel,
                  labelIds: cellLabel.labelIds.filter((id) => id !== labelId),
                  timestamp: Date.now(),
                }
              : cellLabel
          ).filter((cellLabel) => cellLabel.labelIds.length > 0),
        }));
        // Auto-save al progetto corrente
        setTimeout(() => get().saveCurrentProject(), 100);
      },

      addRowLabel: (rowLabel) => {
        set((state) => {
          const currentUser = state.currentUser;
          const labelWithUser = {
            ...rowLabel,
            userId: currentUser?.id,
            timestamp: Date.now(),
          };

          const existingIndex = state.rowLabels.findIndex(
            (rl) => rl.rowIndex === rowLabel.rowIndex
          );
          
          if (existingIndex >= 0) {
            const updatedRowLabels = [...state.rowLabels];
            updatedRowLabels[existingIndex] = {
              ...updatedRowLabels[existingIndex],
              labelIds: [...new Set([...updatedRowLabels[existingIndex].labelIds, ...rowLabel.labelIds])],
              timestamp: Date.now(),
            };
            return { rowLabels: updatedRowLabels };
          } else {
            return { rowLabels: [...state.rowLabels, labelWithUser] };
          }
        });
        // Auto-save al progetto corrente
        setTimeout(() => get().saveCurrentProject(), 100);
      },

      removeRowLabel: (rowIndex, labelId) => {
        set((state) => ({
          rowLabels: state.rowLabels.map((rowLabel) =>
            rowLabel.rowIndex === rowIndex
              ? {
                  ...rowLabel,
                  labelIds: rowLabel.labelIds.filter((id) => id !== labelId),
                  timestamp: Date.now(),
                }
              : rowLabel
          ).filter((rowLabel) => rowLabel.labelIds.length > 0),
        }));
        // Auto-save al progetto corrente
        setTimeout(() => get().saveCurrentProject(), 100);
      },

      clearAnalysis: () => set({ 
        excelData: null, 
        labels: [], 
        cellLabels: [], 
        rowLabels: [],
        sessions: [],
        currentSession: null,
      }),

      // Project management
      createProject: (name, description, excelData) => {
        const { currentUser } = get();
        
        // Auto-detect column types
        const columnMetadata: ColumnMetadata[] = excelData.headers.map((header, index) => {
          const sampleValues = excelData.rows.slice(0, 10).map(row => row[index]).filter(Boolean);
          const detectedType = autoDetectColumnType(header, sampleValues);
          
          return {
            index,
            name: header,
            type: detectedType,
            autoDetected: true,
            sampleValues: sampleValues.slice(0, 5),
          };
        });

        const newProject: Project = {
          id: Date.now().toString(),
          name,
          description,
          excelData,
          config: {
            columnMetadata,
            isConfigured: false,
          },
          createdAt: Date.now(),
          createdBy: currentUser?.id || 'unknown',
          lastModified: Date.now(),
          isActive: true,
          collaborators: [currentUser?.id || 'unknown'],
          labels: [],
          cellLabels: [],
          rowLabels: [],
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
          excelData,
          labels: [],
          cellLabels: [],
          rowLabels: [],
        }));
      },

      loadProject: (projectId) => {
        const { projects } = get();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          set({
            currentProject: project,
            excelData: project.excelData,
            labels: [...project.labels],
            cellLabels: [...project.cellLabels],
            rowLabels: [...project.rowLabels],
          });
        }
      },

      saveCurrentProject: () => {
        const { currentProject, labels, cellLabels, rowLabels } = get();
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            labels: [...labels],
            cellLabels: [...cellLabels],
            rowLabels: [...rowLabels],
            lastModified: Date.now(),
          };

          set((state) => ({
            projects: state.projects.map(p => 
              p.id === currentProject.id ? updatedProject : p
            ),
            currentProject: updatedProject,
          }));
        }
      },

      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
          excelData: state.currentProject?.id === projectId ? null : state.excelData,
        }));
      },

      updateProject: (projectId, updates) => {
        set((state) => {
          const updatedProjects = state.projects.map(p => 
            p.id === projectId ? { ...p, ...updates } : p
          );
          
          const updatedCurrentProject = state.currentProject?.id === projectId 
            ? { ...state.currentProject, ...updates }
            : state.currentProject;

          return {
            projects: updatedProjects,
            currentProject: updatedCurrentProject,
          };
        });
      },

      addCollaborator: (projectId, userId) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, collaborators: [...new Set([...p.collaborators, userId])] }
              : p
          ),
        }));
      },

      removeCollaborator: (projectId, userId) => {
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, collaborators: p.collaborators.filter(id => id !== userId) }
              : p
          ),
        }));
      },

      switchProject: (projectId) => {
        const { loadProject, saveCurrentProject } = get();
        saveCurrentProject(); // Salva il progetto corrente prima di cambiare
        loadProject(projectId);
      },

      // Column configuration
      configureColumns: (columnMetadata) => {
        const { currentProject } = get();
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            config: {
              ...currentProject.config,
              columnMetadata,
              isConfigured: true,
              configuredAt: Date.now(),
              configuredBy: get().currentUser?.id,
            },
          };

          set((state) => ({
            projects: state.projects.map(p => 
              p.id === currentProject.id ? updatedProject : p
            ),
            currentProject: updatedProject,
          }));
        }
      },

      updateColumnType: (columnIndex, type) => {
        const { currentProject } = get();
        if (currentProject) {
          const updatedMetadata = currentProject.config.columnMetadata.map(col => 
            col.index === columnIndex 
              ? { ...col, type, autoDetected: false }
              : col
          );

          const updatedProject = {
            ...currentProject,
            config: {
              ...currentProject.config,
              columnMetadata: updatedMetadata,
            },
          };

          set((state) => ({
            projects: state.projects.map(p => 
              p.id === currentProject.id ? updatedProject : p
            ),
            currentProject: updatedProject,
          }));
        }
      },

      getOpenQuestionColumns: () => {
        const { currentProject } = get();
        if (!currentProject) return [];
        return currentProject.config.columnMetadata.filter(col => col.type === 'open');
      },

      getClosedQuestionColumns: () => {
        const { currentProject } = get();
        if (!currentProject) return [];
        return currentProject.config.columnMetadata.filter(col => col.type === 'closed');
      },

      getDemographicColumns: () => {
        const { currentProject } = get();
        if (!currentProject) return [];
        return currentProject.config.columnMetadata.filter(col => col.type === 'demographic');
      },

      getLabelStats: () => {
        const { cellLabels, rowLabels } = get();
        const stats: { [labelId: string]: number } = {};
        
        cellLabels.forEach((cellLabel) => {
          cellLabel.labelIds.forEach((labelId) => {
            stats[labelId] = (stats[labelId] || 0) + 1;
          });
        });

        rowLabels.forEach((rowLabel) => {
          rowLabel.labelIds.forEach((labelId) => {
            stats[labelId] = (stats[labelId] || 0) + 1;
          });
        });
        
        return stats;
      },

      // User management
      addUser: (userData) => {
        const id = Date.now().toString();
        const newUser: User = { ...userData, id };
        set((state) => ({ users: [...state.users, newUser] }));
      },

      setCurrentUser: (userId) => {
        set((state) => ({
          currentUser: state.users.find(u => u.id === userId) || null,
        }));
      },

      removeUser: (userId) => {
        set((state) => ({
          users: state.users.filter(u => u.id !== userId),
          currentUser: state.currentUser?.id === userId ? null : state.currentUser,
        }));
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map(u => 
            u.id === userId ? { ...u, ...updates } : u
          ),
          currentUser: state.currentUser?.id === userId 
            ? { ...state.currentUser, ...updates }
            : state.currentUser,
        }));
      },

      // Session management
      createSession: (name) => {
        const { cellLabels, rowLabels, labels, currentUser } = get();
        const newSession: LabelingSession = {
          id: Date.now().toString(),
          name,
          createdAt: Date.now(),
          createdBy: currentUser?.id || 'unknown',
          cellLabels: [...cellLabels],
          rowLabels: [...rowLabels],
          labels: [...labels],
        };
        
        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSession: newSession,
        }));
      },

      loadSession: (sessionId) => {
        const { sessions } = get();
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          set({
            currentSession: session,
            cellLabels: [...session.cellLabels],
            rowLabels: [...session.rowLabels],
            labels: [...session.labels],
          });
        }
      },

      saveCurrentSession: () => {
        const { currentSession, cellLabels, rowLabels, labels } = get();
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            cellLabels: [...cellLabels],
            rowLabels: [...rowLabels],
            labels: [...labels],
          };
          
          set((state) => ({
            sessions: state.sessions.map(s => 
              s.id === currentSession.id ? updatedSession : s
            ),
            currentSession: updatedSession,
          }));
        }
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        }));
      },

      // Conflict resolution
      getConflicts: () => {
        const { cellLabels, rowLabels, users } = get();
        const conflicts: ConflictResolution[] = [];
        
        // Check for conflicting cell labels
        const cellConflicts = new Map<string, CellLabel[]>();
        cellLabels.forEach(cl => {
          if (!cellConflicts.has(cl.cellId)) {
            cellConflicts.set(cl.cellId, []);
          }
          cellConflicts.get(cl.cellId)!.push(cl);
        });
        
        cellConflicts.forEach((labels, cellId) => {
          const userGroups = new Map<string, string[]>();
          labels.forEach(label => {
            if (label.userId) {
              userGroups.set(label.userId, label.labelIds);
            }
          });
          
          if (userGroups.size > 1) {
            const conflictingLabels = Array.from(userGroups.entries()).map(([userId, labelIds]) => ({
              userId,
              labelIds,
            }));
            
            conflicts.push({
              cellId,
              conflictingLabels,
              resolvedLabelIds: [],
              resolvedBy: '',
              resolvedAt: 0,
            });
          }
        });
        
        return conflicts;
      },

      resolveConflict: (conflict) => {
        console.log('Resolving conflict:', conflict);
      },

      mergeUserLabels: (userIds) => {
        console.log('Merging labels from users:', userIds);
      },
    }),
    {
      name: 'thematic-analysis-storage',
      partialize: (state) => ({
        ...state,
        // Assicuriamoci che i dati critici vengano sempre salvati
        currentUser: state.currentUser || defaultUser,
        users: state.users.length > 0 ? state.users : [defaultUser],
      }),
    }
  )
);
