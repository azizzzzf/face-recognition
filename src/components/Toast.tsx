"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/ui/button';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration (unless persistent)
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description, persistent: true });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'warning':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-lg transition-all duration-300',
        'transform translate-x-full opacity-0',
        isVisible && !isLeaving && 'translate-x-0 opacity-100',
        isLeaving && 'translate-x-full opacity-0 scale-95',
        getColorClasses()
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-semibold text-sm leading-5">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-sm opacity-90 mt-1 leading-5">
                  {toast.description}
                </p>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {toast.action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.action!.onClick();
                  handleRemove();
                }}
                className="text-xs h-7 border-current bg-transparent hover:bg-black/5 dark:hover:bg-white/5"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility function for common toast patterns
export const createToastUtils = (toast: ToastContextType) => ({
  // Network related
  networkError: (error?: string) => {
    toast.error(
      'Network Error',
      error || 'Unable to connect to server. Please check your connection.'
    );
  },

  networkSuccess: (message = 'Operation completed successfully') => {
    toast.success('Success', message);
  },

  // API related
  apiError: (error: any) => {
    const message = error?.message || error?.data?.message || 'An error occurred';
    toast.error('API Error', message);
  },

  apiSuccess: (message = 'Operation completed successfully') => {
    toast.success('Success', message);
  },

  // Form related
  formError: (field?: string) => {
    toast.error(
      'Form Error',
      field ? `Please check the ${field} field` : 'Please check your input'
    );
  },

  formSuccess: (action = 'saved') => {
    toast.success('Success', `Data has been ${action} successfully`);
  },

  // Authentication related
  authError: () => {
    toast.error(
      'Authentication Error',
      'Please login again to continue'
    );
  },

  authSuccess: (message = 'Successfully authenticated') => {
    toast.success('Welcome!', message);
  },

  // Permission related
  permissionError: () => {
    toast.error(
      'Permission Denied',
      'You do not have permission to perform this action'
    );
  },

  // Loading states
  loadingError: () => {
    toast.error(
      'Loading Error',
      'Failed to load data. Please try again.'
    );
  },

  // Custom patterns
  confirmAction: (action: string, onConfirm: () => void) => {
    toast.warning(
      `Confirm ${action}`,
      `Are you sure you want to ${action}?`,
      {
        action: {
          label: 'Confirm',
          onClick: onConfirm,
        },
        persistent: true,
      }
    );
  },
});

export default ToastProvider;