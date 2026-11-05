import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { UploadCard } from '../components/UploadCard';

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (!t) {
      router.push('/login');
    } else {
      setToken(t);
      if (u) setUser(JSON.parse(u));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-[#1a1f36] text-white flex flex-col">
        <div className="p-6 text-xl font-bold text-[#4a90e2]">Quantum Flux</div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className="bg-[#2a304a] px-4 py-2 rounded-md font-medium text-sm">My Dashboard</div>
          <div className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">My Documents</div>
          <div className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Billing</div>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
            <span>←</span> Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1">
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Client Portal</h1>
          <div className="text-sm text-gray-600">{user?.email || 'User'}</div>
        </header>

        <main className="p-8 max-w-4xl mx-auto space-y-6 pb-20">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user?.name || 'Client'}</h2>
            <p className="text-sm text-gray-600 mb-4">Your dedicated agent is currently reviewing your credit profile. Please upload any requested documents below.</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Status: ACTIVE REPAIR
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
              <span className="text-[#4a90e2]">🆔</span> Upload Verification Documents
            </h3>
            <p className="text-sm text-gray-500 mb-6">Please upload your ID and Proof of Address (Utility Bill). Your agent needs these to send dispute letters to the bureaus.</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <UploadCard token={token} />
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400 text-center">
            <p>Quantum Flux Solutions is not a law firm. You are solely responsible for reviewing all documents.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
