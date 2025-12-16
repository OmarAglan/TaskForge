import { useState, useCallback } from 'react';

export interface UseConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  showWarningIcon?: boolean;
}

export interface UseConfirmState extends UseConfirmOptions {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Hook for managing confirmation dialogs
 */
export function useConfirm() {
  const [state, setState] = useState<UseConfirmState>({
    isOpen: false,
    isLoading: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: 'primary',
    showWarningIcon: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback(
    (options: UseConfirmOptions & { onConfirm?: () => void | Promise<void> }): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          isOpen: true,
          isLoading: false,
          title: options.title || 'Confirm',
          message: options.message || 'Are you sure?',
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          confirmColor: options.confirmColor || 'primary',
          showWarningIcon: options.showWarningIcon || false,
          onConfirm: async () => {
            setState((prev) => ({ ...prev, isLoading: true }));
            try {
              if (options.onConfirm) {
                await options.onConfirm();
              }
              setState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
              resolve(true);
            } catch (error) {
              setState((prev) => ({ ...prev, isLoading: false }));
              resolve(false);
            }
          },
          onCancel: () => {
            setState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
            resolve(false);
          },
        });
      });
    },
    []
  );

  const closeConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
  }, []);

  return {
    confirm,
    closeConfirm,
    confirmState: state,
  };
}

/**
 * Shorthand for delete confirmation
 */
export function useDeleteConfirm() {
  const { confirm, closeConfirm, confirmState } = useConfirm();

  const confirmDelete = useCallback(
    (itemName: string, onDelete?: () => void | Promise<void>) => {
      return confirm({
        title: 'Delete Confirmation',
        message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'error',
        showWarningIcon: true,
        onConfirm: onDelete,
      });
    },
    [confirm]
  );

  return {
    confirmDelete,
    closeConfirm,
    confirmState,
  };
}

export default useConfirm;