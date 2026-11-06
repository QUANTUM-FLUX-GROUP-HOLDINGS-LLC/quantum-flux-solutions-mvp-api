import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';

export default function TaxBusinessModule() {
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
          <div className="p-4 border-b bg-gray-50 font-bold">Business Clients</div>
          <ul>
            {customers.map(c => (
              <li key={c.id} onClick={() => loadClientTax(c)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedClient?.id === c.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}>
                <p className="font-semibold text-sm">{c.name}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-2/3 space-y-4">
          {selectedClient ? (
            <>
              <div className="bg-white p-4 rounded-lg shadow-sm border font-bold text-lg">{selectedClient.name}'s Business Tax Workspace</div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-200 bg-indigo-50">
                <h3 className="font-bold mb-2 text-indigo-900">2026 Corporate Tax Profile</h3>
                
                {!taxProfile ? <p className="text-sm">Not filled out yet.</p> : (
                  <div className="text-sm space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-bold">Entity Type</p>
                        <p className="font-medium">S-Corporation (Form 1120-S)</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-bold">EIN (Tax ID)</p>
                        <p className="font-medium">XX-XXXXXXX</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-bold">Gross Revenue</p>
                        <p className="font-medium">${taxProfile.income.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-bold">Employees</p>
                        <p className="font-medium">{taxProfile.dependents > 0 ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border text-xs text-gray-600 mt-4">
                      <p className="font-bold mb-1">Required Documents for Business:</p>
                      <ul className="list-disc pl-5">
                        <li>Profit & Loss Statement (P&L)</li>
                        <li>Balance Sheet</li>
                        <li>Payroll Summary (W-3 / 941s)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : <div className="text-gray-500">Select a business client</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
