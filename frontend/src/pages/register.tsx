import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed. Try a different email.');
      }

      toast.success('Account created! Please log in.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="w-10 h-10 bg-[#0f4c81] rounded flex items-center justify-center text-white font-bold text-2xl mx-auto">Q</div>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="text-gray-500 text-sm mt-1">Start managing your finances today.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-[#0f4c81] focus:border-[#0f4c81]" 
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-[#0f4c81] focus:border-[#0f4c81]" 
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-[#0f4c81] focus:border-[#0f4c81]" 
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{error}</p>}

          <button 
            type="submit" 
            disabled={busy} 
            className="w-full bg-[#0f4c81] text-white py-2.5 rounded-md font-semibold hover:bg-[#0a3a63] disabled:opacity-50 transition-colors"
          >
            {busy ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-[#0f4c81] font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
