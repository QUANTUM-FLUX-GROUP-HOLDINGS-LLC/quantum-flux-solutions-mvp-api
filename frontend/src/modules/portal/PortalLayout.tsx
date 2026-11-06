import Link from 'next/link';
import { useRouter } from 'next/router';
import { Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

export const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [activeServices, setActiveServices] = useState<string[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.services) setActiveServices(user.services);
    }
  }, []);
  
  // ─── LÓGICA DE SUSCRIPCIONES (MOCK) ──────────────────────────────────────────
  // Igual que en el Hub, simulamos que solo Credit Repair está activo.
 

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
            const isActive = item.id === 'overview' || activeServices.includes(item.id);
            const isCurrentPath = router.pathname === item.path;

            if (isActive) {
              return (
                <Link key={item.path} href={item.path} className={`flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium ${isCurrentPath ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {item.name}
                </Link>
              );
            } else {
              // Si no está pagado, mostramos candado y evitamos la navegación
              return (
                <div key={item.path} className="flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium text-gray-400 opacity-60 cursor-not-allowed">
                  {item.name}
                  <Lock className="w-4 h-4" />
                </div>
              );
            }
          })}
        </nav>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="mt-12 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">Sign Out</button>
      </aside>
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
