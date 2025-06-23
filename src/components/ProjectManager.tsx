import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Clock, 
  Users, 
  FileSpreadsheet,
  Eye,
  Settings,
  Download,
  Share2,
  Check,
  X
} from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';
import { Project } from '../types/analysis';

const ProjectManager = () => {
  const { 
    projects, 
    currentProject, 
    users,
    currentUser,
    loadProject, 
    deleteProject,
    addCollaborator,
    removeCollaborator,
    switchProject,
    saveCurrentProject
  } = useAnalysisStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleLoadProject = (projectId: string) => {
    if (currentProject?.id === projectId) {
      toast({
        title: "Progetto già attivo",
        description: "Questo progetto è già caricato",
      });
      return;
    }

    switchProject(projectId);
    toast({
      title: "Progetto caricato",
      description: "Progetto caricato con successo",
    });
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    toast({
      title: "Progetto eliminato",
      description: "Il progetto è stato eliminato",
    });
  };

  const handleAddCollaborator = (projectId: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      addCollaborator(projectId, user.id);
      toast({
        title: "Collaboratore aggiunto",
        description: `${user.name} è stato aggiunto al progetto`,
      });
    }
  };

  const handleRemoveCollaborator = (projectId: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      removeCollaborator(projectId, userId);
      toast({
        title: "Collaboratore rimosso",
        description: `${user.name} è stato rimosso dal progetto`,
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCreatorName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Utente sconosciuto';
  };

  const getCollaboratorNames = (collaboratorIds: string[]) => {
    return collaboratorIds.map(id => {
      const user = users.find(u => u.id === id);
      return user?.name || 'Sconosciuto';
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestione Progetti</h2>
        <div className="flex gap-2">
          <Button onClick={() => saveCurrentProject()} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Salva Progetto Corrente
          </Button>
        </div>
      </div>

      {/* Progetto corrente */}
      {currentProject && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Progetto Attivo: {currentProject.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">File Excel</p>
                <p className="font-medium">{currentProject.excelData.fileName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ultima modifica</p>
                <p className="font-medium">{formatDate(currentProject.lastModified)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Collaboratori</p>
                <div className="flex gap-1 mt-1">
                  {getCollaboratorNames(currentProject.collaborators).map((name, index) => (
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
                <span className="text-sm">Etichette: {currentProject.labels.length}</span>
                <span className="text-sm">Celle etichettate: {currentProject.cellLabels.length}</span>
                <span className="text-sm">Righe etichettate: {currentProject.rowLabels.length}</span>
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
            Tutti i Progetti ({projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nessun progetto disponibile</p>
              <p className="text-sm text-gray-500">Carica un file Excel per creare il primo progetto</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className={`border rounded-lg p-4 ${
                    currentProject?.id === project.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        {currentProject?.id === project.id && (
                          <Badge variant="default">Attivo</Badge>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">File: </span>
                          <span className="font-medium">{project.excelData.fileName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Creato: </span>
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Da: </span>
                          <span>{getCreatorName(project.createdBy)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span>{project.collaborators.length} collaboratori</span>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>Etichette: {project.labels.length}</span>
                        <span>Celle: {project.cellLabels.length}</span>
                        <span>Righe: {project.rowLabels.length}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {currentProject?.id !== project.id && (
                        <Button 
                          size="sm" 
                          onClick={() => handleLoadProject(project.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Carica
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedProject(project)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Gestisci Progetto</DialogTitle>
                          </DialogHeader>
                          <Tabs defaultValue="info">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="info">Info</TabsTrigger>
                              <TabsTrigger value="collaborators">Collaboratori</TabsTrigger>
                            </TabsList>
                            <TabsContent value="info" className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Nome</label>
                                <Input value={project.name} disabled />
                              </div>
                              <div>
                                <label className="text-sm font-medium">File Excel</label>
                                <Input value={project.excelData.fileName} disabled />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Dimensioni</label>
                                <Input 
                                  value={`${project.excelData.rows.length} righe × ${project.excelData.headers.length} colonne`} 
                                  disabled 
                                />
                              </div>
                              <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Elimina Progetto
                              </Button>
                            </TabsContent>
                            <TabsContent value="collaborators" className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Seleziona Collaboratori</label>
                                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                                  {users.map((user) => {
                                    const isCollaborator = project.collaborators.includes(user.id);
                                    const isCreator = user.id === project.createdBy;
                                    
                                    return (
                                      <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                                        <Checkbox
                                          id={`collaborator-${user.id}`}
                                          checked={isCollaborator}
                                          disabled={isCreator}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              handleAddCollaborator(project.id, user.id);
                                            } else {
                                              handleRemoveCollaborator(project.id, user.id);
                                            }
                                          }}
                                        />
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback 
                                            className="text-xs"
                                            style={{ backgroundColor: user.color + '20', color: user.color }}
                                          >
                                            {user.name.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <label 
                                              htmlFor={`collaborator-${user.id}`}
                                              className="text-sm font-medium cursor-pointer"
                                            >
                                              {user.name}
                                            </label>
                                            {isCreator && (
                                              <Badge variant="secondary" className="text-xs">
                                                Creatore
                                              </Badge>
                                            )}
                                            {user.role && (
                                              <Badge variant="outline" className="text-xs">
                                                {user.role}
                                              </Badge>
                                            )}
                                          </div>
                                          {user.email && (
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  Seleziona gli utenti che vuoi aggiungere come collaboratori al progetto. Il creatore del progetto è sempre incluso.
                                </p>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Riepilogo Collaboratori</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {project.collaborators.map((collaboratorId) => {
                                    const collaborator = users.find(u => u.id === collaboratorId);
                                    if (!collaborator) return null;
                                    
                                    return (
                                      <Badge key={collaboratorId} variant="secondary" className="flex items-center gap-1">
                                        <div 
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: collaborator.color }}
                                        />
                                        {collaborator.name}
                                      </Badge>
                                    );
                                  })}
                                  {project.collaborators.length === 0 && (
                                    <p className="text-sm text-gray-500">Nessun collaboratore selezionato</p>
                                  )}
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectManager;
