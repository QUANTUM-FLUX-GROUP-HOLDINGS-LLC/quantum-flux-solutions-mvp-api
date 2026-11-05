import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const [bureau, setBureau] = useState('Equifax');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    
    const u = localStorage.getItem('user');
    if (u) {
      const parsedUser = JSON.parse(u);
      setUser(parsedUser);
      if (parsedUser.role === 'CLIENT') {
        router.push('/dashboard'); // Cliente no puede estar aquí
        return;
      }
    }
    fetchCustomers();
  }, [token]);

  async function fetchCustomers() {
    try {
      const res = await fetch(`${API_URL}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCustomers(await res.json());
    } catch (err) { console.error(err); }
  }

  async function loadClientWorkspace(client: any) {
    setSelectedClient(client);
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
    } catch (err) { console.error(err); }
  }

  async function downloadDocument(docId: string) {
    try {
      const res = await fetch(`${API_URL}/admin/documents/${docId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to get download link');
      const data = await res.json();
      
      const link = document.createElement('a');
      link.href = data.url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) { alert(err.message); }
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
      alert("Dispute created successfully!");
      setAccountName(""); setAccountNumber("");
      loadClientWorkspace(selectedClient);
    } catch (err: any) { alert(err.message); }
  }

  const canManageDisputes = user?.role === 'ADMIN' || user?.role === 'CREDIT_REPAIR';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold text-red-500">Quantum Flux CRM</div>
        <div className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase">Logged in as: {user?.role}</div>
        
        <nav className="flex-1 px-4 space-y-2">
          <div className="bg-gray-800 px-4 py-2 rounded-md font-medium text-sm">Client Operations</div>
          <div className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">All Clients</div>
          
          {canManageDisputes && (
            <div className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Credit Disputes</div>
          )}
          
          {(user?.role === 'ADMIN' || user?.role === 'TAX_PERSONAL' || user?.role === 'TAX_BUSINESS') && (
            <div className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Tax Prep</div>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-sm text-gray-400 hover:text-white">Sign Out</button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-1/3 border-r bg-white h-screen overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold">Active Clients</h2>
            <input type="text" placeholder="Search clients..." className="mt-2 w-full border rounded p-2 text-sm" />
          </div>
          <ul>
            {customers.map((c) => (
              <li 
                key={c.id} 
                onClick={() => loadClientWorkspace(c)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedClient?.id === c.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
              >
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
              <div className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">{selectedClient.name}'s Workspace</h1>
                  <p className="text-sm text-gray-500">Client Status: {selectedClient.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="font-bold mb-4 text-gray-800">Verification Documents</h3>
                  {documents.length === 0 ? <p className="text-sm text-gray-500">No docs uploaded.</p> : (
                    <ul className="space-y-2">
                      {documents.map(d => (
                        <li key={d.id} className="flex justify-between items-center text-sm border p-2 rounded">
                          <span className="truncate w-40">{d.fileName}</span>
                          <button onClick={() => downloadDocument(d.id)} className="text-blue-600 hover:underline">Download</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {canManageDisputes ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold mb-4 text-gray-800">Add Dispute (Internal)</h3>
                    <form onSubmit={handleCreateDispute} className="space-y-3">
                      <select value={bureau} onChange={e => setBureau(e.target.value)} className="w-full border p-2 rounded text-sm">
                        <option>Equifax</option><option>Experian</option><option>TransUnion</option>
                      </select>
                      <input type="text" placeholder="Account Name" value={accountName} onChange={e => setAccountName(e.target.value)} className="w-full border p-2 rounded text-sm" required />
                      <input type="text" placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full border p-2 rounded text-sm" />
                      <button type="submit" className="w-full bg-black text-white p-2 rounded text-sm">Create Dispute Record</button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-lg border border-dashed text-center flex items-center justify-center text-gray-400 text-sm">
                    You don't have permission to manage credit disputes.
                  </div>
                )}
              </div>

              {canManageDisputes && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="font-bold mb-4 text-gray-800">Active Disputes</h3>
                  {disputes.length === 0 ? <p className="text-sm text-gray-500">No disputes created yet.</p> : (
                    <ul className="space-y-2">
                      {disputes.map(d => (
                        <li key={d.id} className="flex justify-between items-center text-sm border p-2 rounded">
                          <span>{d.bureau} - {d.accountName}</span>
                          <span className="font-bold text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{d.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
