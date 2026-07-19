"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, type User } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("adonis_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ user: User }>("/auth/me");
      setUser(data.user);
    } catch {
      localStorage.removeItem("adonis_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("adonis_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await api<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      localStorage.setItem("adonis_token", data.token);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("adonis_token");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
