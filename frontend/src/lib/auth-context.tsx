'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, AuthUser, Role } from './api';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fields: { email: string; password: string; fullName: string; phone?: string; role: Role }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = window.localStorage.getItem('dofix_token');
    const storedUser = window.localStorage.getItem('dofix_user');
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function persist(accessToken: string, u: AuthUser) {
    window.localStorage.setItem('dofix_token', accessToken);
    window.localStorage.setItem('dofix_user', JSON.stringify(u));
    setToken(accessToken);
    setUser(u);
  }

  async function login(email: string, password: string) {
    const res = await api.login({ email, password });
    persist(res.accessToken, res.user);
    routeForRole(res.user.role);
  }

  async function register(fields: { email: string; password: string; fullName: string; phone?: string; role: Role }) {
    const res = await api.register(fields);
    persist(res.accessToken, res.user);
    routeForRole(res.user.role);
  }

  function routeForRole(role: Role) {
    if (role === 'ADMIN') router.push('/admin');
    else if (role === 'TECHNICIAN') router.push('/technician');
    else router.push('/customer');
  }

  function logout() {
    window.localStorage.removeItem('dofix_token');
    window.localStorage.removeItem('dofix_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
