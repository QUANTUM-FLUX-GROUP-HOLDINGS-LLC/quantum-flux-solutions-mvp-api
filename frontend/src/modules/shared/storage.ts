// Session storage: single shared prefix since cycle 013.
// Previously sessions were mirrored under client_/staff_ prefixes so the
// client portal and the admin area could read them independently. The
// unified login (012) made the mirrors identical, so they only duplicated
// data. Route protection is role-based (RouteGuard), never prefix-based.
export const SESSION_PREFIX = 'qfs_';

// Legacy keys kept only so existing browsers migrate transparently.
const LEGACY_PREFIXES = ['client_', 'staff_'];

export interface SessionData {
  token: string;
  user: unknown;
}

// One-time in-flight migration: if a legacy session exists and the new one
// does not, copy it forward, then remove the legacy keys. Safe to call on
// every boot; it is a no-op once migrated or when nothing is stored.
export const migrateLegacySession = (): void => {
  if (typeof window === 'undefined') return;

  const hasNew = !!localStorage.getItem(SESSION_PREFIX + 'token');
  if (hasNew) {
    for (const p of LEGACY_PREFIXES) {
      localStorage.removeItem(p + 'token');
      localStorage.removeItem(p + 'user');
    }
    return;
  }

  for (const p of LEGACY_PREFIXES) {
    const token = localStorage.getItem(p + 'token');
    const user = localStorage.getItem(p + 'user');
    if (token) {
      localStorage.setItem(SESSION_PREFIX + 'token', token);
      if (user) localStorage.setItem(SESSION_PREFIX + 'user', user);
    }
  }

  for (const p of LEGACY_PREFIXES) {
    localStorage.removeItem(p + 'token');
    localStorage.removeItem(p + 'user');
  }
};

export const writeSession = (token: string, user: unknown, refreshToken?: string | null) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_PREFIX + 'token', token);
  localStorage.setItem(SESSION_PREFIX + 'user', JSON.stringify(user));
  if (refreshToken) localStorage.setItem(SESSION_PREFIX + 'refreshToken', refreshToken);
  else localStorage.removeItem(SESSION_PREFIX + 'refreshToken');
};

export const setSessionToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(SESSION_PREFIX + 'token', token);
};

export const getSessionRefreshToken = (): string | null =>
  typeof window === 'undefined' ? null : localStorage.getItem(SESSION_PREFIX + 'refreshToken');

export const setSessionRefreshToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(SESSION_PREFIX + 'refreshToken', token);
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_PREFIX + 'token');
  localStorage.removeItem(SESSION_PREFIX + 'user');
  localStorage.removeItem(SESSION_PREFIX + 'refreshToken');
  for (const p of LEGACY_PREFIXES) {
    localStorage.removeItem(p + 'token');
    localStorage.removeItem(p + 'user');
  }
};

export const getSessionToken = (): string | null =>
  typeof window === 'undefined' ? null : localStorage.getItem(SESSION_PREFIX + 'token');

export const getSessionUserRaw = (): string | null =>
  typeof window === 'undefined' ? null : localStorage.getItem(SESSION_PREFIX + 'user');
