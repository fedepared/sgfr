import { useState, useEffect, useCallback, useRef } from 'react';
import { env } from '../configs/env.config';
import { STORAGE_KEYS } from '../constants/storage.constant';

export interface UseFetchOptions extends RequestInit {
  /** Parámetros opcionales de query string */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Si es false, no dispara la petición automáticamente al montar o cambiar url (útil para ejecuciones manuales) */
  autoFetch?: boolean;
}

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Custom Hook useFetch reutilizable y tipado con genéricos.
 * - Soporta URLs relativas (resuelve contra env.API_BASE_URL) o absolutas (http/https).
 * - Agrega automáticamente el token JWT en Authorization: Bearer <token>.
 * - Maneja estados de carga, error y cancelación mediante AbortController para evitar memory leaks.
 * - Expone refetch() para re-ejecutar la petición cuando sea necesario.
 */
export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(url && options.autoFetch !== false));
  const [error, setError] = useState<string | null>(null);

  // Guardamos las opciones en un ref para no provocar bucles en useEffect si se pasa un objeto inline
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const buildUrl = useCallback((rawUrl: string, params?: Record<string, string | number | boolean | undefined | null>) => {
    // Si es relativa (ej: "/vehicles" o "vehicles"), concatenar con la URL base
    let fullUrl = rawUrl;
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      const base = env.API_BASE_URL.replace(/\/+$/, '');
      const path = rawUrl.replace(/^\/+/, '');
      fullUrl = `${base}/${path}`;
    }

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
      }
    }

    return fullUrl;
  }, []);

  const executeFetch = useCallback(
    async (signal?: AbortSignal) => {
      if (!url) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fullUrl = buildUrl(url, optionsRef.current.params);
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(optionsRef.current.headers as Record<string, string>),
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(fullUrl, {
          ...optionsRef.current,
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
          const message = json?.message || json?.error || `Error HTTP: ${response.status}`;
          throw new Error(message);
        }

        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Petición cancelada normalmente por desmontaje o re-render
          return;
        }
        const message = err instanceof Error ? err.message : 'Error desconocido al obtener datos';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [url, buildUrl]
  );

  useEffect(() => {
    if (optionsRef.current.autoFetch === false || !url) {
      return;
    }

    const controller = new AbortController();
    executeFetch(controller.signal);

    return () => {
      controller.abort();
    };
  }, [url, executeFetch]);

  const refetch = useCallback(async () => {
    await executeFetch();
  }, [executeFetch]);

  return { data, loading, error, refetch, setData };
}

export default useFetch;
