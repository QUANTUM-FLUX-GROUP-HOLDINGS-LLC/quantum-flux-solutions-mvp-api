import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();
  
  // Módulos: 'GENERAL' | 'CREDIT' | 'TAX_PERSONAL' | 'TAX_BUSINESS' | 'BOOKKEEPING'
  const [activeModule, setActiveModule] = useState<string>('GENERAL'); 
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'client_detail'>('dashboard');
  
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

      // Redirección inicial basada en el rol
      if (parsedUser.role === 'CREDIT_REPAIR') setActiveModule('CREDIT');
      else if (parsedUser.role === 'TAX_PERSONAL') setActiveModule('TAX_PERSONAL');
      else if (parsedUser.role === 'TAX_BUSINESS') setActiveModule('TAX_BUSINESS');
      else if (parsedUser.role === 'BOOKKEEPING') setActiveModule('BOOKKEEPING');
      
      if (parsedUser.role !== 'ADMIN') setActiveTab('clients');
    }
    fetchData();
  }, [token]);

  async function fetchData() {
    try {
      const metRes = await fetch(`${API_URL}/admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (metRes.ok) setMetrics(await metRes.json());

      const custRes = await fetch(`${API_URL}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (custRes.ok) setCustomers(await custRes.json());
    } catch (err) { console.error(err); }
  }

  async function loadClientWorkspace(client: any) {
    setSelectedClient(client);
    setActiveTab('client_detail');
    
    setTaxProfile(null);
    setDisputes([]);
    setDocuments([]);
    
    try {
      const docRes = await fetch(`${API_URL}/admin/customers/${client.id}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (docRes.ok) setDocuments(await docRes.json());

      if (activeModule === 'CREDIT' || (activeModule === 'GENERAL' && user?.role === 'ADMIN')) {
        const dispRes = await fetch(`${API_URL}/admin/disputes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (dispRes.ok) {
          const allDisputes = await dispRes.json();
          setDisputes(allDisputes.filter((d: any) => d.customerId === client.id));
        }
      }

      // Cargar Taxes SOLO si estamos en el módulo correspondiente
      if (activeModule.includes('TAX') || (activeModule === 'GENERAL' && user?.role === 'ADMIN')) {
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

  const switchModule = (module: string) => {
    setActiveModule(module);
    setActiveTab('clients');
    setSelectedClient(null);
  };

  // Lógica estricta de visibilidad de menús
  const isAdmin = user?.role === 'ADMIN';
  const isCredit = user?.role === 'CREDIT_REPAIR';
  const isTaxPersonal = user?.role === 'TAX_PERSONAL';
  const isTaxBusiness = user?.role === 'TAX_BUSINESS';
  const isBookkeeping = user?.role === 'BOOKKEEPING';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR CON MÓDULOS SEPARADOS */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold text-red-500">Quantum Flux CRM</div>
        <div className="px-4 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
          Logged: <span className="text-white">{user?.role}</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          
          {isAdmin && (
            <button onClick={() => switchModule('GENERAL')} className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm ${activeModule === 'GENERAL' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
              General Dashboard
            </button>
          )}

          <div className="pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wide px-4">Modules</div>

          {(isAdmin || isCredit) && (
            <button onClick={() => switchModule('CREDIT')} className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm ${activeModule === 'CREDIT' ? 'bg-[#0f4c81] text-white' : 'text-gray-400 hover:text-white'}`}>
              Credit Repair
            </button>
          )}

          {/* MÓDULO TAX PERSONAL */}
          {(isAdmin || isTaxPersonal) && (
            <button onClick={() => switchModule('TAX_PERSONAL')} className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm ${activeModule === 'TAX_PERSONAL' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              Personal Tax Prep
            </button>
          )}

          {/* MÓDULO TAX BUSINESS */}
          {(isAdmin || isTaxBusiness) && (
            <button onClick={() => switchModule('TAX_BUSINESS')} className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm ${activeModule === 'TAX_BUSINESS' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              Business Tax Prep
            </button>
          )}

          {(isAdmin || isBookkeeping) && (
            <button onClick={() => switchModule('BOOKKEEPING')} className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm ${activeModule === 'BOOKKEEPING' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              Bookkeeping
            </button>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { localStorage.clear(); router.push('/staff-login'); }} className="text-sm text-gray-400 hover:text-white">Sign Out</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* BARRA SUPERIOR DEL MÓDULO */}
        <div className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-800">
              {activeModule === 'GENERAL' ? 'General Overview' : 
               activeModule === 'CREDIT' ? 'Credit Repair Module' : 
               activeModule === 'TAX_PERSONAL' ? 'Personal Tax Module' : 
               activeModule === 'TAX_BUSINESS' ? 'Business Tax Module' : 'Bookkeeping Module'}
            </span>
            {activeTab === 'client_detail' && selectedClient && (
              <span className="text-gray-400 text-sm">/ {selectedClient.name}</span>
            )}
          </div>
          {activeTab === 'client_detail' && (
             <button onClick={() => { setActiveTab('clients'); setSelectedClient(null); }} className="text-sm text-blue-600 font-medium hover:underline">
               &larr; Back to Client List
             </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          
          {/* DASHBOARD GENERAL */}
          {activeTab === 'dashboard' && activeModule === 'GENERAL' && (
            <div className="p-10 max-w-5xl">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-gray-800">
                  <p className="text-sm text-gray-500 font-medium">Total Clients</p>
                  <p className="text-4xl font-bold text-gray-800">{metrics?.totalClients || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-yellow-500">
                  <p className="text-sm text-gray-500 font-medium">Pending Disputes</p>
                  <p className="text-4xl font-bold text-gray-800">{metrics?.activeDisputes || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500">
                  <p className="text-sm text-gray-500 font-medium">Documents Stored</p>
                  <p className="text-4xl font-bold text-gray-800">{metrics?.totalDocs || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* LISTA DE CLIENTES */}
          {activeTab === 'clients' && (
            <div className="p-8">
              <div className="bg-white rounded-lg shadow border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button onClick={() => loadClientWorkspace(c)} className="text-blue-600 hover:underline">Open {activeModule} Workspace</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WORKSPACE DEL CLIENTE */}
          {activeTab === 'client_detail' && selectedClient && (
            <div className="p-8 space-y-6 max-w-5xl">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="font-bold mb-4 text-gray-800">Client Documents</h3>
                  {documents.length === 0 ? <p className="text-sm text-gray-500">No docs uploaded.</p> : (
                    <ul className="space-y-2">
                      {documents.map(d => (
                        <li key={d.id} className="text-sm border p-2 rounded">{d.fileName}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* VISTA DE TAX (Se adapta si es Personal o Business) */}
                {(activeModule === 'TAX_PERSONAL' || activeModule === 'TAX_BUSINESS' || activeModule === 'GENERAL') && (
                  <div className={`bg-white p-6 rounded-lg shadow-sm border ${activeModule === 'TAX_BUSINESS' ? 'border-indigo-200 bg-indigo-50/30' : 'border-blue-200 bg-blue-50/30'}`}>
                    <h3 className={`font-bold mb-4 ${activeModule === 'TAX_BUSINESS' ? 'text-indigo-900' : 'text-blue-900'}`}>
                      {activeModule === 'TAX_BUSINESS' ? 'Business Tax Data' : activeModule === 'TAX_PERSONAL' ? 'Personal Tax Data' : 'Tax Profile Data'}
                    </h3>
                    {!taxProfile ? <p className="text-sm text-gray-500">Client has not filled out tax info yet.</p> : (
                      <div className="text-sm space-y-2">
                        <p><strong>Filing Status:</strong> {taxProfile.filingStatus}</p>
                        <p><strong>Dependents:</strong> {taxProfile.dependents}</p>
                        <p><strong>Annual Income:</strong> ${taxProfile.income}</p>
                      </div>
                    )}
                  </div>
                )}

                {(activeModule === 'BOOKKEEPING' || activeModule === 'GENERAL') && (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200 bg-green-50/30">
                    <h3 className="font-bold mb-2 text-green-900">Bookkeeping Files</h3>
                    <p className="text-sm text-gray-500">No bank statements uploaded for this client.</p>
                  </div>
                )}
              </div>

              {/* DISPUTAS DE CRÉDITO */}
              {(activeModule === 'CREDIT' || activeModule === 'GENERAL') && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50/30">
                  <h3 className="font-bold mb-4 text-yellow-900">Credit Disputes</h3>
                  <form onSubmit={handleCreateDispute} className="flex gap-2 mb-4">
                    <select value={bureau} onChange={e => setBureau(e.target.value)} className="border p-2 rounded text-sm w-1/4">
                      <option>Equifax</option><option>Experian</option><option>TransUnion</option> 
                    </select>
                    <input type="text" placeholder="Account Name" value={accountName} onChange={e => setAccountName(e.target.value)} className="border p-2 rounded text-sm w-1/2" required />
                    <button type="submit" className="bg-black text-white px-4 rounded text-sm">Add</button>
                  </form>
                  
                  <ul className="space-y-2">
                    {disputes.map(d => (
                      <li key={d.id} className="flex justify-between items-center text-sm border p-2 rounded bg-white">
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
      </div>
    </div>
  );
}
