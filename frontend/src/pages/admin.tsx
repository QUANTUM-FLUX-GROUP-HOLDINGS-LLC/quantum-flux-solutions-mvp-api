import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();
  // Definimos pestañas estrictas
  const [activeTab, setActiveTab] = useState<string>('');
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
      
      // SEGURIDAD DE RUTA: Si es un cliente, no entra aquí.
      if (parsedUser.role === 'CLIENT' || !parsedUser.role) {
        router.push('/dashboard');
        return;
      }
      
      // REDIRECCIÓN INICIAL SEGÚN ROL
      // Admin ve el Dashboard General. Los demás ven su lista de clientes por defecto.
      if (parsedUser.role === 'ADMIN') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('clients');
      }
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
      fetchData();
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

  const isAdmin = user?.role === 'ADMIN';
  const isCredit = user?.role === 'CREDIT_REPAIR';
  const isTax = user?.role === 'TAX_PERSONAL' || user?.role === 'TAX_BUSINESS';
  const isBookkeeping = user?.role === 'BOOKKEEPING';

  if (!user || !activeTab) return <div className="p-10">Cargando sistema...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR DINÁMICO */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold text-red-500">Quantum Flux CRM</div>
        <div className="px-4 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
          Role: <span className="text-white">{user?.role}</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {/* Solo el Admin ve el Dashboard general */}
          {isAdmin && (
            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm ${activeTab === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>Dashboard General</button>
          )}
          
          {/* Todos ven la lista de clientes, pero con títulos distintos */}
          <button onClick={() => { setActiveTab('clients'); setSelectedClient(null); }} className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm ${activeTab === 'clients' || activeTab === 'client_detail' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
            {isAdmin ? 'All Clients' : isCredit ? 'My Credit Clients' : isTax ? 'My Tax Clients' : 'My Bookkeeping Clients'}
          </button>

          {/* Módulos específicos (Visuales por ahora, bloqueados a nivel de backend) */}
          {isCredit && <div className="px-4 py-2 mt-4 text-xs font-bold text-yellow-500 uppercase">Credit Module</div>}
          {isTax && <div className="px-4 py-2 mt-4 text-xs font-bold text-blue-500 uppercase">Tax Module</div>}
          {isBookkeeping && <div className="px-4 py-2 mt-4 text-xs font-bold text-green-500 uppercase">Bookkeeping Module</div>}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { localStorage.clear(); router.push('/staff-login'); }} className="text-sm text-gray-400 hover:text-white">Sign Out</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* VISTA 1: DASHBOARD GENERAL (SOLO ADMIN) */}
        {activeTab === 'dashboard' && isAdmin && (
          <div className="p-10 w-full max-w-5xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Command Center</h1>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                <p className="text-sm text-gray-500 font-medium">Total Clients</p>
                <p className="text-4xl font-bold text-gray-800">{metrics?.totalClients || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
                <p className="text-sm text-gray-500 font-medium">Pending Disputes</p>
                <p className="text-4xl font-bold text-gray-800">{metrics?.activeDisputes || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
                <p className="text-sm text-gray-500 font-medium">Documents Stored</p>
                <p className="text-4xl font-bold text-gray-800">{metrics?.totalDocs || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: LISTA DE CLIENTES */}
        {activeTab === 'clients' && (
          <div className="w-full p-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Client Directory</h1>
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
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
                        <button onClick={() => loadClientWorkspace(c)} className="text-blue-600 hover:underline">Open Workspace</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA 3: DETALLE DEL CLIENTE (WORKSPACE) */}
        {activeTab === 'client_detail' && selectedClient && (
          <div className="w-full flex">
            {/* Botón para volver a la lista */}
            <div className="w-64 border-r bg-gray-100 p-4">
               <button onClick={() => setActiveTab('clients')} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-2">
                 &larr; Back to Client List
               </button>
               <div className="mt-8">
                  <h3 className="font-bold text-gray-800 text-lg">{selectedClient.name}</h3>
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
               </div>
            </div>

            {/* Contenido del Workspace */}
            <div className="flex-1 p-8 h-screen overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="font-bold mb-4 text-gray-800">Documents</h3>
                  {documents.length === 0 ? <p className="text-sm text-gray-500">No docs.</p> : (
                    <ul className="space-y-2">
                      {documents.map(d => (
                        <li key={d.id} className="text-sm border p-2 rounded">{d.fileName}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {isTax || isAdmin ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold mb-4 text-gray-800">Tax Profile</h3>
                    {!taxProfile ? <p className="text-sm text-gray-500">Not filled.</p> : (
                      <div className="text-sm space-y-2">
                        <p><strong>Status:</strong> {taxProfile.filingStatus}</p>
                        <p><strong>Income:</strong> ${taxProfile.income}</p>
                      </div>
                    )}
                  </div>
                ) : null}

                {isBookkeeping || isAdmin ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-dashed text-center">
                    <h3 className="font-bold mb-2 text-gray-800">Bookkeeping</h3>
                    <p className="text-sm text-gray-500">No statements uploaded.</p>
                  </div>
                ) : null}
              </div>

              {/* Disputas de Crédito */}
              {(isCredit || isAdmin) && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="font-bold mb-4 text-gray-800">Credit Disputes</h3>
                  <form onSubmit={handleCreateDispute} className="flex gap-2 mb-4">
                    <select value={bureau} onChange={e => setBureau(e.target.value)} className="border p-2 rounded text-sm w-1/4">
                      <option>Equifax</option><option>Experian</option><option>TransUnion</option> 
                    </select>
                    <input type="text" placeholder="Account Name" value={accountName} onChange={e => setAccountName(e.target.value)} className="border p-2 rounded text-sm w-1/2" required />
                    <button type="submit" className="bg-black text-white px-4 rounded text-sm">Add</button>
                  </form>
                  
                  <ul className="space-y-2">
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
          </div>
        )}
      </div>
    </div>
  );
}
