import { useEffect, useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';
import { ClientDocuments } from '../../modules/admin/components/ClientDocuments';
import { apiFetch } from '../../modules/shared/api';
import toast from 'react-hot-toast';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';

export default function AdminBookkeepingPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    apiFetch<any[]>('/admin/clients')
      .then((data) => {
        const filtered = data.filter(c => c.services?.includes('bookkeeping'));
        setClients(filtered);
        if (filtered.length > 0) setSelectedClient(filtered[0]);
      })
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoadingClients(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookkeeping Management</h1>
        <p className="text-gray-500 mt-1">Review documents submitted by clients for bookkeeping.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Lista de clientes */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-700">Clients with Bookkeeping</h2>
          </div>
          {loadingClients ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : clients.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No clients have this service yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                    selectedClient?.id === client.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : 'hover:bg-gray-50'
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

        {/* Panel de documentos del cliente */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm min-h-[400px]">
          {!selectedClient ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-gray-400">
              <BookOpen className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">Select a client to view their documents</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedClient.name}</h2>
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  Bookkeeping
                </div>
              </div>

              {/* Componente reutilizado de la vista de admin */}
              <ClientDocuments clientId={selectedClient.id} />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
