import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients'>('dashboard');
  const [metrics, setMetrics] = useState<any>(null);
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [taxProfile, setTaxProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  const [bureau, setBureau] = useState('Equifax');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { router.push('/staff-login'); return; }
    
    const u = localStorage.getItem('user');
    if (u) {
      const parsedUser = JSON.parse(u);
      setUser(parsedUser);
      if (parsedUser.role === 'CLIENT' || !parsedUser.role) {
        router.push('/dashboard');
        return;
      }
    }
    fetchData();
  }, [token]);

  async function fetchData() {
    try {
      // A: Cargar métricas
      const metRes = await fetch(`${API_URL}/admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (metRes.ok) setMetrics(await metRes.json());

      // Cargar lista de clientes
      const custRes = await fetch(`${API_URL}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (custRes.ok) setCustomers(await custRes.json());
    } catch (err) { console.error(err); }
  }

  async function loadClientWorkspace(client: any) {
    setSelectedClient(client);
    setActiveTab('clients');
    setTaxProfile(null);
    try {
      const docRes = await fetch(`${API_URL}/admin/customers/${client.id}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (docRes.ok) setDocuments(await docRes.json());

      if (user?.role === 'ADMIN' || user?.role === 'CREDIT_REPAIR') {
        const dispRes = await fetch(`${API_URL}/admin/disputes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (dispRes.ok) {
          const allDisputes = await dispRes.json();
          setDisputes(allDisputes.filter((d: any) => d.customerId === client.id));
        }
      }

      if (user?.role === 'ADMIN' || user?.role === 'TAX_PERSONAL' || user?.role === 'TAX_BUSINESS') {
        const taxRes = await fetch(`${API_URL}/admin/customers/${client.id}/tax`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (taxRes.ok) {
          const taxData = await taxRes.json();
          if (taxData) setTaxProfile(taxData);
        }
      }
    } catch (err) { console.error(err); }
  }

  async function handleCreateDispute(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      const res = await fetch(`${API_URL}/admin/customers/${selectedClient.id}/disputes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bureau, accountName, accountNumber }),
      });
      if (!res.ok) throw new Error("Failed to create dispute");
      alert("Dispute created!");
      setAccountName(""); setAccountNumber("");
      loadClientWorkspace(selectedClient);
      fetchData(); // Actualizar métricas
    } catch (err: any) { alert(err.message); }
  }

  async function approveDispute(disputeId: string) {
    try {
      const res = await fetch(`${API_URL}/admin/disputes/${disputeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'SENT' }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      alert("Approved! Email sent to client.");
      loadClientWorkspace(selectedClient);
    } catch (err: any) { alert(err.message); }
  }

  const canManageDisputes = user?.role === 'ADMIN' || user?.role === 'CREDIT_REPAIR';
  const canManageTax = user?.role === 'ADMIN' || user?.role === 'TAX_PERSONAL' || user?.role === 'TAX_BUSINESS';
  const canManageBookkeeping = user?.role === 'ADMIN' || user?.role === 'BOOKKEEPING';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold text-red-500">Quantum Flux CRM</div>
        <div className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase">Role: {user?.role}</div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm ${activeTab === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>Dashboard</button>
          <button onClick={() => { setActiveTab('clients'); setSelectedClient(null); }} className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm ${activeTab === 'clients' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>Client Operations</button>
          
          {canManageDisputes && <div className="px-4 py-2 text-sm text-gray-500 cursor-not-allowed">Credit Disputes (Select Client)</div>}
          {canManageTax && <div className="px-4 py-2 text-sm text-gray-500 cursor-not-allowed">Tax Prep (Select Client)</div>}
          {canManageBookkeeping && <div className="px-4 py-2 text-sm text-gray-500 cursor-not-allowed">Bookkeeping (Select Client)</div>}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { localStorage.clear(); router.push('/staff-login'); }} className="text-sm text-gray-400 hover:text-white">Sign Out</button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* OPCIÓN A: DASHBOARD DE MÉTRICAS */}
        {activeTab === 'dashboard' && (
          <div className="p-10 w-full max-w-5xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Command Center</h1>
            {!metrics ? <p>Loading metrics...</p> : (
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                  <p className="text-sm text-gray-500 font-medium">Total Clients</p>
                  <p className="text-4xl font-bold text-gray-800">{metrics.totalClients}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
                  <p className="text-sm text-gray-500 font-medium">Pending Disputes</p>
                  <p className="text-4xl font-bold text-gray-800">{metrics.activeDisputes}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
                  <p className="text-sm text-gray-500 font-medium">Documents Stored</p>
                  <p className="text-4xl font-bold text-gray-800">{metrics.totalDocs}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VISTA DE CLIENTES Y WORKSPACE */}
        {activeTab === 'clients' && (
          <>
            <div className="w-1/3 border-r bg-white h-screen overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold">Active Clients</h2>
              </div>
              <ul>
                {customers.map((c) => (
                  <li key={c.id} onClick={() => loadClientWorkspace(c)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedClient?.id === c.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-2/3 p-8 bg-gray-50 h-screen overflow-y-auto">
              {!selectedClient ? (
                <div className="text-center text-gray-500 mt-20">Select a client to open their workspace.</div>
              ) : (
                <div className="space-y-6 max-w-4xl">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h1 className="text-2xl font-bold">{selectedClient.name}'s Workspace</h1>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="font-bold mb-4 text-gray-800">Verification Documents</h3>
                      {documents.length === 0 ? <p className="text-sm text-gray-500">No docs.</p> : (
                        <ul className="space-y-2">
                          {documents.map(d => (
                            <li key={d.id} className="text-sm border p-2 rounded">{d.fileName}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* OPCIÓN C: TARJETA DE BOOKKEEPING */}
                    {canManageBookkeeping && (
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                        <h3 className="font-bold mb-2 text-gray-800">Bookkeeping Module</h3>
                        <p className="text-sm text-gray-500 mb-4">No bank statements uploaded for this client.</p>
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium">Request Statements</button>
                      </div>
                    )}

                    {/* TARJETA DE TAXES */}
                    {canManageTax && (
                      <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="font-bold mb-4 text-gray-800">Tax Profile</h3>
                        {!taxProfile ? <p className="text-sm text-gray-500">Not filled.</p> : (
                          <div className="text-sm space-y-2">
                            <p><strong>Status:</strong> {taxProfile.filingStatus}</p>
                            <p><strong>Income:</strong> ${taxProfile.income}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* DISPUTAS (Solo Admin y Crédito) */}
                  {canManageDisputes && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="font-bold mb-4 text-gray-800">Add Dispute</h3>
                      <form onSubmit={handleCreateDispute} className="flex gap-2">
                        <select value={bureau} onChange={e => setBureau(e.target.value)} className="border p-2 rounded text-sm w-1/4">
                          <option>Equifax</option><option>Experian</option><option>TransUnion</option>
                        </select>
                        <input type="text" placeholder="Account Name" value={accountName} onChange={e => setAccountName(e.target.value)} className="border p-2 rounded text-sm w-1/2" required />
                        <button type="submit" className="bg-black text-white px-4 rounded text-sm">Add</button>
                      </form>
                      
                      <ul className="mt-4 space-y-2">
                        {disputes.map(d => (
                          <li key={d.id} className="flex justify-between items-center text-sm border p-2 rounded">
                            <span>{d.bureau} - {d.accountName}</span>
                            <div className="flex gap-2 items-center">
                              <span className="text-xs bg-yellow-100 px-2 py-1 rounded">{d.status}</span>
                              {d.status === 'PENDING' && <button onClick={() => approveDispute(d.id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
