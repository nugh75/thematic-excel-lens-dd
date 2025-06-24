import React, { useEffect, useState } from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { X, AlertCircle, CheckCircle, Info, WifiOff } from 'lucide-react';

interface Toast {
  id: string;
  type: 'error' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface ToastNotificationProps {
  className?: string;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ className = '' }) => {
  const { error, isServerOnline, isSaving } = useAnalysisStore();
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Monitora i cambiamenti di errore e stato connessione
  useEffect(() => {
    if (error) {
      const toast: Toast = {
        id: Date.now().toString(),
        type: 'error',
        title: 'Errore di connessione',
        message: error,
        duration: 5000
      };
      setToasts(prev => [...prev, toast]);
    }
  }, [error]);

  useEffect(() => {
    if (!isServerOnline && !error) {
      const toast: Toast = {
        id: Date.now().toString(),
        type: 'warning',
        title: 'Connessione persa',
        message: 'Il server non è raggiungibile. Le modifiche saranno salvate localmente.',
        duration: 4000
      };
      setToasts(prev => [...prev, toast]);
    }
  }, [isServerOnline, error]);

  // Auto-rimozione dei toast
  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration) {
        setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
      }
    });
  }, [toasts]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <WifiOff className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastBackground = (type: Toast['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`max-w-sm p-4 rounded-lg border shadow-lg animate-in slide-in-from-right duration-300 ${getToastBackground(toast.type)}`}
        >
          <div className="flex items-start space-x-3">
            {getToastIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {toast.title}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
