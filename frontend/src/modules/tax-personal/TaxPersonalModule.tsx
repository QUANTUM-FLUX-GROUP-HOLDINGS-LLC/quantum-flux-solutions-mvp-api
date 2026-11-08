import { useEffect, useState } from 'react';
import { apiFetch } from '../shared/api';
import toast from 'react-hot-toast';
import { Loader2, AlertCircle, User } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  role: string;
}

export const TaxPersonalModule = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch<Client[]>('/admin/clients')
      .then((data) => {
        setClients((data ?? []).filter((c) => c.role === 'CLIENT'));
        setError(false);
      })
      .catch(() => {
        setError(true);
        toast.error('Failed to load clients');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Client list */}
      <div className="w-1/3 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-bold text-gray-800">Personal Tax Clients</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-label="Loading clients" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 text-sm">Could not load clients.</p>
            </div>
          ) : clients.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">No clients found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left p-4 transition-colors ${
                    selectedClient?.id === client.id
                      ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <p className="font-medium text-gray-900">{client.name || 'Unnamed'}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workspace pane */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        {selectedClient ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" /> {selectedClient.name}&rsquo;s Personal Tax Workspace
            </h2>
            <div className="border border-gray-200 border-dashed rounded-lg p-6 bg-gray-50 text-center">
              <p className="text-sm text-gray-500">Form 1040 coming soon.</p>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select a client to view their personal tax workspace.
          </div>
        )}
      </div>
    </div>
  );
};
