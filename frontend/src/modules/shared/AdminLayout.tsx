import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChatWidget } from "./ChatWidget";
import { useAuth } from './auth-context';
import { Briefcase, FileText, MessageSquare, LayoutDashboard, Settings, BookOpen, ShieldCheck, User } from 'lucide-react';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  
  // PROTECCIÓN: Si es un CLIENTE, lo pateamos al dashboard de cliente inmediatamente
  useEffect(() => {
    if (!loading && (!user || user.role === 'CLIENT')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Verifying access...</div>;

  const isAdmin = user.role === 'ADMIN';
  
  // Lógica del menú: Admin ve todo, Staff ve solo lo suyo
  const showCredit = isAdmin || user.role === 'CREDIT_REPAIR';
  const showTaxBiz = isAdmin || user.role === 'TAX_BUSINESS';
  const showTaxPer = isAdmin || user.role === 'TAX_PERSONAL';
  const showBook = isAdmin || user.role === 'BOOKKEEPING';

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${router.pathname.startsWith(href) ? 'bg-gray-800 text-white border-l-4 border-red-500' : 'text-gray-400 hover:text-white hover:bg-gray-800 border-l-4 border-transparent'}`}>
      <Icon className="w-5 h-5 opacity-80" />
      <span className="text-sm font-medium flex-1">{label}</span>
    </Link>
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans">
      <aside className="w-64 bg-[#1A1A1A] text-white flex flex-col shadow-xl z-10">
        <div className="p-5 flex items-center gap-3 border-b border-gray-800">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold text-xl">Q</div>
          <span className="text-lg font-bold text-white tracking-tight">Quantum Flux</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {/* OVERVIEW */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Overview</p>
            <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem href="/admin/inbox" icon={MessageSquare} label="Inbox" />
          </div>

          {/* SERVICE MODULES - The Core of the Business */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Service Modules</p>
            {showCredit && <NavItem href="/admin/credit" icon={ShieldCheck} label="Credit Repair" />}
            {showTaxPer && <NavItem href="/admin/tax-personal" icon={User} label="Personal Tax" />}
            {showTaxBiz && <NavItem href="/admin/tax-business" icon={Briefcase} label="Business Tax" />}
            {showBook && <NavItem href="/admin/bookkeeping" icon={BookOpen} label="Bookkeeping" />}
          </div>

          {/* WORKSPACE */}
          <div>
            <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Workspace</p>
            <NavItem href="/admin/settings" icon={Settings} label="Settings" />
          </div>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button onClick={signOut} className="w-full bg-[#E53935] hover:bg-red-700 text-white font-semibold py-2.5 rounded-md transition flex items-center justify-center gap-2 text-sm">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-white">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
        <ChatWidget />
      </main>
    </div>
  );
};
