import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChatWidget } from "./ChatWidget";

export const AdminLayout = ({ children, role: propRole }: { children: React.ReactNode, role?: string }) => {
  const router = useRouter();
  
  // Inicialización síncrona: lee el localStorage inmediatamente si está en el navegador
  const [role, setRole] = useState<string>(() => {
    if (propRole) return propRole;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role') || 'USER';
    }
    return 'USER';
  });

  // Fallback: si el localStorage cambia (ej. por login), actualiza el estado
  useEffect(() => {
    if (!propRole && typeof window !== 'undefined') {
      const stored = localStorage.getItem('role');
      if (stored && stored !== role) {
        setRole(stored);
      }
    }
  }, [propRole, role]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    router.push('/staff-login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold text-red-500">Quantum Flux CRM</div>
        <div className="px-6 text-xs text-gray-400 mb-6 uppercase">LOGGED: {role}</div>
        
        <nav className="flex-1 px-4 space-y-1">
          <div className="text-xs text-gray-500 font-semibold mb-2 px-4 uppercase tracking-wider">Modules</div>
          {(role === 'ADMIN' || role === 'TAX_BUSINESS') && (
            <Link href="/admin/tax-business" className={`block px-4 py-2 rounded-md font-medium text-sm ${router.pathname === '/admin/tax-business' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Business Tax</Link>
          )}
          {(role === 'ADMIN' || role === 'TAX_PERSONAL') && (
            <Link href="/admin/tax-personal" className={`block px-4 py-2 rounded-md font-medium text-sm ${router.pathname === '/admin/tax-personal' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Personal Tax</Link>
          )}
          {(role === 'ADMIN' || role === 'CREDIT_REPAIR') && (
            <Link href="/admin/credit" className={`block px-4 py-2 rounded-md font-medium text-sm ${router.pathname === '/admin/credit' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Credit Repair</Link>
          )}
          {(role === 'ADMIN' || role === 'BOOKKEEPING') && (
            <Link href="/admin/bookkeeping" className={`block px-4 py-2 rounded-md font-medium text-sm ${router.pathname === '/admin/bookkeeping' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Bookkeeping</Link>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleSignOut} className="text-gray-400 hover:text-white text-sm w-full text-left">Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 relative">
        {children}
        <ChatWidget />
      </main>
    </div>
  );
};
