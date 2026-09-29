// Мал помошник за повици кон FastAPI backend-от
"use client";

import { useCallback, useEffect, useState } from "react";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
const TOKEN_KEY = "enigma_token";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // приватен режим – игнорирај
  }
}

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      // FastAPI враќа detail како текст или листа со грешки
      message = typeof data.detail === "string" ? data.detail : data.detail?.[0]?.msg ?? message;
    } catch {}
    throw new ApiError(res.status, message);
  }
  return res.json();
}

// Hook за вчитување податоци: const { data, loading, error, reload } = useApi<Room[]>("/api/rooms")
// Ако path е null, ништо не се вчитува.
export function useApi<T>(path: string | null) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{ path: string | null; version: number; data: T | null; error: string | null }>({
    path: null,
    version: 0,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    api<T>(path)
      .then((data) => !cancelled && setResult({ path, version, data, error: null }))
      .catch((e: Error) => !cancelled && setResult({ path, version, data: null, error: e.message }));
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  // При reload ги чуваме старите податоци; при нов path почнуваме од празно
  const samePath = result.path === path;
  const loading = path !== null && (!samePath || result.version !== version);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data: samePath ? result.data : null, error: samePath ? result.error : null, loading, reload };
}
