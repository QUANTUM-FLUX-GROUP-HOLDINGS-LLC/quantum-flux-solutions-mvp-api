import { useState, useEffect } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';

export default function BookkeepingModule() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/admin/clients`);
        if (res.ok) {
          const data = await res.json();
          setClients(Array.isArray(data) ? data : []);
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
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        {/* Lista de Clientes */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800">Clients</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-gray-500 text-sm">Loading clients...</p>
            ) : clients.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No clients found.</p>
            ) : (
              clients.map((client) => (
                <div 
                  key={client.id} 
                  onClick={() => setSelectedClient(client)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition ${selectedClient?.id === client.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50'}`}
                >
                  <p className="font-medium text-gray-900">{client.name || 'Unnamed'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área de Trabajo */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {selectedClient ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-6">{selectedClient.name}'s Bookkeeping Workspace</h1>
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Financial Statements</h2>
                <p className="text-sm text-gray-500">Not filled out yet.</p>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a client
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
