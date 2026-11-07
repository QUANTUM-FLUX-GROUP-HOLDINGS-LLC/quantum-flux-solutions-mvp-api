import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../modules/shared/auth-context';
import { getStoragePrefix } from '../modules/shared/storage';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { refreshEntitlements } = useAuth();
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

      if (data.user.role !== 'CLIENT') {
        throw new Error('Invalid email or password');
      }

      localStorage.setItem(getStoragePrefix() + 'token', data.token);
      localStorage.setItem(getStoragePrefix() + 'user', JSON.stringify(data.user));
      
      await refreshEntitlements();
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
        <p className="text-center text-gray-500 mb-6">Client Portal</p>

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

          <div className="text-center mt-3">
            <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-[#0f4c81] hover:underline">
              Forgot your password?
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/register" className="text-blue-600 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
