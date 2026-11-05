import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Invalid email or password');
      const data = await res.json();

      // Bloquear acceso a Staff desde el portal público
      if (data.user.role !== 'CLIENT') {
        throw new Error('Staff members must log in through the dedicated portal.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-[#1a1f36] mb-2">Quantum Flux Solutions</h2>
        <p className="text-center text-gray-500 mb-6">Welcome back, Client</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <button type="submit" disabled={busy} className="w-full bg-[#0f4c81] text-white p-2 rounded-md font-medium hover:bg-[#0a3a63] disabled:opacity-50">
            {busy ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <a href="/register" className="text-blue-600 font-medium hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
