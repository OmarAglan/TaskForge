import { create } from 'zustand';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * Toast store for managing notifications
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  },
}));

/**
 * Toast utility functions
 */
export const toast = {
  /**
   * Show a success toast
   */
  success: (message: string, duration?: number) => {
    useToastStore.getState().addToast({
      message,
      severity: 'success',
      duration: duration ?? 4000,
    });
  },

  /**
   * Show an error toast
   */
  error: (message: string, duration?: number) => {
    useToastStore.getState().addToast({
      message,
      severity: 'error',
      duration: duration ?? 6000,
    });
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, duration?: number) => {
    useToastStore.getState().addToast({
      message,
      severity: 'warning',
      duration: duration ?? 5000,
    });
  },

  /**
   * Show an info toast
   */
  info: (message: string, duration?: number) => {
    useToastStore.getState().addToast({
      message,
      severity: 'info',
      duration: duration ?? 4000,
    });
  },

  /**
   * Show a toast with action button
   */
  withAction: (
    message: string,
    severity: ToastSeverity,
    action: { label: string; onClick: () => void },
    duration?: number
  ) => {
    useToastStore.getState().addToast({
      message,
      severity,
      duration: duration ?? 8000,
      action,
    });
  },

  /**
   * Clear all toasts
   */
  clear: () => {
    useToastStore.getState().clearToasts();
  },
};

export default toast;