import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    
    // Simulamos el envío de correo (aquí conectarías con un endpoint /auth/forgot-password)
    setTimeout(() => {
      toast.success('Recovery email sent (mock)');
      setSubmitted(true);
      setBusy(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-100">
        
        <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-[#0f4c81] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
        </Link>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-50 text-[#0f4c81] rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset password</h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-[#0f4c81] focus:border-[#0f4c81]" 
                  placeholder="you@example.com"
                />
              </div>
              <button 
                type="submit" 
                disabled={busy} 
                className="w-full bg-[#0f4c81] text-white py-2.5 rounded-md font-semibold hover:bg-[#0a3a63] disabled:opacity-50 transition-colors"
              >
                {busy ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
