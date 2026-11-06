import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      if (parsed.role === 'CLIENT' || !parsed.role) { router.push('/dashboard'); return; }
      setUser(parsed);
    } else {
      router.push('/staff-login');
    }
  }, [router]);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isCredit = user.role === 'CREDIT_REPAIR';
  const isTaxP = user.role === 'TAX_PERSONAL';
  const isTaxB = user.role === 'TAX_BUSINESS';
  const isBook = user.role === 'BOOKKEEPING';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold text-red-500">Quantum Flux CRM</div>
        <div className="px-4 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
          Logged: <span className="text-white">{user.role}</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {isAdmin && <Link href="/admin/dashboard" className={`block px-4 py-2 rounded-md font-medium text-sm ${router.pathname === '/admin/dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>General Dashboard</Link>}
          
          <div className="pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wide px-4">Modules</div>

          {(isAdmin || isCredit) && <Link href="/admin/credit" className={`block px-4 py-2 rounded-md font-medium text-sm ${router.pathname.includes('/credit') ? 'bg-[#0f4c81] text-white' : 'text-gray-400 hover:text-white'}`}>Credit Repair</Link>}
          {(isAdmin || isTaxP) && <Link href="/admin/tax-personal" className={`block px-4 py-2 rounded-md font-medium text-sm ${router.pathname.includes('/tax-personal') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Personal Tax</Link>}
          {(isAdmin || isTaxB) && <Link href="/admin/tax-business" className={`block px-4 py-2 rounded-md font-medium text-sm ${router.pathname.includes('/tax-business') ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Business Tax</Link>}
          {(isAdmin || isBook) && <Link href="/admin/bookkeeping" className={`block px-4 py-2 rounded-md font-medium text-sm ${router.pathname.includes('/bookkeeping') ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}>Bookkeeping</Link>}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { localStorage.clear(); router.push('/staff-login'); }} className="text-sm text-gray-400 hover:text-white">Sign Out</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="bg-white border-b px-8 py-4 shadow-sm flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 capitalize">{router.pathname.split('/').pop()?.replace('-', ' ')} Module</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
    </div>
  );
}
