import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../shared/auth-context';
import { ChatWidget } from '../shared/ChatWidget';
import { LayoutDashboard, CreditCard, Briefcase, BookOpen, Settings, LogOut, Lock, ArrowLeft } from 'lucide-react';

export const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, services, signOut, loading } = useAuth();

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Mapeo de ruta a servicio requerido
  const protectedRoutes: Record<string, string> = {
    '/dashboard/credit-repair': 'credit-repair',
    '/dashboard/tax-personal': 'tax-personal',
    '/dashboard/tax-business': 'tax-business',
    '/dashboard/bookkeeping': 'bookkeeping',
  };

  const currentPath = router.pathname;
  const requiredService = protectedRoutes[currentPath];
  const isBlocked = requiredService && !services.includes(requiredService);

  const NavItem = ({ href, icon: Icon, label, isLocked }: { href: string, icon: any, label: string, isLocked?: boolean }) => (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${router.pathname.startsWith(href) ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
      <Icon className="w-5 h-5 opacity-80" />
      <span className="text-sm font-medium flex-1">{label}</span>
      {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
    </Link>
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-5 flex items-center gap-3 border-b border-gray-200">
          <div className="w-8 h-8 bg-[#0f4c81] rounded flex items-center justify-center text-white font-bold text-xl">Q</div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">Quantum Flux</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          <div className="mb-4">
            <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Overview</p>
            <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem href="/dashboard/settings" icon={Settings} label="Settings" />
          </div>

          <div>
            <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">My Services</p>
            <NavItem href="/dashboard/credit-repair" icon={CreditCard} label="Credit Repair" isLocked={!services.includes('credit-repair')} />
            <NavItem href="/dashboard/tax-personal" icon={Briefcase} label="Personal Tax" isLocked={!services.includes('tax-personal')} />
            <NavItem href="/dashboard/tax-business" icon={Briefcase} label="Business Tax" isLocked={!services.includes('tax-business')} />
            <NavItem href="/dashboard/bookkeeping" icon={BookOpen} label="Bookkeeping" isLocked={!services.includes('bookkeeping')} />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-md transition text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-[#F9FAFB]">
        <div className="p-8 max-w-7xl mx-auto">
          {isBlocked ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto mt-20">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Active</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You do not have an active subscription for this service. Please return to the dashboard to unlock it.
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 bg-[#0f4c81] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#0a3a63] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
        <ChatWidget />
      </main>
    </div>
  );
};
