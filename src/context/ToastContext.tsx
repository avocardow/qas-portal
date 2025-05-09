"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification from '@/components/ui/notification/Notification';

type ToastVariant = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
}

interface ToastOptions {
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ variant, title, description, duration = 3000 }: ToastOptions) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, variant, title, description, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        {toasts.map(({ id, variant, title, description, duration }) => (
          <Notification
            key={id}
            variant={variant}
            title={title}
            description={description}
            hideDuration={duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
} 