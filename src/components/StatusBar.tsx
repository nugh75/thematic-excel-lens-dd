import React from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { ConnectionStatus } from './ConnectionStatus';
import { Database, Cloud, CloudOff } from 'lucide-react';

interface StatusBarProps {
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ className = '' }) => {
  const { currentProject, isServerOnline, projects } = useAnalysisStore();

  return (
    <div className={`bg-gray-50 border-b border-gray-200 px-4 py-2 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Progetto corrente */}
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {currentProject ? (
              <>
                <span className="font-medium">{currentProject.name}</span>
                {currentProject.description && (
                  <span className="text-gray-500 ml-2">— {currentProject.description}</span>
                )}
              </>
            ) : (
              'Nessun progetto caricato'
            )}
          </span>
        </div>

        {/* Status connessione e info progetti */}
        <div className="flex items-center space-x-4">
          {/* Numero progetti */}
          <div className="flex items-center space-x-1 text-gray-500">
            {isServerOnline ? (
              <Cloud className="w-4 h-4" />
            ) : (
              <CloudOff className="w-4 h-4" />
            )}
            <span className="text-xs">
              {projects.length} {projects.length === 1 ? 'progetto' : 'progetti'}
            </span>
          </div>

          {/* Status della connessione */}
          <ConnectionStatus />
        </div>
      </div>
    </div>
  );
};
