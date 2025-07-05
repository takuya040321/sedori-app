// src/hooks/useDebounce.ts
// デバウンス処理を共通化

import { useCallback, useRef } from "react";
import { UI_CONFIG } from "@/lib/constants";

/**
 * デバウンス処理を行うカスタムフック
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = UI_CONFIG.DEBOUNCE_DELAY
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

/**
 * 値のデバウンス処理を行うカスタムフック
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number = UI_CONFIG.DEBOUNCE_DELAY
): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}