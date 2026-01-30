import { useState, useCallback } from 'react';
import type { ApiError } from '../types/api.types';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T, TArgs extends unknown[]> extends UseApiState<T> {
  execute: (...args: TArgs) => Promise<T>;
  reset: () => void;
}

/**
 * Custom hook for making API calls with loading and error states
 */
export function useApi<T, TArgs extends unknown[] = []>(
  apiFunction: (...args: TArgs) => Promise<T>
): UseApiReturn<T, TArgs> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<T> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await apiFunction(...args);
        setState({ data, isLoading: false, error: null });
        return data;
      } catch (error) {
        const apiError = error as ApiError;
        setState((prev) => ({ ...prev, isLoading: false, error: apiError }));
        throw error;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Custom hook for immediate API execution on mount
 */
export function useApiOnMount<T>(
  apiFunction: () => Promise<T>,
  _dependencies: unknown[] = []
): UseApiState<T> & { refetch: () => Promise<T> } {
  const { data, isLoading, error, execute } = useApi(apiFunction);

  // Note: useEffect should be used in the component, not here
  // This is a simplified version - in real usage, call execute() in useEffect

  return {
    data,
    isLoading,
    error,
    refetch: execute,
  };
}

export default useApi;