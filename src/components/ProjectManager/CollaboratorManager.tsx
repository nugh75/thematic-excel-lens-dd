import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SafeProject, SafeUser, getUserName } from './types';

interface CollaboratorManagerProps {
  project: SafeProject;
  users: SafeUser[];
  onAddCollaborator: (projectId: string, userId: string) => void;
  onRemoveCollaborator: (projectId: string, userId: string) => void;
}

const CollaboratorManager: React.FC<CollaboratorManagerProps> = ({
  project,
  users = [],
  onAddCollaborator,
  onRemoveCollaborator
}) => {
  // Controllo di sicurezza
  if (!project?.id || !Array.isArray(users)) {
    return (
      <div className="space-y-4">
        <div className="text-center text-red-600">
          Dati non disponibili per la gestione collaboratori
        </div>
      </div>
    );
  }

  const projectCollaborators = project.collaborators || [];
  const creatorName = getUserName(project.createdBy, users);

  const handleCollaboratorToggle = (userId: string, checked: boolean) => {
    if (checked) {
      onAddCollaborator(project.id, userId);
    } else {
      onRemoveCollaborator(project.id, userId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selettore collaboratori */}
      <div>
        <label className="text-sm font-medium">Seleziona Collaboratori</label>
        <div className="space-y-2 mt-2 max-h-60 overflow-y-auto border rounded-lg p-3">
          {users.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Nessun utente disponibile
            </div>
          ) : (
            users.map((user) => {
              // Controllo di sicurezza per ogni utente
              if (!user?.id || !user?.name) {
                return null;
              }

              const isCollaborator = projectCollaborators.includes(user.id);
              const isCreator = user.id === project.createdBy;
              
              return (
                <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    id={`collaborator-${user.id}`}
                    checked={isCollaborator}
                    disabled={isCreator}
                    onCheckedChange={(checked) => {
                      handleCollaboratorToggle(user.id, checked as boolean);
                    }}
                  />
                  
                  <Avatar className="h-8 w-8">
                    <AvatarFallback 
                      className="text-xs"
                      style={{ 
                        backgroundColor: user.color ? `${user.color}20` : '#f0f0f0', 
                        color: user.color || '#666'
                      }}
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
            })
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Seleziona gli utenti che vuoi aggiungere come collaboratori al progetto. 
          Il creatore del progetto è sempre incluso.
        </p>
      </div>
      
      {/* Riepilogo collaboratori */}
      <div>
        <label className="text-sm font-medium">Riepilogo Collaboratori</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {projectCollaborators.length === 0 ? (
            <p className="text-sm text-gray-500">Nessun collaboratore selezionato</p>
          ) : (
            projectCollaborators.map((collaboratorId) => {
              const collaborator = users.find(u => u?.id === collaboratorId);
              if (!collaborator) {
                return (
                  <Badge key={collaboratorId} variant="outline" className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    Utente sconosciuto
                  </Badge>
                );
              }
              
              return (
                <Badge key={collaboratorId} variant="secondary" className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: collaborator.color || '#gray' }}
                  />
                  {collaborator.name}
                </Badge>
              );
            })
          )}
        </div>
      </div>

      {/* Info creatore */}
      <div className="pt-2 border-t">
        <p className="text-xs text-gray-600">
          <strong>Creatore del progetto:</strong> {creatorName}
        </p>
      </div>
    </div>
  );
};

export default CollaboratorManager;
