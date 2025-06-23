import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Save, X, FolderOpen } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { toast } from '@/hooks/use-toast';

const ProjectSettings = () => {
  const { currentProject, updateProject } = useAnalysisStore();
  const [isEditing, setIsEditing] = useState(false);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
  });

  if (!currentProject) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun progetto attivo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleEditProject = () => {
    setProjectData({
      name: currentProject.name,
      description: currentProject.description || '',
    });
    setIsEditing(true);
  };

  const handleUpdateProject = () => {
    if (!projectData.name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del progetto è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    updateProject(currentProject.id, {
      name: projectData.name.trim(),
      description: projectData.description.trim(),
    });

    setIsEditing(false);
    
    toast({
      title: "Successo",
      description: "Progetto aggiornato con successo",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProjectData({ name: '', description: '' });
  };

  return (
    <Card className="w-full fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Impostazioni Progetto
          </CardTitle>
          
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleEditProject}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica Progetto
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifica Progetto</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Nome Progetto *</Label>
                  <Input
                    id="project-name"
                    value={projectData.name}
                    onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome del progetto"
                  />
                </div>
                
                <div>
                  <Label htmlFor="project-description">Descrizione</Label>
                  <Textarea
                    id="project-description"
                    value={projectData.description}
                    onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrizione del progetto (opzionale)"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleUpdateProject} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Salva Modifiche
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
            <p className="text-lg font-semibold">{currentProject.name}</p>
          </div>
          
          {currentProject.description && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Descrizione</Label>
              <p className="text-sm">{currentProject.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Data Creazione</Label>
              <p className="text-sm">{new Date(currentProject.createdAt).toLocaleDateString('it-IT')}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Collaboratori</Label>
              <p className="text-sm">{currentProject.collaborators.length} persone</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Righe Dati</Label>
              <p className="text-sm">{currentProject.excelData?.rows.length || 0}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Colonne</Label>
              <p className="text-sm">{currentProject.excelData?.headers.length || 0}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSettings;
