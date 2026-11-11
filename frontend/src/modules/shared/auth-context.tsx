import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { API_URL, apiFetch } from './api';
import {
  clearSession, getSessionToken, getSessionUserRaw,
  migrateLegacySession, SESSION_PREFIX,
} from './storage';

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
    const raw = getSessionUserRaw();
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, services: Array.isArray(parsed.services) ? parsed.services : [] };
  } catch {
    return null;
  }
};

const hasToken = () => typeof window !== 'undefined' && !!getSessionToken();

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

    setLoading(true);
    try {
      const fresh = await apiFetch<AuthUser>('/auth/me');
      const normalized: AuthUser = {
        ...fresh,
        services: Array.isArray(fresh.services) ? fresh.services : [],
      };
      setUser(normalized);
      localStorage.setItem(SESSION_PREFIX + 'user', JSON.stringify(normalized));
    } catch {
      localStorage.removeItem(SESSION_PREFIX + 'token');
      localStorage.removeItem(SESSION_PREFIX + 'user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    // Best-effort revocation of the server-side refresh chain before
    // local state is cleared (fire-and-forget; logout wins offline too).
    const t = getSessionToken();
    if (t) {
      void fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      }).catch(() => {});
    }
    clearSession();
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    // Migrate any legacy client_/staff_ session forward before the first
    // read so no logged-in browser is silently logged out by item 9.
    migrateLegacySession();
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
