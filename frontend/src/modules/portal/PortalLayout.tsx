import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../shared/auth-context';
import { ChatWidget } from '../shared/ChatWidget';
import { LayoutDashboard, CreditCard, Briefcase, BookOpen, Settings, LogOut } from 'lucide-react';

export const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${router.pathname.startsWith(href) ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
      <Icon className="w-5 h-5 opacity-80" />
      <span className="text-sm font-medium flex-1">{label}</span>
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
            <NavItem href="/dashboard/credit-repair" icon={CreditCard} label="Credit Repair" />
            <NavItem href="/dashboard/tax-personal" icon={Briefcase} label="Personal Tax" />
            <NavItem href="/dashboard/tax-business" icon={Briefcase} label="Business Tax" />
            <NavItem href="/dashboard/bookkeeping" icon={BookOpen} label="Bookkeeping" />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-md transition text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-[#F9FAFB]">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
        <ChatWidget />
      </main>
    </div>
  );
};
