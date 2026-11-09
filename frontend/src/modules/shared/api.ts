import { getStoragePrefix } from './storage';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const token = () => (typeof window === 'undefined' ? null : localStorage.getItem(getStoragePrefix() + 'token'));

/** Raw session token for transports that cannot set headers (SSE). */
export const getAuthToken = () => token();

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const t = token();
  if (t) headers.set('Authorization', `Bearer ${t}`);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json'); 
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${msg ? ` — ${msg.slice(0, 120)}` : ''}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export async function apiDownload(path: string, fallbackName: string) {
  const t = token();
  const res = await fetch(`${API_URL}${path}`, {
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });
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
