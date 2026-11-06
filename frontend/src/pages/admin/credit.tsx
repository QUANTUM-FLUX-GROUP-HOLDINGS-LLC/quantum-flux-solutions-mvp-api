import { useEffect, useState } from 'react';
import { AdminLayout } from '../../../modules/shared/AdminLayout';

export default function CreditModule() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [bureau, setBureau] = useState('Equifax');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const res = await fetch(`${API_URL}/admin/customers`, { headers: { Authorization: `Bearer ${token}` }});
    if (res.ok) setCustomers(await res.json());
  }

  async function loadClientWorkspace(client: any) {
    setSelectedClient(client);
    const docRes = await fetch(`${API_URL}/admin/customers/${client.id}/documents`, { headers: { Authorization: `Bearer ${token}` }});
    if (docRes.ok) setDocuments(await docRes.json());

    const dispRes = await fetch(`${API_URL}/credit/customers/${client.id}/disputes`, { headers: { Authorization: `Bearer ${token}` }});
    if (dispRes.ok) setDisputes(await dispRes.json());
  }

  async function handleCreateDispute(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;
    const res = await fetch(`${API_URL}/credit/customers/${selectedClient.id}/disputes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ bureau, accountName, accountNumber }),
    });
    if (res.ok) { alert("Dispute created!"); setAccountName(""); loadClientWorkspace(selectedClient); }
  }

  async function approveDispute(id: string) {
    const res = await fetch(`${API_URL}/credit/disputes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'SENT' }),
    });
    if (res.ok) { alert("Approved!"); loadClientWorkspace(selectedClient); }
  }

  return (
    <AdminLayout>
      <div className="flex gap-6 max-w-6xl">
        <div className="w-1/3 bg-white border rounded-lg shadow-sm h-[80vh] overflow-y-auto">
          <div className="p-4 border-b bg-gray-50 font-bold">Clients</div>
          <ul>
            {customers.map(c => (
              <li key={c.id} onClick={() => loadClientWorkspace(c)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedClient?.id === c.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-gray-500">{c.email}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-2/3 space-y-4">
          {selectedClient ? (
            <>
              <div className="bg-white p-4 rounded-lg shadow-sm border font-bold text-lg">{selectedClient.name}'s Credit Workspace</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="font-bold mb-2">Docs</h3>
                  {documents.map(d => <div key={d.id} className="text-sm border p-1 rounded mb-1">{d.fileName}</div>)}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
                  <h3 className="font-bold mb-2 text-yellow-900">Create Dispute</h3>
                  <form onSubmit={handleCreateDispute} className="space-y-2">
                    <select value={bureau} onChange={e => setBureau(e.target.value)} className="w-full border p-1 rounded text-sm"><option>Equifax</option><option>Experian</option><option>TransUnion</option></select>
                    <input type="text" placeholder="Account Name" value={accountName} onChange={e => setAccountName(e.target.value)} className="w-full border p-1 rounded text-sm" required />
                    <button type="submit" className="bg-black text-white px-3 py-1 rounded text-sm w-full">Add</button>
                  </form>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-bold mb-2">Disputes</h3>
                {disputes.map(d => (
                  <div key={d.id} className="flex justify-between items-center border p-2 rounded mb-1 text-sm bg-yellow-50">
                    <span>{d.bureau} - {d.accountName} ({d.status})</span>
                    {d.status === 'PENDING' && <button onClick={() => approveDispute(d.id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>}
                  </div>
                ))}
              </div>
            </>
          ) : <div className="text-gray-500">Select a client</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
