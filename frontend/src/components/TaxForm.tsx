'use client';
import { useState, useEffect } from 'react';

export function TaxForm({ token }: { token: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`${apiUrl}/tax`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProfile(await res.json());
    } catch (err) {
      console.error('Failed to fetch tax profile', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${apiUrl}/tax`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filingStatus: profile.filingStatus,
          dependents: Number(profile.dependents),
          income: Number(profile.income),
        }),
      });

      if (!res.ok) throw new Error('Failed to save tax profile');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!profile) return <div className="text-sm text-gray-500 animate-pulse">Loading tax profile...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Filing Status</label>
        <select 
          value={profile.filingStatus} 
          onChange={(e) => setProfile({ ...profile, filingStatus: e.target.value })}
          className="w-full text-sm border-gray-300 rounded-md p-2 bg-white"
        >
          <option value="SINGLE">Single</option>
          <option value="MARRIED_JOINTLY">Married Filing Jointly</option>
          <option value="MARRIED_SEPARATELY">Married Filing Separately</option>
          <option value="HEAD_OF_HOUSEHOLD">Head of Household</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Dependents</label>
          <input 
            type="number" 
            min="0"
            value={profile.dependents} 
            onChange={(e) => setProfile({ ...profile, dependents: e.target.value })}
            className="w-full text-sm border-gray-300 rounded-md p-2 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Annual Income ($)</label>
          <input 
            type="number" 
            min="0"
            value={profile.income} 
            onChange={(e) => setProfile({ ...profile, income: e.target.value })}
            className="w-full text-sm border-gray-300 rounded-md p-2 bg-white"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">Tax profile saved successfully!</p>}

      <button 
        type="submit" 
        disabled={busy}
        className="w-full bg-[#0f4c81] text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 mt-2"
      >
        {busy ? 'Saving...' : 'Save Tax Info'}
      </button>
    </form>
  );
}
