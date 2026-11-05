import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<'CLIENT' | 'STAFF'>('CLIENT');
  
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
      
      // VALIDACIÓN DE SEGURIDAD: 
      // Si intenta entrar por Staff pero es un Cliente (o viceversa), bloqueamos.
      if (loginType === 'STAFF' && data.user.role === 'CLIENT') {
        throw new Error('This is a client account. Please use the Client Login tab.');
      }
      if (loginType === 'CLIENT' && data.user.role !== 'CLIENT') {
        throw new Error('This is a staff account. Please use the Staff Login tab.');
      }

      // Si todo está bien, guardamos sesión
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirección según el rol
      if (data.user.role === 'CLIENT') {
        router.push('/dashboard');
      } else {
        router.push('/admin');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* Tabs para cambiar entre Client y Staff */}
        <div className="flex border-b">
          <button 
            onClick={() => { setLoginType('CLIENT'); setError(null); }}
            className={`flex-1 py-4 text-center font-semibold ${loginType === 'CLIENT' ? 'bg-white text-[#0f4c81] border-b-2 border-[#0f4c81]' : 'bg-gray-50 text-gray-500'}`}
          >
            Client Login
          </button>
          <button 
            onClick={() => { setLoginType('STAFF'); setError(null); }}
            className={`flex-1 py-4 text-center font-semibold ${loginType === 'STAFF' ? 'bg-white text-red-600 border-b-2 border-red-600' : 'bg-gray-50 text-gray-500'}`}
          >
            Staff Login
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {loginType === 'CLIENT' ? 'Welcome Back' : 'Staff Portal'}
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* SELECTOR DE ROL (SOLO PARA STAFF) */}
            {loginType === 'STAFF' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 bg-gray-50"
                >
                  <option value="ADMIN">Administrator</option>
                  <option value="CREDIT_REPAIR">Credit Repair Agent</option>
                  <option value="TAX_PERSONAL">Tax Preparer (Personal)</option>
                  <option value="TAX_BUSINESS">Tax Preparer (Business)</option>
                  <option value="BOOKKEEPING">Bookkeeper</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {loginType === 'STAFF' && (
                  <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            
            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className={`w-full text-white p-2 rounded-md font-medium disabled:opacity-50 ${loginType === 'CLIENT' ? 'bg-[#0f4c81] hover:bg-[#0a3a63]' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {busy ? 'Logging in...' : (loginType === 'CLIENT' ? 'Log In' : 'Access CRM')}
            </button>
          </form>

          {/* LINK DE SIGN UP (SOLO PARA CLIENTES) */}
          {loginType === 'CLIENT' && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account? <a href="/register" className="text-blue-600 font-medium hover:underline">Sign up</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
