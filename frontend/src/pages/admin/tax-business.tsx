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
        <div className="w-1/3 bg-indigo-900 text-white rounded-lg shadow-md h-[80vh] overflow-y-auto">
          <div className="p-4 border-b border-indigo-700 bg-indigo-950 font-bold text-lg">Corporate Clients</div>
          <ul>
            {customers.map(c => (
              <li key={c.id} onClick={() => loadClientTax(c)} className={`p-4 border-b border-indigo-800 cursor-pointer hover:bg-indigo-800 ${selectedClient?.id === c.id ? 'bg-indigo-700 border-l-4 border-yellow-400' : ''}`}>
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-indigo-300">{c.email}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-2/3 space-y-4">
          {selectedClient ? (
            <>
              <div className="bg-indigo-600 text-white p-4 rounded-lg shadow-md font-bold text-xl">
                🏢 {selectedClient.name}'s Corporate Workspace
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-600">
                <h3 className="font-bold text-xl mb-4 text-indigo-900 border-b pb-2">Business Tax Profile (Form 1120-S)</h3>
                
                {!taxProfile ? <p className="text-sm text-gray-500">Client has not provided business details yet.</p> : (
                  <div className="text-sm space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                        <p className="text-indigo-500 text-xs uppercase font-bold mb-1">Entity Type</p>
                        <p className="font-bold text-gray-800 text-lg">S-Corporation</p>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                        <p className="text-indigo-500 text-xs uppercase font-bold mb-1">EIN (Tax ID)</p>
                        <p className="font-bold text-gray-800 text-lg">XX-XXX9921</p>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                        <p className="text-indigo-500 text-xs uppercase font-bold mb-1">Gross Revenue</p>
                        <p className="font-bold text-gray-800 text-lg">${taxProfile.income.toLocaleString()}</p>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                        <p className="text-indigo-500 text-xs uppercase font-bold mb-1">Employees</p>
                        <p className="font-bold text-gray-800 text-lg">{taxProfile.dependents > 0 ? 'Yes (W-2s required)' : 'No'}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded border">
                      <p className="font-bold text-gray-700 mb-2 text-sm uppercase">Required Corporate Documents:</p>
                      <ul className="list-disc pl-5 text-gray-600 space-y-1">
                        <li>Profit & Loss Statement (P&L)</li>
                        <li>Balance Sheet</li>
                        <li>Payroll Summary (W-3 / 941s)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : <div className="text-gray-500 font-medium p-10 text-center border-2 border-dashed rounded-lg bg-gray-50">Select a corporate client from the dark blue list on the left.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
