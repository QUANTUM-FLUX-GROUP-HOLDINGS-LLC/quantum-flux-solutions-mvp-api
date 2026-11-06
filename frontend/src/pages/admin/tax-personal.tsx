import { useEffect, useState } from 'react';
import { AdminLayout } from '../../../modules/shared/AdminLayout';

export default function TaxPersonalModule() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [taxProfile, setTaxProfile] = useState<any>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetch(`${API_URL}/admin/customers`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => res.json()).then(data => setCustomers(data));
  }, []);

  async function loadClientTax(client: any) {
    setSelectedClient(client);
    const res = await fetch(`${API_URL}/tax/customers/${client.id}`, { headers: { Authorization: `Bearer ${token}` }});
    if (res.ok) setTaxProfile(await res.json());
  }

  return (
    <AdminLayout>
      <div className="flex gap-6 max-w-6xl">
        <div className="w-1/3 bg-white border rounded-lg shadow-sm h-[80vh] overflow-y-auto">
          <div className="p-4 border-b bg-gray-50 font-bold">Clients</div>
          <ul>
            {customers.map(c => (
              <li key={c.id} onClick={() => loadClientTax(c)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedClient?.id === c.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                <p className="font-semibold text-sm">{c.name}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-2/3 space-y-4">
          {selectedClient ? (
            <>
              <div className="bg-white p-4 rounded-lg shadow-sm border font-bold text-lg">{selectedClient.name}'s Personal Tax Workspace</div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
                <h3 className="font-bold mb-2 text-blue-900">2026 Tax Profile</h3>
                {!taxProfile ? <p className="text-sm">Not filled out yet.</p> : (
                  <div className="text-sm space-y-2">
                    <p><strong>Status:</strong> {taxProfile.filingStatus}</p>
                    <p><strong>Dependents:</strong> {taxProfile.dependents}</p>
                    <p><strong>Income:</strong> ${taxProfile.income}</p>
                  </div>
                )}
              </div>
            </>
          ) : <div className="text-gray-500">Select a client</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
