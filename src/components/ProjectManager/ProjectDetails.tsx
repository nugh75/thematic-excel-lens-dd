import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { SafeProject, getProjectFileName, getProjectDimensions } from './types';

interface ProjectDetailsProps {
  project: SafeProject;
  onDeleteProject: (projectId: string) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onDeleteProject
}) => {
  // Controllo di sicurezza
  if (!project?.id || !project?.name) {
    return (
      <div className="space-y-4">
        <div className="text-center text-red-600">
          Dati del progetto non disponibili
        </div>
      </div>
    );
  }

  const fileName = getProjectFileName(project);
  const dimensions = getProjectDimensions(project);

  const handleDelete = () => {
    if (window.confirm(`Sei sicuro di voler eliminare il progetto "${project.name}"?`)) {
      onDeleteProject(project.id);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome</label>
        <Input 
          value={project.name || ''} 
          disabled 
          className="mt-1"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">File Excel</label>
        <Input 
          value={fileName} 
          disabled 
          className="mt-1"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Dimensioni</label>
        <Input 
          value={dimensions} 
          disabled 
          className="mt-1"
        />
      </div>

      {project.description && (
        <div>
          <label className="text-sm font-medium">Descrizione</label>
          <Input 
            value={project.description} 
            disabled 
            className="mt-1"
          />
        </div>
      )}
      
      <div className="pt-4 border-t">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Elimina Progetto
        </Button>
      </div>
    </div>
  );
};

export default ProjectDetails;
