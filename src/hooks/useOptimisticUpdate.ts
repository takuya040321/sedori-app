// src/hooks/useOptimisticUpdate.ts
// 楽観的更新を統一化

import { useState, useCallback } from "react";
import { normalizeError, logError } from "@/lib/errors";

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string, rollbackData: T) => void;
  logContext?: string;
}

/**
 * 楽観的更新を管理するカスタムフック
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (
      optimisticData: T,
      operation: () => Promise<T | void>
    ): Promise<boolean> => {
      const previousData = data;
      
      // 楽観的更新を即座に適用
      setData(optimisticData);
      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();
        
        // サーバーからの結果がある場合はそれを使用
        if (result !== undefined) {
          setData(result);
        }
        
        setIsLoading(false);
        
        if (options.onSuccess) {
          options.onSuccess(result || optimisticData);
        }
        
        return true;
      } catch (error) {
        // エラー時は元のデータに戻す
        setData(previousData);
        
        const normalizedError = normalizeError(error);
        const errorMessage = normalizedError.message;
        
        setError(errorMessage);
        setIsLoading(false);
        
        if (options.logContext) {
          logError(error, options.logContext);
        }
        
        if (options.onError) {
          options.onError(errorMessage, previousData);
        }
        
        return false;
      }
    },
    [data, options]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    update,
    reset,
  };
}