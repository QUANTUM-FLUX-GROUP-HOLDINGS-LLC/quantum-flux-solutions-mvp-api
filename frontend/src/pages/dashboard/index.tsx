import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { PortalLayout } from '../../modules/portal/PortalLayout';
import { Lock, CheckCircle } from 'lucide-react';
import { apiFetch } from '../../modules/shared/api';

export default function DashboardHub() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { router.push('/login'); return; }
    setUser(JSON.parse(storedUser));
  }, [router]);

  // ─── LÓGICA DE SUSCRIPCIONES (MOCK) ──────────────────────────────────────────
  // Cuando integremos Stripe, esto se leerá del JWT o de la DB: user.services
  // Por ahora, simulamos que el cliente SOLO ha pagado Credit Repair.
  const activeServices = user?.services || ['credit-repair']; 

  const allServices = [
    { id: 'credit-repair', name: 'Credit Repair', desc: 'View dispute status and upload credit reports.' },
    { id: 'tax-personal', name: 'Personal Tax', desc: 'Upload W-2s and manage your personal return.' },
    { id: 'tax-business', name: 'Business Tax', desc: 'Manage S-Corp and LLC tax profiles.' },
    { id: 'bookkeeping', name: 'Bookkeeping', desc: 'Upload receipts and financial statements.' },
  ];

  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'Client'}</h1>
      <p className="text-gray-500 mb-8">Select a service to manage your documents and status.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allServices.map((service) => {
          const isActive = activeServices.includes(service.id);

          if (isActive) {
            // TARJETA ACTIVA (Pagada)
            return (
              <Link key={service.id} href={`/dashboard/${service.id}`} className="block p-6 bg-white border border-indigo-100 rounded-lg shadow-sm hover:shadow-md hover:border-indigo-300 transition group relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">{service.name}</h3>
                    <p className="text-sm text-gray-500 mt-2">{service.desc}</p>
                  </div>
                  <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />
                </div>
                <div className="mt-4 text-sm font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform inline-block">
                  Enter Workspace &rarr;
                </div>
              </Link>
            );
          } else {
            // TARJETA BLOQUEADA (No pagada)
            return (
              <div key={service.id} className="relative p-6 bg-gray-50 border border-gray-200 rounded-lg opacity-75 overflow-hidden group">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={async (e) => {
                    e.preventDefault();
                    const btn = e.currentTarget;
                    const originalText = btn.innerHTML;
                    btn.innerHTML = 'Cargando...';
                    btn.disabled = true;
                    
                    try {
                      const res = await apiFetch<{url: string}>('/stripe/checkout', {
                        method: 'POST',
                        body: JSON.stringify({ serviceId: service.id })
                      });
                      window.location.href = res.url;
                    } catch (err: any) {
                      alert(`Error: ${err.message}`);
                      btn.innerHTML = originalText;
                      btn.disabled = false;
                    }
                  }} className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all">
                    Subscribe for $149
                  </button>
                </div>
                <div className="flex justify-between items-start z-0 relative">
                  <div>
                    <h3 className="text-lg font-bold text-gray-500">{service.name}</h3>
                    <p className="text-sm text-gray-400 mt-2">{service.desc}</p>
                  </div>
                  <Lock className="text-gray-400 w-6 h-6 flex-shrink-0" />
                </div>
                <div className="mt-4 text-sm font-semibold text-gray-400 inline-block z-0 relative">
                  Locked
                </div>
              </div>
            );
          }
        })}
      </div>
    </PortalLayout>
  );
}
