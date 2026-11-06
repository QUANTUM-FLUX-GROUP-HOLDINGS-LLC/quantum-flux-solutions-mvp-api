import { useEffect, useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';
import { apiFetch } from '../../modules/shared/api';
import toast from 'react-hot-toast';
import { Users, FileText, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalClients: 0, activeDisputes: 0, totalDocs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ totalClients: number; activeDisputes: number; totalDocs: number }>('/admin/metrics')
      .then(setMetrics)
      .catch((err) => toast.error('Failed to load metrics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your organization's activity and performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Clients */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Clients</p>
              <h2 className="text-3xl font-bold text-gray-900">{loading ? '...' : metrics.totalClients}</h2>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Active Disputes */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Disputes</p>
              <h2 className="text-3xl font-bold text-gray-900">{loading ? '...' : metrics.activeDisputes}</h2>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-red-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Total Documents */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Documents</p>
              <h2 className="text-3xl font-bold text-gray-900">{loading ? '...' : metrics.totalDocs}</h2>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder para gráficos futuros */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Client Status Breakdown</h3>
        <p className="text-gray-500">More detailed charts will appear here as your client base grows.</p>
      </div>
    </AdminLayout>
  );
}
