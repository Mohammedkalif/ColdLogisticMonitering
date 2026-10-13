import { useCallback, useState } from 'react';

/**
 * `useState` mirrored into `localStorage`.
 * Falls back to in-memory state when storage is unavailable (SSR, private mode).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((previous: T) => T)) => {
      setStoredValue((previous) => {
        const next = value instanceof Function ? value(previous) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* Storage unavailable — keep the in-memory value. */
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
