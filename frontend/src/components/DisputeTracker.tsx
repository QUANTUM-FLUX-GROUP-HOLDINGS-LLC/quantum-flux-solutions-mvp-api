'use client';
import { useState, useEffect } from 'react';

export function DisputeTracker({ token }: { token: string }) {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [bureau, setBureau] = useState('Equifax');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchDisputes();
  }, []);

  async function fetchDisputes() {
    try {
      const res = await fetch(`${apiUrl}/disputes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDisputes(data);
      }
    } catch (err) {
      console.error('Failed to fetch disputes', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountName.trim()) return;
    
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/disputes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bureau, accountName, accountNumber }),
      });

      if (!res.ok) throw new Error('Failed to create dispute');

      setAccountName('');
      setAccountNumber('');
      await fetchDisputes(); // Recargar la lista
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Helper para los colores del status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SENT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_REVIEW': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELETED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <span className="text-[#4a90e2]">⚖️</span> Credit Dispute Tracker
      </h3>
      <p className="text-sm text-gray-500 mb-6">Add negative accounts to dispute them with the credit bureaus.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-medium text-gray-700 mb-3 text-sm">Add New Account</h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bureau</label>
              <select 
                value={bureau} 
                onChange={(e) => setBureau(e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2 bg-white"
              >
                <option value="Equifax">Equifax</option>
                <option value="Experian">Experian</option>
                <option value="TransUnion">TransUnion</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account Name</label>
              <input 
                type="text" 
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Chase Credit Card"
                className="w-full text-sm border-gray-300 rounded-md p-2 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account Number (Optional)</label>
              <input 
                type="text" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. **** 1234"
                className="w-full text-sm border-gray-300 rounded-md p-2 bg-white"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button 
              type="submit" 
              disabled={busy || !accountName}
              className="w-full bg-[#0f4c81] text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 mt-2"
            >
              {busy ? 'Adding...' : 'Add to Dispute List'}
            </button>
          </form>
        </div>

        {/* Lista de Disputas */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">Your Disputes ({disputes.length})</h4>
          {disputes.length === 0 ? (
            <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border text-center">
              No disputes added yet.
            </div>
          ) : (
            <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {disputes.map((d) => (
                <li key={d.id} className="p-3 border rounded-lg bg-white shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{d.accountName}</p>
                    <p className="text-xs text-gray-500">{d.bureau} {d.accountNumber ? `• ${d.accountNumber}` : ''}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusColor(d.status)}`}>
                    {d.status.replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
