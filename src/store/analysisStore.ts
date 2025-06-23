
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThematicAnalysis, Label, CellLabel, RowLabel, ExcelData, User, LabelingSession, ConflictResolution } from '../types/analysis';

interface AnalysisStore extends ThematicAnalysis {
  setExcelData: (data: ExcelData) => void;
  addLabel: (label: Omit<Label, 'id'>) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;
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

      setExcelData: (data) => set({ excelData: data }),

      addLabel: (labelData) => {
        const id = Date.now().toString();
        const newLabel: Label = { ...labelData, id };
        set((state) => ({ labels: [...state.labels, newLabel] }));
      },

      updateLabel: (id, updates) => {
        set((state) => ({
          labels: state.labels.map((label) =>
            label.id === id ? { ...label, ...updates } : label
          ),
        }));
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
      },

      clearAnalysis: () => set({ 
        excelData: null, 
        labels: [], 
        cellLabels: [], 
        rowLabels: [],
        sessions: [],
        currentSession: null,
      }),

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
    }
  )
);
