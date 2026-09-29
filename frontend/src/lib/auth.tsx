"use client";

// Најава на корисникот: токенот се чува во localStorage, корисникот во контекст
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";
import type { User } from "./types";

type AuthResponse = { token: string; user: User };

type AuthContextValue = {
  user: User | null;
  ready: boolean; // true откако ќе провериме дали има зачуван токен
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // При вчитување: ако има токен, земи го корисникот
  useEffect(() => {
    async function load() {
      if (getToken()) {
        try {
          setUser(await api<User>("/api/auth/me"));
        } catch {
          setToken(null); // истечен токен
        }
      }
      setReady(true);
    }
    load();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<AuthResponse>("/api/auth/login", { method: "POST", body: { email, password } });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api<AuthResponse>("/api/auth/register", { method: "POST", body: { name, email, password } });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, ready, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
