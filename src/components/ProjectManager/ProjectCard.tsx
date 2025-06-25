import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Eye } from 'lucide-react';
import { LoadingIndicator } from '../LoadingIndicator';
import { SafeProject, SafeUser, getProjectFileName, getProjectStats, formatDate, getUserName } from './types';

interface ProjectCardProps {
  project: SafeProject;
  currentProjectId?: string;
  users: SafeUser[];
  isLoading?: boolean;
  isServerOnline?: boolean;
  onLoadProject: (projectId: string) => void;
  onOpenSettings: (project: SafeProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  currentProjectId,
  users = [],
  isLoading = false,
  isServerOnline = true,
  onLoadProject,
  onOpenSettings
}) => {
  // Controllo di sicurezza per il progetto
  if (!project?.id || !project?.name) {
    return (
      <div className="border rounded-lg p-4 border-red-200 bg-red-50">
        <p className="text-red-600">Progetto non valido</p>
      </div>
    );
  }

  const isCurrentProject = currentProjectId === project.id;
  const stats = getProjectStats(project);
  const fileName = getProjectFileName(project);
  const creatorName = getUserName(project.createdBy, users);

  const handleLoadClick = () => {
    if (!isLoading && isServerOnline && !isCurrentProject) {
      onLoadProject(project.id);
    }
  };

  const handleSettingsClick = () => {
    onOpenSettings(project);
  };

  return (
    <div 
      className={`border rounded-lg p-4 transition-colors ${
        isCurrentProject ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Header del progetto */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{project.name}</h3>
            {isCurrentProject && (
              <Badge variant="default">Attivo</Badge>
            )}
          </div>
          
          {/* Descrizione opzionale */}
          {project.description && (
            <p className="text-sm text-gray-600 mb-2">{project.description}</p>
          )}
          
          {/* Informazioni del progetto */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-600">File: </span>
              <span className="font-medium">{fileName}</span>
            </div>
            <div>
              <span className="text-gray-600">Creato: </span>
              <span>{formatDate(project.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-600">Da: </span>
              <span>{creatorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-gray-500" />
              <span>{project.collaborators?.length || 0} collaboratori</span>
            </div>
          </div>

          {/* Statistiche del progetto */}
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>Etichette: {stats.labels}</span>
            <span>Celle: {stats.cellLabels}</span>
            <span>Righe: {stats.rowLabels}</span>
          </div>
        </div>

        {/* Azioni del progetto */}
        <div className="flex gap-2">
          {!isCurrentProject && (
            <Button 
              size="sm" 
              onClick={handleLoadClick}
              disabled={isLoading || !isServerOnline}
              variant="default"
            >
              {isLoading ? (
                <>
                  <LoadingIndicator isLoading={true} message="" size="sm" className="mr-1" />
                  Caricamento...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Carica
                </>
              )}
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleSettingsClick}
            disabled={isLoading}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
