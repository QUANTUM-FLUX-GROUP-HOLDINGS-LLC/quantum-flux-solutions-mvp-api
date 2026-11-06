import { useState } from 'react';
import { useRouter } from 'next/router';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Guardar token y rol (asegurando que se guarde el rol real del usuario)
      localStorage.setItem('token', data.access_token || data.token);
      
      // Intentar extraer el rol de varias formas posibles en las que el backend lo envíe
      const userRole = data.user?.role || data.role || role; 
      localStorage.setItem('role', userRole);

      // Redirigir según el rol
      if (userRole === 'TAX_BUSINESS') router.push('/admin/tax-business');
      else if (userRole === 'TAX_PERSONAL') router.push('/admin/tax-personal');
      else if (userRole === 'CREDIT_REPAIR') router.push('/admin/credit');
      else if (userRole === 'BOOKKEEPING') router.push('/admin/bookkeeping');
      else router.push('/admin/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-2">Quantum Flux Staff</h1>
        <p className="text-center text-gray-500 mb-6">Restricted Access Portal</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Role (Optional)</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded-md p-2">
              <option value="ADMIN">Administrator</option>
              <option value="TAX_BUSINESS">Business Tax</option>
              <option value="TAX_PERSONAL">Personal Tax</option>
              <option value="CREDIT_REPAIR">Credit Repair</option>
              <option value="BOOKKEEPING">Bookkeeping</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border rounded-md p-2" placeholder="business@test.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border rounded-md p-2" placeholder="password123" />
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition font-semibold">
            {loading ? 'Authenticating...' : 'Access CRM'}
          </button>
        </form>
      </div>
    </div>
  );
}
