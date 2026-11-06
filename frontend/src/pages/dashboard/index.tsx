import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { PortalLayout } from '../../modules/portal/PortalLayout';

export default function DashboardHub() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { router.push('/login'); return; }
    setUser(JSON.parse(storedUser));
  }, [router]);

  // Simulamos que el cliente tiene todos los servicios activos por ahora.
  // Cuando integremos Stripe, esto vendrá de user.services = ['CREDIT_REPAIR']
  const activeServices = ['credit-repair', 'tax-personal', 'tax-business', 'bookkeeping'];

  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'Client'}</h1>
      <p className="text-gray-500 mb-8">Select a service to manage your documents and status.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeServices.includes('credit-repair') && (
          <Link href="/dashboard/credit-repair" className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-800">Credit Repair</h3>
            <p className="text-sm text-gray-500 mt-2">View dispute status and upload credit reports.</p>
          </Link>
        )}
        {activeServices.includes('tax-personal') && (
          <Link href="/dashboard/tax-personal" className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-800">Personal Tax</h3>
            <p className="text-sm text-gray-500 mt-2">Upload W-2s and manage your personal return.</p>
          </Link>
        )}
        {activeServices.includes('tax-business') && (
          <Link href="/dashboard/tax-business" className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-800">Business Tax</h3>
            <p className="text-sm text-gray-500 mt-2">Manage S-Corp and LLC tax profiles.</p>
          </Link>
        )}
        {activeServices.includes('bookkeeping') && (
          <Link href="/dashboard/bookkeeping" className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-800">Bookkeeping</h3>
            <p className="text-sm text-gray-500 mt-2">Upload receipts and financial statements.</p>
          </Link>
        )}
      </div>
    </PortalLayout>
  );
}
