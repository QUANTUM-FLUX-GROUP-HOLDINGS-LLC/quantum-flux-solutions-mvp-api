import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';

export default function TaxBusinessModule() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [taxProfile, setTaxProfile] = useState<any>(null);
  
  const [entityType, setEntityType] = useState('S-CORP');
  const [ein, setEin] = useState('');
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [hasEmployees, setHasEmployees] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetch(`${API_URL}/admin/customers`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => res.json()).then(data => setCustomers(data));
  }, []);

  async function loadClientTax(client: any) {
    setSelectedClient(client);
    const res = await fetch(`${API_URL}/tax-business/customers/${client.id}`, { headers: { Authorization: `Bearer ${token}` }});
    if (res.ok) {
      const data = await res.json();
      if (data) {
        setTaxProfile(data);
        setEntityType(data.entityType || 'S-CORP');
        setEin(data.ein || '');
        setGrossRevenue(data.grossRevenue || 0);
        setHasEmployees(data.hasEmployees || false);
      } else {
        setTaxProfile(null);
        setEntityType('S-CORP'); setEin(''); setGrossRevenue(0); setHasEmployees(false);
      }
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;
    
    const res = await fetch(`${API_URL}/tax-business/customers/${selectedClient.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ entityType, ein, grossRevenue, hasEmployees }),
    });
    
    if (res.ok) {
      alert("Business Profile Saved!");
      setTaxProfile({ entityType, ein, grossRevenue, hasEmployees });
    } else {
      const errorData = await res.json();
      // Muestra el error exacto que rebota desde el backend
      alert(`Error: ${Array.isArray(errorData.message) ? errorData.message[0] : errorData.message}`);
    }
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
              
              <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-600">
                <h3 className="font-bold text-xl mb-4 text-indigo-900 border-b pb-2">Business Tax Profile (Form 1120-S)</h3>
                
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-indigo-500 uppercase mb-1">Entity Type</label>
                    <select value={entityType} onChange={e => setEntityType(e.target.value)} className="w-full border p-2 rounded text-sm bg-indigo-50 border-indigo-200 text-gray-800 font-semibold">
                      <option value="S-CORP">S-Corporation (1120-S)</option>
                      <option value="C-CORP">C-Corporation (1120)</option>
                      <option value="LLC">LLC (Partnership)</option>
                      <option value="SOLE_PROP">Sole Proprietor (Schedule C)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-500 uppercase mb-1">EIN (Tax ID)</label>
                    <input 
                      type="text" 
                      value={ein} 
                      onChange={(e) => {
                        // VALIDACIÓN EN TIEMPO REAL (A prueba de fallos)
                        let val = e.target.value.replace(/\D/g, ''); // Quita todo lo que no sea número
                        val = val.substring(0, 9); // Corta a 9 números máximo
                        if (val.length > 2) {
                          val = val.substring(0, 2) + '-' + val.substring(2);
                        }
                        setEin(val);
                      }} 
                      placeholder="XX-XXXXXXX" 
                      maxLength={10}
                      className="w-full border p-2 rounded text-sm bg-indigo-50 border-indigo-200 text-gray-800 font-semibold" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: 12-3456789</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-500 uppercase mb-1">Gross Revenue ($)</label>
                    <input type="number" value={grossRevenue} onChange={e => setGrossRevenue(Number(e.target.value))} className="w-full border p-2 rounded text-sm bg-indigo-50 border-indigo-200 text-gray-800 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-500 uppercase mb-1">Has Employees?</label>
                    <select value={hasEmployees ? 'YES' : 'NO'} onChange={e => setHasEmployees(e.target.value === 'YES')} className="w-full border p-2 rounded text-sm bg-indigo-50 border-indigo-200 text-gray-800 font-semibold">
                      <option value="NO">No (Single Member)</option>
                      <option value="YES">Yes (W-2s required)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded border mb-4">
                  <p className="font-bold text-gray-700 mb-2 text-sm uppercase">Required Corporate Documents:</p>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1 text-sm">
                    <li>Profit & Loss Statement (P&L)</li>
                    <li>Balance Sheet</li>
                    {hasEmployees && <li className="text-indigo-700 font-semibold">Payroll Summary (W-3 / 941s)</li>}
                  </ul>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 transition">
                  Save Business Profile
                </button>
              </form>
            </>
          ) : <div className="text-gray-500 font-medium p-10 text-center border-2 border-dashed rounded-lg bg-gray-50">Select a corporate client from the dark blue list on the left.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
