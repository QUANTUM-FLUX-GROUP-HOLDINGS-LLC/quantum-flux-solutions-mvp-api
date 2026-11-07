import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../modules/shared/auth-context';
import { getStoragePrefix } from '../modules/shared/storage';

export default function StaffLoginPage() {
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

      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();

      // STRICT SECURITY: Clients are not allowed here.
      if (data.user.role === 'CLIENT') {
        throw new Error('Unauthorized access');
      }

      localStorage.setItem(getStoragePrefix() + 'token', data.token);
      localStorage.setItem(getStoragePrefix() + 'user', JSON.stringify(data.user));
      
      await refreshEntitlements();
      router.push('/admin/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-[#1A1A1A] p-8 rounded-lg shadow-2xl border border-gray-700">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-black font-bold text-2xl">Q</div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">Staff Portal</h2>
        <p className="text-center text-gray-400 mb-6">Authorized personnel only</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Work Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full bg-gray-800 border border-gray-600 text-white rounded-md p-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full bg-gray-800 border border-gray-600 text-white rounded-md p-2 focus:ring-indigo-500" required />
          </div>
          
          {error && <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded">{error}</p>}

          <button type="submit" disabled={busy} className="w-full bg-indigo-600 text-white p-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 mt-4">
            {busy ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
