import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegister ? 'register' : 'login';
    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await fetch(`https://quantum-flux-api-npru.onrender.com/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      // Guardamos el token en el navegador
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirigimos al dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Quantum Flux Solutions</h1>
          <p className="text-sm text-gray-500 mt-2">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand outline-none" />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand outline-none" />
          </div>
          
          <button type="submit" disabled={loading}
            className="w-full py-3 px-4 mt-2 rounded-lg text-white font-semibold bg-brand hover:bg-brand-dark transition-all">
            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-brand font-semibold hover:underline">
            {isRegister ? 'Log in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
