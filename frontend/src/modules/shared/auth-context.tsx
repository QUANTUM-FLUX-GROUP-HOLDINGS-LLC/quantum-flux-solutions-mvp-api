import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from './api';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status?: string;
  services: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  services: string[];
  loading: boolean;
  refreshEntitlements: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, services: Array.isArray(parsed.services) ? parsed.services : [] };
  } catch {
    return null;
  }
};

const hasToken = () =>
  typeof window !== 'undefined' && !!localStorage.getItem('token');

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshEntitlements = useCallback(async () => {
    if (!hasToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const fresh = await apiFetch<AuthUser>('/auth/me');
      const normalized: AuthUser = {
        ...fresh,
        services: Array.isArray(fresh.services) ? fresh.services : [],
      };
      setUser(normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
    } catch {
      // Token invalid or backend unreachable — clear and force re-login.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    // Paint fast from localStorage to avoid a lock-flash, then refresh from server.
    const stored = readStoredUser();
    if (stored) setUser(stored);
    void refreshEntitlements();
  }, [refreshEntitlements]);

  const services = user?.services ?? [];

  return (
    <AuthContext.Provider value={{ user, services, loading, refreshEntitlements, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
