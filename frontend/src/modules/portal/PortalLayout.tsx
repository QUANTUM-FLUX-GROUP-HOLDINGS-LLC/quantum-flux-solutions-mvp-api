import Link from 'next/link';
import { Settings,  useRouter } from 'next/router';
import { Settings,  Lock } from 'lucide-react';
import { Settings,  useAuth } from '../shared/auth-context';
import { Settings,  ChatWidget } from '../shared/ChatWidget'; // <-- IMPORT

export const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { services, signOut } = useAuth();

  const menu = [
    { name: 'Overview', path: '/dashboard', id: 'overview' },
    { name: 'Credit Repair', path: '/dashboard/credit-repair', id: 'credit-repair' },
    { name: 'Personal Tax', path: '/dashboard/tax-personal', id: 'tax-personal' },
    { name: 'Business Tax', path: '/dashboard/tax-business', id: 'tax-business' },
    { name: 'Bookkeeping', path: '/dashboard/bookkeeping', id: 'bookkeeping' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
        <h2 className="text-xl font-bold text-gray-800 mb-8">Quantum Flux</h2>
        <nav className="space-y-2">
          {menu.map((item) => {
            const isActive = item.id === 'overview' || services.includes(item.id);
            const isCurrentPath = router.pathname === item.path;

            if (isActive) {
              return (
                <Link key={item.path} href={item.path} className={`flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium ${isCurrentPath ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {item.name}
                </Link>
              );
            }
            return (
              <div key={item.path} className="flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium text-gray-400 opacity-60 cursor-not-allowed">
                {item.name}
                <Lock className="w-4 h-4" />
              </div>
            );
          })}
        </nav>
                  <Link href="/dashboard/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${router.pathname === '/dashboard/settings' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Settings className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium flex-1">Settings</span>
          </Link>
<button onClick={signOut} className="mt-12 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">Sign Out</button>
      </aside>
      <main className="flex-1 p-8 relative">
        <div className="max-w-5xl mx-auto">{children}</div>
        <ChatWidget /> {/* <-- RENDER */}
      </main>
    </div>
  );
};
