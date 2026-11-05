import { useState } from 'react';
import { useRouter } from 'next/router';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('ADMIN');
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

      // Validar que realmente sea Staff
      if (data.user.role === 'CLIENT') {
        throw new Error('This is a client account. Please use the main login page.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/admin');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-2">Quantum Flux Staff</h2>
        <p className="text-center text-gray-500 mb-6">Restricted Access Portal</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Role</label>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 bg-gray-50">
              <option value="ADMIN">Administrator</option>
              <option value="CREDIT_REPAIR">Credit Repair Agent</option>
              <option value="TAX_PERSONAL">Tax Preparer (Personal)</option>
              <option value="TAX_BUSINESS">Tax Preparer (Business)</option>
              <option value="BOOKKEEPING">Bookkeeper</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Staff Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <button type="submit" disabled={busy} className="w-full bg-red-600 text-white p-2 rounded-md font-medium hover:bg-red-700 disabled:opacity-50">
            {busy ? 'Authenticating...' : 'Access CRM'}
          </button>
        </form>
      </div>
    </div>
  );
}
