// Storage scopes: the client portal and the admin area resolve different
// key prefixes based on the current hostname/path. Sessions are persisted
// under every scope at login so a unified login works from any page.
export const STORAGE_PREFIXES = ['client_', 'staff_'] as const;

export const getStoragePrefix = () => {
  if (typeof window === 'undefined') return 'client_';
  const isStaff =
    window.location.hostname.startsWith('staff') ||
    window.location.pathname.startsWith('/admin');
  return isStaff ? 'staff_' : 'client_';
};

// Persist the session under every known prefix so both the client portal
// and the admin area can read it after a role-based redirect.
export const writeSession = (token: string, user: unknown) => {
  if (typeof window === 'undefined') return;
  for (const prefix of STORAGE_PREFIXES) {
    localStorage.setItem(prefix + 'token', token);
    localStorage.setItem(prefix + 'user', JSON.stringify(user));
  }
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  for (const prefix of STORAGE_PREFIXES) {
    localStorage.removeItem(prefix + 'token');
    localStorage.removeItem(prefix + 'user');
  }
};
