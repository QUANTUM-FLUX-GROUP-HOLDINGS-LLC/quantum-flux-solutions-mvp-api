import { useEffect, useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';
import { apiFetch } from '../../modules/shared/api';
import toast from 'react-hot-toast';
import { Building2, User, ChevronRight, Loader2 } from 'lucide-react';

export default function AdminTaxBusinessPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    // Fetch clients that have the TAX_BUSINESS service
    apiFetch<any[]>('/admin/clients')
      .then((data) => {
        const filtered = data.filter(c => c.services?.includes('tax-business'));
        setClients(filtered);
      })
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoadingClients(false));
  }, []);

  const handleSelectClient = async (client: any) => {
    setSelectedClient(client);
    setLoadingProfile(true);
    setProfile(null);
    try {
      const data = await apiFetch<any>(`/tax-business/${client.id}`);
      setProfile(data);
    } catch (err) {
      // If no profile exists, we just set empty
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Tax Management</h1>
        <p className="text-gray-500 mt-1">Review corporate tax profiles submitted by clients.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Sidebar: Clients List */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-700">Clients with Business Tax</h2>
          </div>
          {loadingClients ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : clients.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No clients have purchased this service yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                    selectedClient?.id === client.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{client.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{client.email}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Area: Profile Details */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm min-h-[400px]">
          {!selectedClient ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-gray-400">
              <Building2 className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">Select a client to view their profile</p>
            </div>
          ) : loadingProfile ? (
            <div className="h-full flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedClient.name}'s Profile</h2>
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  Business Tax
                </div>
              </div>

              {!profile ? (
                <div className="p-6 text-center bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                  This client has not filled out their business tax profile yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Entity Type</p>
                    <p className="text-sm font-medium text-gray-900">{profile.entityType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">EIN (Tax ID)</p>
                    <p className="text-sm font-medium text-gray-900">{profile.ein || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Gross Revenue</p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.grossRevenue ? `$${Number(profile.grossRevenue).toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Has Employees</p>
                    <p className="text-sm font-medium text-gray-900">{profile.hasEmployees || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Internal Notes</p>
                    <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 min-h-[80px]">
                      {profile.notes || 'No notes provided.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
