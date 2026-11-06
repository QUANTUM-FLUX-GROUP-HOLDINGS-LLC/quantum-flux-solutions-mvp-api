import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChatWidget } from "./ChatWidget";

export const AdminLayout = ({ children, role: propRole }: { children: React.ReactNode, role?: string }) => {
  const router = useRouter();
  const [role, setRole] = useState<string>('USER');

  // Leer el rol síncronamente para evitar parpadeos
  useEffect(() => {
    if (propRole) {
      setRole(propRole);
    } else if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('role') || 'USER');
    }
  }, [propRole]);

  const handleSignOut = () => {
    localStorage.clear();
    router.push('/staff-login');
  };

  // Componente reutilizable para los items del menú
  const NavItem = ({ href, icon, label, badge }: { href: string, icon: string, label: string, badge?: string }) => (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${router.pathname === href ? 'bg-gray-800 text-white border-l-4 border-red-500' : 'text-gray-400 hover:text-white hover:bg-gray-800 border-l-4 border-transparent'}`}>
      <span className="text-lg opacity-80">{icon}</span>
      <span className="text-sm font-medium flex-1">{label}</span>
      {badge && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{badge}</span>}
    </Link>
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans">
      {/* Sidebar Oscuro */}
      <aside className="w-64 bg-[#1A1A1A] text-white flex flex-col shadow-xl z-10">
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-gray-800">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold text-xl">
            Q
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Quantum Flux</span>
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          
          {/* OVERVIEW */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Overview</p>
            <NavItem href="/admin/dashboard" icon="🏠" label="Dashboard" />
          </div>

          {/* CLIENT OPERATIONS */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Client Operations</p>
            <NavItem href="/admin/inbox" icon="✉️" label="Inbox" />
            <NavItem href="/admin/clients" icon="👥" label="Clients" />
            
            {/* Mostrar módulos según el rol */}
            {(role === 'ADMIN' || role === 'CREDIT_REPAIR') && (
              <NavItem href="/admin/credit" icon="👥" label="Credit Clients" />
            )}
            {(role === 'ADMIN' || role === 'TAX_BUSINESS') && (
              <NavItem href="/admin/tax-business" icon="🏢" label="Business Tax" />
            )}
            {(role === 'ADMIN' || role === 'TAX_PERSONAL') && (
              <NavItem href="/admin/tax-personal" icon="👤" label="Personal Tax" />
            )}
            {(role === 'ADMIN' || role === 'BOOKKEEPING') && (
              <NavItem href="/admin/bookkeeping" icon="📊" label="Bookkeeping" />
            )}
          </div>

          {/* ORGANIZATION */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Organization</p>
            <NavItem href="#" icon="👨‍💼" label="Members" />
          </div>

          {/* WORKSPACE */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Workspace</p>
            <NavItem href="/admin/letter-library" icon="📚" label="Letter Library" />
            <NavItem href="/admin/settings" icon="⚙️" label="Settings" />
            <NavItem href="#" icon="🎧" label="Support" />
          </div>
        </div>

        {/* Botón Sign Out */}
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleSignOut} className="w-full bg-[#E53935] hover:bg-red-700 text-white font-semibold py-2.5 rounded-md transition flex items-center justify-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto relative bg-white">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
        <ChatWidget />
      </main>
    </div>
  );
};
