import React from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { Wifi, WifiOff, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isServerOnline, isSaving, lastSaved, error } = useAnalysisStore();

  const formatLastSaved = (timestamp: number | null) => {
    if (!timestamp) {
      return null;
    }
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return 'ora';
    }
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} min fa`;
    }
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} ore fa`;
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = () => {
    if (error) {
      return 'text-red-500';
    }
    if (!isServerOnline) {
      return 'text-orange-500';
    }
    if (isSaving) {
      return 'text-blue-500';
    }
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="w-4 h-4" />;
    if (!isServerOnline) return <WifiOff className="w-4 h-4" />;
    if (isSaving) return <Save className="w-4 h-4 animate-pulse" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (error) {
      return error;
    }
    if (!isServerOnline) {
      return 'Offline';
    }
    if (isSaving) {
      return 'Salvataggio...';
    }
    return 'Connesso';
  };

  const lastSavedText = formatLastSaved(lastSaved);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {isServerOnline && (
        <div className="flex items-center space-x-1 text-gray-500">
          <Wifi className="w-3 h-3" />
          <span className="text-xs">Online</span>
        </div>
      )}
      
      {lastSavedText && !isSaving && (
        <div className="text-xs text-gray-400">
          Salvato {lastSavedText}
        </div>
      )}
    </div>
  );
};
