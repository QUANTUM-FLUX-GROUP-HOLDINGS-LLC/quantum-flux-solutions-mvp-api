import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChatWidget } from "./ChatWidget";
import { useAuth } from './auth-context';
import {
  Briefcase, FileText, MessageSquare, LayoutDashboard, Settings,
  BookOpen, ShieldCheck, User, Scale, Users, ArrowLeft,
} from 'lucide-react';

// Sections exposed inside each module workspace (mirrors ViolationScanPro-style
// contextual navigation: entering a module swaps the sidebar for its own menu).
const MODULE_MENUS: Record<
  string,
  { label: string; items: { href: string; icon: any; label: string; exact?: boolean }[] }
> = {
  credit: {
    label: 'Credit Repair',
    items: [
      { href: '/admin/credit?tab=disputes', icon: Scale, label: 'Disputes', exact: true },
      { href: '/admin/credit?tab=clients', icon: Users, label: 'Clients', exact: true },
      { href: '/admin/letter-library', icon: FileText, label: 'Letter Library' },
    ],
  },
  'tax-personal': {
    label: 'Personal Tax',
    items: [
      { href: '/admin/tax-personal', icon: FileText, label: 'Client Documents' },
    ],
  },
  'tax-business': {
    label: 'Business Tax',
    items: [
      { href: '/admin/tax-business', icon: Briefcase, label: 'Business Profiles' },
    ],
  },
  bookkeeping: {
    label: 'Bookkeeping',
    items: [
      { href: '/admin/bookkeeping', icon: BookOpen, label: 'Monthly Files' },
    ],
  },
};

// Maps the current route to the module workspace it belongs to (if any).
function getModuleFromPath(pathname: string): string | null {
  if (pathname.startsWith('/admin/credit') || pathname.startsWith('/admin/letter-library')) return 'credit';
  if (pathname.startsWith('/admin/tax-personal')) return 'tax-personal';
  if (pathname.startsWith('/admin/tax-business')) return 'tax-business';
  if (pathname.startsWith('/admin/bookkeeping')) return 'bookkeeping';
  return null;
}

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  // PROTECTION: CLIENT-role users are redirected to the client portal.
  useEffect(() => {
    if (!loading && (!user || user.role === 'CLIENT')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Verifying access...</div>;

  const isAdmin = user.role === 'ADMIN';
  const showCredit = isAdmin || user.role === 'CREDIT_REPAIR';
  const showTaxBiz = isAdmin || user.role === 'TAX_BUSINESS';
  const showTaxPer = isAdmin || user.role === 'TAX_PERSONAL';
  const showBook = isAdmin || user.role === 'BOOKKEEPING';

  const NavItem = ({
    href, icon: Icon, label, exact,
  }: { href: string; icon: any; label: string; exact?: boolean }) => {
    const baseHref = href.split('?')[0];
    const active = exact ? router.asPath === href : router.pathname.startsWith(baseHref);
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
          active
            ? 'bg-gray-800 text-white border-l-4 border-red-500'
            : 'text-gray-400 hover:text-white hover:bg-gray-800 border-l-4 border-transparent'
        }`}
      >
        <Icon className="w-5 h-5 opacity-80" />
        <span className="text-sm font-medium flex-1">{label}</span>
      </Link>
    );
  };

  const SectionTitle = ({ children: text }: { children: React.ReactNode }) => (
    <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{text}</p>
  );

  // Resolve the contextual module menu, honoring the staff role gates.
  const moduleKey = getModuleFromPath(router.pathname);
  const roleAllowsModule =
    (moduleKey === 'credit' && showCredit) ||
    (moduleKey === 'tax-personal' && showTaxPer) ||
    (moduleKey === 'tax-business' && showTaxBiz) ||
    (moduleKey === 'bookkeeping' && showBook);
  const moduleMenu = moduleKey && roleAllowsModule ? MODULE_MENUS[moduleKey] : null;

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans">
      <aside className="w-64 bg-[#1A1A1A] text-white flex flex-col shadow-xl z-10">
        <div className="p-5 flex items-center gap-3 border-b border-gray-800">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold text-xl">Q</div>
          <span className="text-lg font-bold text-white tracking-tight">Quantum Flux</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {moduleMenu ? (
            /* ---------- Contextual module sidebar ---------- */
            <>
              <div>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-semibold">All Modules</span>
                </Link>
              </div>

              <div>
                <SectionTitle>{moduleMenu.label}</SectionTitle>
                {moduleMenu.items.map((item) => (
                  <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} exact={item.exact} />
                ))}
              </div>

              <div>
                <SectionTitle>Overview</SectionTitle>
                <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem href="/admin/inbox" icon={MessageSquare} label="Inbox" />
              </div>

              <div>
                <SectionTitle>Workspace</SectionTitle>
                <NavItem href="/admin/settings" icon={Settings} label="Settings" />
              </div>
            </>
          ) : (
            /* ---------- Master sidebar (module picker) ---------- */
            <>
              <div>
                <SectionTitle>Overview</SectionTitle>
                <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem href="/admin/inbox" icon={MessageSquare} label="Inbox" />
              </div>

              <div>
                <SectionTitle>Service Modules</SectionTitle>
                {showCredit && <NavItem href="/admin/credit?tab=disputes" icon={ShieldCheck} label="Credit Repair" exact />}
                {showTaxPer && <NavItem href="/admin/tax-personal" icon={User} label="Personal Tax" />}
                {showTaxBiz && <NavItem href="/admin/tax-business" icon={Briefcase} label="Business Tax" />}
                {showBook && <NavItem href="/admin/bookkeeping" icon={BookOpen} label="Bookkeeping" />}
              </div>

              <div>
                <SectionTitle>Workspace</SectionTitle>
                <NavItem href="/admin/settings" icon={Settings} label="Settings" />
              </div>
            </>
          )}
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
