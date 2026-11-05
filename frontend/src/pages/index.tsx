import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Detectar si venimos de un pago exitoso
  useEffect(() => {
    if (router.query.success === 'true') {
      setIsSuccess(true);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/stripe/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error creating customer');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!result) return;
    setCheckoutLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: result.stripeId, email: result.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setCheckoutLoading(false);
    }
  };

  // Pantalla de Éxito
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            🎉
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-8">Welcome to Quantum Flux Solutions. Your Credit Repair plan is now active.</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-brand hover:bg-brand-dark transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de Formulario / Checkout
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quantum Flux Solutions</h1>
          <p className="text-sm text-gray-500 mt-2">MVP Onboarding & Checkout</p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand outline-none" placeholder="john@example.com" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-brand hover:bg-brand-dark shadow-md transition-all">
              {loading ? 'Saving...' : 'Continue to Checkout'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Account Created</h3>
              <p className="text-sm text-gray-500 mt-1">Customer ID: {result.id.split('-')[0]}...</p>
            </div>
            <button onClick={handleCheckout} disabled={checkoutLoading}
              className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-brand hover:bg-brand-dark shadow-md transition-all">
              {checkoutLoading ? 'Redirecting...' : 'Pay $149/mo for Credit Repair'}
            </button>
            <button onClick={() => { setResult(null); setName(''); setEmail(''); }} className="text-sm text-gray-500 hover:text-gray-800 underline block mx-auto">
              Start over
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}
