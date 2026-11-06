import { useState, useEffect } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';

export default function TaxBusinessModule() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('USER');

  useEffect(() => {
    const storedRole = localStorage.getItem('role') || 'USER';
    setRole(storedRole);

    const fetchClients = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/admin/clients`);
        if (res.ok) {
          const data = await res.json();
          
          // LÓGICA CLAVE: Si es ADMIN, ve todo. Si es staff, solo ve CLIENTES.
          const filteredData = storedRole === 'ADMIN' 
            ? data 
            : data.filter((u: any) => u.role === 'CLIENT');
            
          setClients(Array.isArray(filteredData) ? filteredData : []);
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
        <div className="w-1/3 bg-[#1A1A1A] text-white rounded-lg overflow-hidden flex flex-col shadow-lg">
          <div className="p-4 border-b border-gray-800 bg-[#222]">
            <h2 className="font-bold text-lg">Corporate Clients</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-gray-400 text-sm">Loading clients...</p>
            ) : clients.length === 0 ? (
              <p className="p-4 text-gray-400 text-sm">No clients assigned yet.</p>
            ) : (
              clients.map((client) => (
                <div 
                  key={client.id} 
                  onClick={() => setSelectedClient(client)}
                  className={`p-4 border-b border-gray-800 cursor-pointer transition ${selectedClient?.id === client.id ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}
                >
                  <p className="font-medium text-white">{client.name || 'Unnamed'}</p>
                  <p className="text-xs text-gray-400">{client.email}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área de Trabajo */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
          {selectedClient ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{selectedClient.name}'s Corporate Workspace</h1>
                <button 
                  onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/tax-business/${selectedClient.id}/pdf`, "_blank")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition text-sm"
                >
                  Download PDF
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Business Tax Profile (Form 1120-S)</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Entity Type</label>
                    <select className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50">
                      <option>S-Corporation (1120-S)</option>
                      <option>C-Corporation (1120)</option>
                      <option>LLC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">EIN (Tax ID)</label>
                    <input type="text" placeholder="XX-XXXXXXX" className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Gross Revenue ($)</label>
                    <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Has Employees?</label>
                    <select className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50">
                      <option>No (Single Member)</option>
                      <option>Yes (W-2s required)</option>
                    </select>
                  </div>
                </div>
                <button className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700">Save Business Profile</button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              Select a corporate client from the list on the left.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
