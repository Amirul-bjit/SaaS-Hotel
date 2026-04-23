'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/types';
import { saveAuth, clearAuth, getSavedUser } from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = getSavedUser();
    setUser(saved);
    setLoading(false);
  }, []);

  function login(authUser: AuthUser) {
    saveAuth(authUser);
    setUser(authUser);
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
