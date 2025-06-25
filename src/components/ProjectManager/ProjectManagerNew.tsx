import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FolderOpen, 
  Users, 
  FileSpreadsheet,
  Download,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useAnalysisStore } from '../../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import ProjectCard from './ProjectCard';
import ProjectDetails from './ProjectDetails';
import CollaboratorManager from './CollaboratorManager';
import { SafeProject, SafeUser, isProjectValid, formatDate, getProjectFileName, getProjectStats, getCollaboratorNames, adaptProjectListItem } from './types';

const ProjectManagerNew = () => {
  // State del componente
  const [selectedProject, setSelectedProject] = useState<SafeProject | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Store Zustand con controlli di sicurezza
  const storeData = useAnalysisStore();
  
  // Dati sicuri estratti dallo store
  const safeData = useMemo(() => {
    const adaptedProjects = Array.isArray(storeData.projects) 
      ? storeData.projects.map(adaptProjectListItem).filter((p): p is SafeProject => p !== null)
      : [];
    
    return {
      projects: adaptedProjects,
      currentProject: storeData.currentProject && isProjectValid(storeData.currentProject) 
        ? adaptProjectListItem(storeData.currentProject) 
        : null,
      users: Array.isArray(storeData.users) ? storeData.users.filter(user => user?.id && user?.name) : [],
      isServerOnline: Boolean(storeData.isServerOnline),
      isSaving: Boolean(storeData.isSaving)
    };
  }, [storeData]);

  // Handlers sicuri
  const handleLoadProject = async (projectId: string) => {
    if (!projectId || typeof projectId !== 'string') {
      toast({
        title: "Errore",
        description: "ID progetto non valido",
        variant: "destructive"
      });
      return;
    }

    if (safeData.currentProject?.id === projectId) {
      toast({
        title: "Progetto già attivo",
        description: "Questo progetto è già caricato",
      });
      return;
    }

    setLoadingProjectId(projectId);
    try {
      await storeData.loadProject(projectId);
      toast({
        title: "Progetto caricato",
        description: "Progetto caricato con successo",
      });
    } catch (error) {
      console.error('Errore caricamento progetto:', error);
      toast({
        title: "Errore caricamento",
        description: "Impossibile caricare il progetto",
        variant: "destructive"
      });
    } finally {
      setLoadingProjectId(null);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (!projectId || typeof projectId !== 'string') {
      toast({
        title: "Errore",
        description: "ID progetto non valido",
        variant: "destructive"
      });
      return;
    }

    try {
      storeData.deleteProject(projectId);
      setIsDialogOpen(false);
      setSelectedProject(null);
      toast({
        title: "Progetto eliminato",
        description: "Il progetto è stato eliminato con successo",
      });
    } catch (error) {
      console.error('Errore eliminazione progetto:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il progetto",
        variant: "destructive"
      });
    }
  };

  const handleAddCollaborator = (projectId: string, userId: string) => {
    if (!projectId || !userId) {
      toast({
        title: "Errore",
        description: "Dati non validi per l'aggiunta del collaboratore",
        variant: "destructive"
      });
      return;
    }

    const user = safeData.users.find(u => u.id === userId);
    if (!user) {
      toast({
        title: "Errore",
        description: "Utente non trovato",
        variant: "destructive"
      });
      return;
    }

    try {
      storeData.addCollaborator(projectId, userId);
      toast({
        title: "Collaboratore aggiunto",
        description: `${user.name} è stato aggiunto al progetto`,
      });
    } catch (error) {
      console.error('Errore aggiunta collaboratore:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il collaboratore",
        variant: "destructive"
      });
    }
  };

  const handleRemoveCollaborator = (projectId: string, userId: string) => {
    if (!projectId || !userId) {
      toast({
        title: "Errore",
        description: "Dati non validi per la rimozione del collaboratore",
        variant: "destructive"
      });
      return;
    }

    const user = safeData.users.find(u => u.id === userId);
    if (!user) {
      toast({
        title: "Errore",
        description: "Utente non trovato",
        variant: "destructive"
      });
      return;
    }

    try {
      storeData.removeCollaborator(projectId, userId);
      toast({
        title: "Collaboratore rimosso",
        description: `${user.name} è stato rimosso dal progetto`,
      });
    } catch (error) {
      console.error('Errore rimozione collaboratore:', error);
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il collaboratore",
        variant: "destructive"
      });
    }
  };

  const handleSaveCurrentProject = () => {
    try {
      storeData.saveCurrentProject();
      toast({
        title: "Progetto salvato",
        description: "Il progetto corrente è stato salvato",
      });
    } catch (error) {
      console.error('Errore salvataggio progetto:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il progetto",
        variant: "destructive"
      });
    }
  };

  const handleOpenProjectSettings = (project: SafeProject) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestione Progetti</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveCurrentProject} 
            variant="outline"
            disabled={!safeData.currentProject || safeData.isSaving}
          >
            <Download className="h-4 w-4 mr-2" />
            {safeData.isSaving ? 'Salvando...' : 'Salva Progetto Corrente'}
          </Button>
        </div>
      </div>

      {/* Progetto corrente */}
      {safeData.currentProject && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Progetto Attivo: {safeData.currentProject.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">File Excel</p>
                <p className="font-medium">{getProjectFileName(safeData.currentProject)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ultima modifica</p>
                <p className="font-medium">{formatDate(safeData.currentProject.lastModified)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Collaboratori</p>
                <div className="flex gap-1 mt-1">
                  {getCollaboratorNames(safeData.currentProject.collaborators || [], safeData.users).map((name, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Statistiche</p>
              <div className="flex gap-4 mt-1">
                {(() => {
                  const stats = getProjectStats(safeData.currentProject);
                  return (
                    <>
                      <span className="text-sm">Etichette: {stats.labels}</span>
                      <span className="text-sm">Celle etichettate: {stats.cellLabels}</span>
                      <span className="text-sm">Righe etichettate: {stats.rowLabels}</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista progetti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Tutti i Progetti ({safeData.projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!safeData.isServerOnline ? (
            <div className="text-center py-8">
              <div className="text-orange-500 mb-4">
                <AlertTriangle className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600">Server non raggiungibile</p>
              <p className="text-sm text-gray-500">Impossibile caricare i progetti dal server</p>
            </div>
          ) : safeData.projects.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nessun progetto disponibile</p>
              <p className="text-sm text-gray-500">Carica un file Excel per creare il primo progetto</p>
            </div>
          ) : (
            <div className="space-y-3">
              {safeData.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentProjectId={safeData.currentProject?.id}
                  users={safeData.users}
                  isLoading={loadingProjectId === project.id}
                  isServerOnline={safeData.isServerOnline}
                  onLoadProject={handleLoadProject}
                  onOpenSettings={handleOpenProjectSettings}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog per le impostazioni del progetto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? `Gestisci: ${selectedProject.name}` : 'Gestisci Progetto'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="collaborators">Collaboratori</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                <ProjectDetails
                  project={selectedProject}
                  onDeleteProject={handleDeleteProject}
                />
              </TabsContent>
              
              <TabsContent value="collaborators">
                <CollaboratorManager
                  project={selectedProject}
                  users={safeData.users}
                  onAddCollaborator={handleAddCollaborator}
                  onRemoveCollaborator={handleRemoveCollaborator}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManagerNew;
