// src/hooks/useAsyncOperation.ts
// 非同期操作を統一化

import { useState, useCallback } from "react";
import { normalizeError, logError } from "@/lib/errors";

interface AsyncOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface AsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  logContext?: string;
}

/**
 * 非同期操作を管理するカスタムフック
 */
export function useAsyncOperation<T = any>(
  options: AsyncOperationOptions = {}
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await operation();
        setState({ data: result, isLoading: false, error: null });
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (error) {
        const normalizedError = normalizeError(error);
        const errorMessage = normalizedError.message;
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage 
        }));
        
        if (options.logContext) {
          logError(error, options.logContext);
        }
        
        if (options.onError) {
          options.onError(errorMessage);
        }
        
        return null;
      }
    },
    [options]
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
 * 複数の非同期操作を並列実行
 */
export function useParallelAsyncOperations<T = any>(
  options: AsyncOperationOptions = {}
) {
  const [state, setState] = useState<AsyncOperationState<T[]>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (operations: (() => Promise<T>)[]): Promise<T[] | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const results = await Promise.all(operations.map(op => op()));
        setState({ data: results, isLoading: false, error: null });
        
        if (options.onSuccess) {
          options.onSuccess(results);
        }
        
        return results;
      } catch (error) {
        const normalizedError = normalizeError(error);
        const errorMessage = normalizedError.message;
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage 
        }));
        
        if (options.logContext) {
          logError(error, options.logContext);
        }
        
        if (options.onError) {
          options.onError(errorMessage);
        }
        
        return null;
      }
    },
    [options]
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