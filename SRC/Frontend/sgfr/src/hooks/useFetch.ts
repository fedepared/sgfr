import { useState, useEffect, useCallback, useTransition } from 'react';
import { STORAGE_KEYS } from '../constants/storage.constant';

export interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(url));
  const [error, setError] = useState<Error | null>(null);
  const [, startTransition] = useTransition();

  const executeFetch = useCallback(
    async (signal?: AbortSignal) => {
      startTransition(() => {
        setLoading(true);
        setError(null);
      });

      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const headers = new Headers();

        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        headers.set('Content-Type', 'application/json');

        const response = await fetch(url, {
          headers,
          signal,
        });

        if (response.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.message || json?.error || `Error HTTP: ${response.status}`);
        }

        startTransition(() => {
          setData(json);
        });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        const parsedError = err instanceof Error ? err : new Error('Error al consultar el servicio');
        startTransition(() => {
          setError(parsedError);
        });
      } finally {
        startTransition(() => {
          setLoading(false);
        });
      }
    },
    [url]
  );

  useEffect(() => {
    if (!url) {
      return;
    }

    const abortController = new AbortController();
    void executeFetch(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [url, executeFetch]);

  const refetch = useCallback(async () => {
    await executeFetch();
  }, [executeFetch]);

  return { data, loading, error, refetch, setData };
}
