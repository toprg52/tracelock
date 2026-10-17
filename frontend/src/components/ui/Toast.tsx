import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'critical';

export interface ToastMessage {
  id: string;
  type?: ToastType;
  title: string;
  description?: React.ReactNode;
  duration?: number;
}

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title: string;
  description?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  description,
  onClose,
  className = '',
}) => {
  const isAlert = type === 'critical' || type === 'warning';

  const typeConfig: Record<
    ToastType,
    { icon: React.ReactNode; bg: string; border: string; text: string }
  > = {
    info: {
      icon: <Info className="w-5 h-5 text-info shrink-0" aria-hidden="true" />,
      bg: 'bg-surface-raised',
      border: 'border-border',
      text: 'text-text',
    },
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-low shrink-0" aria-hidden="true" />,
      bg: 'bg-surface-raised',
      border: 'border-low-border',
      text: 'text-text',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-high shrink-0" aria-hidden="true" />,
      bg: 'bg-surface-raised',
      border: 'border-high-border',
      text: 'text-text',
    },
    critical: {
      icon: <AlertCircle className="w-5 h-5 text-critical shrink-0" aria-hidden="true" />,
      bg: 'bg-surface-raised',
      border: 'border-critical-border',
      text: 'text-text',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-elevation-3 border ${config.border} ${config.bg}
        min-w-[280px] max-w-md transition-all duration-fast select-none ${className}
      `.trim()}
    >
      <div className="mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <h5 className={`text-sm font-semibold leading-tight ${config.text}`}>{title}</h5>
        {description && (
          <p className="text-xs text-text-muted mt-1 leading-normal">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="text-text-muted hover:text-text p-1 -mr-1 -mt-1 rounded hover:bg-surface transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

Toast.displayName = 'Toast';

// Context & Hook for global toast dispatch
interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              id={t.id}
              type={t.type}
              title={t.title}
              description={t.description}
              onClose={() => removeToast(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toasts: [],
      addToast: () => '',
      removeToast: () => {},
    };
  }
  return context;
};
