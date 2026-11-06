import { useState, useEffect } from 'react';

export const TaxPersonalModule = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const role = localStorage.getItem('role') || 'USER';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/admin/clients?role=${role}`);
        if (res.ok) setClients(await res.json());
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchClients();
  }, []);

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className="w-1/3 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50"><h2 className="font-bold text-gray-800">Personal Tax Clients</h2></div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <p className="p-4 text-gray-500 text-sm">Loading...</p> : clients.map(c => (
            <div key={c.id} onClick={() => setSelectedClient(c)} className={`p-4 border-b border-gray-100 cursor-pointer transition ${selectedClient?.id === c.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50'}`}>
              <p className="font-medium text-gray-900">{c.name || 'Unnamed'}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {selectedClient ? (
          <><h1 className="text-xl font-bold text-gray-900 mb-6">{selectedClient.name}'s Personal Tax Workspace</h1><div className="border border-gray-200 rounded-lg p-6 bg-gray-50"><p className="text-sm text-gray-500">Form 1040 coming soon.</p></div></>
        ) : <div className="h-full flex items-center justify-center text-gray-400">Select a client</div>}
      </div>
    </div>
  );
};
