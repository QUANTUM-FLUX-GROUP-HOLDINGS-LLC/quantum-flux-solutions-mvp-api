import { useState, useEffect } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';

export default function TaxBusinessModule() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    entityType: 'S-Corporation (1120-S)',
    ein: '',
    grossRevenue: '',
    hasEmployees: 'No',
    notes: ''
  });

  useEffect(() => {
    const storedRole = localStorage.getItem('role') || 'USER';
    const fetchClients = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/admin/clients?role=${storedRole}`);
        if (res.ok) {
          const data = await res.json();
          setClients(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Cargar el perfil cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClient) {
      const fetchProfile = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/tax-business/${selectedClient.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setFormData({
                entityType: data.entityType || 'S-Corporation (1120-S)',
                ein: data.ein || '',
                grossRevenue: data.grossRevenue?.toString() || '',
                hasEmployees: data.hasEmployees ? 'Yes' : 'No',
                notes: data.notes || ''
              });
            } else {
              // Si no hay perfil, limpiar formulario
              setFormData({ entityType: 'S-Corporation (1120-S)', ein: '', grossRevenue: '', hasEmployees: 'No', notes: '' });
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchProfile();
    }
  }, [selectedClient]);

  const handleSave = async () => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/tax-business/${selectedClient.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hasEmployees: formData.hasEmployees === 'Yes'
        })
      });
      if (res.ok) {
        alert('Profile saved successfully!');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

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
              <p className="p-4 text-gray-400 text-sm">Loading...</p>
            ) : clients.length === 0 ? (
              <p className="p-4 text-gray-400 text-sm">No clients found.</p>
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
                    <select 
                      value={formData.entityType} 
                      onChange={(e) => setFormData({...formData, entityType: e.target.value})}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50"
                    >
                      <option value="S-Corporation (1120-S)">S-Corporation (1120-S)</option>
                      <option value="C-Corporation (1120)">C-Corporation (1120)</option>
                      <option value="LLC">LLC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">EIN (Tax ID)</label>
                    <input 
                      type="text" 
                      value={formData.ein}
                      onChange={(e) => setFormData({...formData, ein: e.target.value})}
                      placeholder="XX-XXXXXXX" 
                      className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Gross Revenue ($)</label>
                    <input 
                      type="number" 
                      value={formData.grossRevenue}
                      onChange={(e) => setFormData({...formData, grossRevenue: e.target.value})}
                      placeholder="0" 
                      className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Has Employees?</label>
                    <select 
                      value={formData.hasEmployees} 
                      onChange={(e) => setFormData({...formData, hasEmployees: e.target.value})}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50"
                    >
                      <option value="No">No (Single Member)</option>
                      <option value="Yes">Yes (W-2s required)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Internal Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50"
                    placeholder="Add any additional notes here..."
                  ></textarea>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Business Profile'}
                </button>
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
