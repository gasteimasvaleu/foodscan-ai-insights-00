import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: any; // Para compatibilidade com o toaster
}

const toasts: Toast[] = [];
let toastId = 0;

export const useToast = () => {
  const [, forceUpdate] = useState({});

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = (toastId++).toString();
    const newToast: Toast = {
      id,
      title,
      description,
      variant
    };
    
    toasts.push(newToast);
    forceUpdate({});
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        forceUpdate({});
      }
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      forceUpdate({});
    }
  }, []);

  return {
    toasts,
    toast,
    dismiss,
  };
};

export const toast = (options: Omit<Toast, 'id'>) => {
  // Simple console fallback
  if (options.variant === 'destructive') {
    console.error(`❌ ${options.title}: ${options.description}`);
  } else {
    console.log(`✅ ${options.title}: ${options.description}`);
  }
};