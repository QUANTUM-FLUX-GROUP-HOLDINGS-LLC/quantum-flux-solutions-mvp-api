export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com';

const token = () => (typeof window === 'undefined' ? null : localStorage.getItem('token'));

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
    throw new Error(res.status === 409
      ? 'Aún pendiente de revisión por el equipo.'
      : `No se pudo descargar (${res.status}).`);
  }
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition') || '';
  const name = /filename="?([^";]+)"?/.exec(cd)?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
