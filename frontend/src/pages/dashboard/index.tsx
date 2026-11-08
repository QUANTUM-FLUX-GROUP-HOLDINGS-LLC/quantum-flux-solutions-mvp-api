import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PortalLayout } from '../../modules/portal/PortalLayout';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../modules/shared/api';
import { useAuth } from '../../modules/shared/auth-context';

// TODO: fetch pricing from the backend instead of hardcoding it here.
const SERVICE_PRICE_LABEL = '$149';

const ALL_SERVICES = [
  { id: 'credit-repair', name: 'Credit Repair', desc: 'View dispute status and upload credit reports.' },
  { id: 'tax-personal', name: 'Personal Tax', desc: 'Upload W-2s and manage your personal return.' },
  { id: 'tax-business', name: 'Business Tax', desc: 'Manage S-Corp and LLC tax profiles.' },
  { id: 'bookkeeping', name: 'Bookkeeping', desc: 'Upload receipts and financial statements.' },
] as const;

export default function DashboardHub() {
  const router = useRouter();
  const { user, services, loading, refreshEntitlements } = useAuth();
  const handledReturn = useRef(false);
  const [connectingService, setConnectingService] = useState<string | null>(null);

  // Guard: small delay before redirecting unauthenticated visitors.
  useEffect(() => {
    if (!loading && !user) {
      const timer = setTimeout(() => router.push('/login'), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, user, router]);

  // Handle Stripe Checkout redirects.
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

  const handleSubscribe = async (serviceId: string) => {
    setConnectingService(serviceId);
    try {
      const res = await apiFetch<{ url: string }>('/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ serviceId }),
      });
      window.location.href = res.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start checkout.');
      setConnectingService(null);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome back, {user?.name || 'Client'}
      </h1>
      <p className="text-gray-500 mb-8">Select a service to manage your documents and status.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ALL_SERVICES.map((service) => {
          const isActive = services.includes(service.id);
          const isConnecting = connectingService === service.id;

          if (isActive) {
            return (
              <Link
                key={service.id}
                href={`/dashboard/${service.id}`}
                className="group block p-6 rounded-xl border bg-white border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                    <p className="text-sm mt-1 text-gray-500">{service.desc}</p>
                  </div>
                  <CheckCircle className="text-green-500 w-6 h-6 shrink-0" />
                </div>

                <span className="inline-flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                  Enter Workspace
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            );
          }

          return (
            <div
              key={service.id}
              className="relative p-6 rounded-xl border bg-gray-50/50 border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-600">{service.name}</h3>
                  <p className="text-sm mt-1 text-gray-400">{service.desc}</p>
                </div>
                <Lock className="text-gray-400 w-5 h-5 shrink-0" />
              </div>

              <button
                type="button"
                onClick={() => void handleSubscribe(service.id)}
                disabled={isConnecting}
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <span
                      className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"
                      aria-hidden="true"
                    />
                    Connecting...
                  </>
                ) : (
                  <>Unlock for {SERVICE_PRICE_LABEL}</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </PortalLayout>
  );
}
