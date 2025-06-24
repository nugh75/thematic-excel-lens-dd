import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  isLoading,
  message = 'Caricamento...',
  size = 'md',
  overlay = false,
  className = ''
}) => {
  if (!isLoading) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const content = (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      <span className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
        {message}
      </span>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Componente per skeleton loading durante il caricamento delle liste
interface SkeletonLoaderProps {
  rows?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rows = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded-md w-1/2 mt-2"></div>
        </div>
      ))}
    </div>
  );
};

// Componente per skeleton della griglia dati
export const DataGridSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Header skeleton */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      
      {/* Rows skeleton */}
      {Array.from({ length: 5 }, (_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 border-b">
          {Array.from({ length: 4 }, (_, cellIndex) => (
            <div key={cellIndex} className="h-3 bg-gray-100 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
};
