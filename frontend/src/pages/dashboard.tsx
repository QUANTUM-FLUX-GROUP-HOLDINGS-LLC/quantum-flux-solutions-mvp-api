import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { UploadCard } from '../components/UploadCard';
import { DisputeTracker } from '../components/DisputeTracker';

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
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1f36] text-white flex flex-col">
        <div className="p-6 text-xl font-bold text-[#4a90e2]">Quantum Flux</div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className="bg-[#2a304a] px-4 py-2 rounded-md font-medium text-sm">Dashboard</div>
          <div className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Credit Repair</div>
          <div className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Taxes</div>
          <div className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Bookkeeping</div>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
            <span>←</span> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Overview</h1>
          <div className="text-sm text-gray-600">{user?.email || 'User'}</div>
        </header>

        <main className="p-8 max-w-5xl mx-auto space-y-6 pb-20">
          {/* Welcome Banner */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name || 'User'}</h2>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                ⚠ PAYMENT REQUIRED
              </div>
            </div>
            <button className="bg-[#0f4c81] text-white px-6 py-2 rounded-md font-medium hover:bg-[#0a3a63]">
              Activate Plan ($149/mo)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Credit Repair Card (Upload) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <span className="text-[#4a90e2]">💳</span> Credit Reports
              </h3>
              <p className="text-sm text-gray-500 mb-6">Upload your credit reports to start the audit process.</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <UploadCard token={token} />
              </div>
            </div>

            {/* Tax Preparation Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <span className="text-[#4a90e2]">📄</span> Tax Preparation
              </h3>
              <p className="text-sm text-gray-500 mb-6">Your tax filing status will appear here once the season begins.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border">
                <div>
                  <p className="font-medium text-sm text-gray-800">2026 Tax Season</p>
                  <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="w-1/4 h-full bg-[#0f4c81]"></div>
                  </div>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-medium">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* NUEVO: Componente del Rastreador de Disputas */}
          <DisputeTracker token={token} />

        </main>
      </div>
    </div>
  );
}
