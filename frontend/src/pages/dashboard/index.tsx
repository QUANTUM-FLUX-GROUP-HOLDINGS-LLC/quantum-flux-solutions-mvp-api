import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PortalLayout } from '../../modules/portal/PortalLayout';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../modules/shared/api';
import { useAuth } from '../../modules/shared/auth-context';

export default function DashboardHub() {
  const router = useRouter();
  const { user, services, loading, refreshEntitlements } = useAuth();
  const handledReturn = useRef(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!router.isReady || handledReturn.current) return;
    
    if (router.query.success === 'true') {
      handledReturn.current = true;
      void (async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await refreshEntitlements();
        toast.success('Payment received — your service is now unlocked.');
        router.replace('/dashboard', undefined, { shallow: true });
      })();
    } else if (router.query.canceled === 'true') {
      handledReturn.current = true;
      toast('Checkout canceled.', { icon: 'ℹ️' });
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [router, refreshEntitlements]);

  const allServices = [
    { id: 'credit-repair', name: 'Credit Repair', desc: 'View dispute status and upload credit reports.' },
    { id: 'tax-personal', name: 'Personal Tax', desc: 'Upload W-2s and manage your personal return.' },
    { id: 'tax-business', name: 'Business Tax', desc: 'Manage S-Corp and LLC tax profiles.' },
    { id: 'bookkeeping', name: 'Bookkeeping', desc: 'Upload receipts and financial statements.' },
  ];

  const handleSubscribe = async (serviceId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const btn = e.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Connecting...';
    btn.disabled = true;
    try {
      const res = await apiFetch<{ url: string }>('/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ serviceId }),
      });
      window.location.href = res.url;
    } catch (err: any) {
      toast.error(err?.message || 'Could not start checkout.');
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  };

  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome back, {user?.name || 'Client'}
      </h1>
      <p className="text-gray-500 mb-8">Select a service to manage your documents and status.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allServices.map((service) => {
          const isActive = services.includes(service.id);

          return (
            <div
              key={service.id}
              className={`relative p-6 rounded-xl border transition-all duration-200 ${
                isActive
                  ? 'bg-white border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300'
                  : 'bg-gray-50/50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                    {service.name}
                  </h3>
                  <p className={`text-sm mt-1 ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                    {service.desc}
                  </p>
                </div>
                {isActive ? (
                  <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />
                ) : (
                  <Lock className="text-gray-400 w-5 h-5 flex-shrink-0" />
                )}
              </div>

              <div className="mt-6">
                {isActive ? (
                  <Link
                    href={`/dashboard/${service.id}`}
                    className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 group"
                  >
                    Enter Workspace
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <button
                    onClick={(e) => handleSubscribe(service.id, e)}
                    className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center shadow-sm"
                  >
                    Unlock for $149
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PortalLayout>
  );
}
