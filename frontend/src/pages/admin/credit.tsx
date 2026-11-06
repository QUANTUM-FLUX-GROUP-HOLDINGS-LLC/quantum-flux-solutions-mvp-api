import { useState, useEffect } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';

export default function CreditModule() {
  const [activeTab, setActiveTab] = useState('Active');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const tabs = ['Active', 'Leads', 'Non-Payment', 'Paused', 'Finished', 'Deleted'];

  // Fetch de datos al cargar el componente
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/admin/clients`);
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header (igual que antes) */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Clients</h1>
            <p className="text-gray-500 text-sm mt-1">Search, filter, and open client workspaces. Follow-up due dates help prioritize outreach.</p>
          </div>
          <div className="flex gap-2">
            <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <span>👤</span> Lead
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2">
              <span>+</span> New Client
            </button>
          </div>
        </div>

        {/* Metrics (Dinámicos) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'TOTAL CLIENTS', value: clients.length, sub: 'Excludes finished and deleted...' },
            { label: 'NEW ENROLLMENTS (30D)', value: clients.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length, sub: '' },
            { label: 'ACTIVE', value: clients.filter(c => c.role === 'CLIENT').length, sub: '' }, // Asumiendo que los clientes normales tienen rol CLIENT
            { label: 'NEEDS ATTENTION', value: '0', sub: 'All Clear' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              {stat.sub && <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>}
            </div>
          ))}
        </div>

        {/* Client Directory */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Client Directory</h2>
            <button className="text-sm text-gray-600 font-medium hover:text-gray-900 flex items-center gap-1">
              ✉️ Email Clients
            </button>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-4 border-b border-gray-100 flex gap-4 text-sm overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 border-b-2 font-medium whitespace-nowrap ${
                  activeTab === tab ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab} <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{tab === 'Active' ? clients.length : 0}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 flex flex-wrap gap-3 border-b border-gray-100">
             {/* ... (Mismos filtros de antes) ... */}
             <input type="text" placeholder="Search Name, Email, or Phone" className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white flex-1 min-w-[200px]" />
          </div>

          {/* Lista de Clientes Real */}
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-12 text-center text-gray-500 text-sm">Loading clients...</div>
            ) : clients.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">No clients match these filters.</div>
            ) : (
              clients.map((client) => (
                <div key={client.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                      {client.name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name || 'Unnamed Client'}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {client.role}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      ⋮
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
