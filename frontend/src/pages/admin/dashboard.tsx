import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/admin/metrics`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => res.json()).then(data => setMetrics(data));
  }, []);

  return (
    <AdminLayout>
      <div className="grid grid-cols-3 gap-6 max-w-5xl">
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-gray-800">
          <p className="text-sm text-gray-500 font-medium">Total Clients</p>
          <p className="text-4xl font-bold text-gray-800">{metrics?.totalClients || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-medium">Pending Disputes</p>
          <p className="text-4xl font-bold text-gray-800">{metrics?.activeDisputes || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Documents Stored</p>
          <p className="text-4xl font-bold text-gray-800">{metrics?.totalDocs || 0}</p>
        </div>
      </div>
    </AdminLayout>
  );
}
