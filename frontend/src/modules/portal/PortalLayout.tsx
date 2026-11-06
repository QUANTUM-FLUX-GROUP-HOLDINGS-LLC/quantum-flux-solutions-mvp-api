import Link from 'next/link';
import { useRouter } from 'next/router';

export const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  
  const menu = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Credit Repair', path: '/dashboard/credit-repair' },
    { name: 'Personal Tax', path: '/dashboard/tax-personal' },
    { name: 'Business Tax', path: '/dashboard/tax-business' },
    { name: 'Bookkeeping', path: '/dashboard/bookkeeping' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
        <h2 className="text-xl font-bold text-gray-800 mb-8">Quantum Flux</h2>
        <nav className="space-y-2">
          {menu.map((item) => (
            <Link key={item.path} href={item.path} className={`block px-4 py-2 rounded-md text-sm font-medium ${router.pathname === item.path ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              {item.name}
            </Link>
          ))}
        </nav>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="mt-12 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">Sign Out</button>
      </aside>
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
