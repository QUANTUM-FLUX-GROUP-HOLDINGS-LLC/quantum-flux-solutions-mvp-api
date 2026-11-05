import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, CreditCard, FileText, BookOpen, 
  Settings, LogOut, UploadCloud, CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  
  // Estados para el archivo
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    try {
      const res = await fetch('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.query.success) {
      setTimeout(() => fetchUser(), 2000); 
    } else {
      fetchUser();
    }
  }, [router.query]);

  const handlePay = async () => {
    setPaying(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) window.location.href = data.url;
    } catch (err) {
      alert('Network error');
      setPaying(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    // Simulamos la subida al servidor
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-brand">Loading your dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-brand tracking-tight">Quantum Flux</span>
          
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-brand-light text-brand font-semibold rounded-lg">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <CreditCard size={18} /> Credit Repair
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <FileText size={18} /> Taxes
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <BookOpen size={18} /> Bookkeeping
          </a>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-600 w-full text-left transition-colors rounded-lg">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-gray-800">Overview</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {user.name.split(' ')[0]}</h2>
              <div className="flex items-center gap-2 mt-2">
                {user.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 size={14} /> ACCOUNT ACTIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle size={14} /> PAYMENT REQUIRED
                  </span>
                )}
              </div>
            </div>
            
            {user.status === 'PENDING' && (
              <button 
                onClick={handlePay} 
                disabled={paying}
                className="px-6 py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-all shadow-md"
              >
                {paying ? 'Redirecting...' : 'Activate Plan ($149/mo)'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-brand-light text-brand rounded-lg"><CreditCard size={20} /></div>
                <h3 className="font-bold text-gray-900 text-lg">Credit Repair</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Upload your credit reports to start the audit and dispute process.</p>
              
              {!uploadSuccess ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.png" />
                  <UploadCloud size={28} className="text-gray-400 mb-2" />
                  {file ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-brand">{file.name}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                        disabled={uploading}
                        className="px-4 py-1.5 bg-brand text-white text-xs font-bold rounded hover:bg-brand-dark"
                      >
                        {uploading ? 'Uploading...' : 'Confirm Upload'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG (max. 10MB)</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-green-800">Report Uploaded!</p>
                  <p className="text-xs text-green-600 mt-1">Our team will review it within 24 hours.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-brand-light text-brand rounded-lg"><FileText size={20} /></div>
                <h3 className="font-bold text-gray-900 text-lg">Tax Preparation</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Your tax filing status will appear here once the season begins.</p>
              
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">2026 Tax Season</span>
                  <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-brand h-1.5 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
