import { getSessionRefreshToken, getSessionToken, setSessionRefreshToken, setSessionToken } from './storage';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Silent refresh on 401. Access JWTs are short-lived (15m); when one
 * expires, callers must not care. Refresh tokens rotate on every use,
 * so concurrent 401s share a single in-flight refresh call.
 */
let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const rt = getSessionRefreshToken();
      if (!rt) return false;
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (!data?.token) return false;
        setSessionToken(data.token);
        if (data.refreshToken) setSessionRefreshToken(data.refreshToken);
        return true;
      } catch {
        return false;
      }
    })().finally(() => { refreshing = null; });
  }
  return refreshing;
}

const buildHeaders = (init: RequestInit) => {
  const headers = new Headers(init.headers);
  const t = getSessionToken();
  if (t) headers.set('Authorization', `Bearer ${t}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return headers;
};

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await fetch(`${API_URL}${path}`, { ...init, headers: buildHeaders(init) });

  // One silent refresh+retry per call when the access JWT expired.
  if (res.status === 401 && getSessionRefreshToken() && path !== '/auth/refresh') {
    if (await tryRefresh()) {
      res = await fetch(`${API_URL}${path}`, { ...init, headers: buildHeaders(init) });
    }
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${msg ? ` — ${msg.slice(0, 120)}` : ''}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export async function apiDownload(path: string, fallbackName: string) {
  const doFetch = () => {
    const t = getSessionToken();
    return fetch(`${API_URL}${path}`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
  };
  let res = await doFetch();
  if (res.status === 401 && getSessionRefreshToken() && (await tryRefresh())) {
    res = await doFetch();
  }
  if (!res.ok) {
    if (res.status === 409) throw new Error('Still pending review by the team.');
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || `Download failed (${res.status}).`);
  }
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition') || '';
  const name = /filename="?([^";]+)"?/.exec(cd)?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
