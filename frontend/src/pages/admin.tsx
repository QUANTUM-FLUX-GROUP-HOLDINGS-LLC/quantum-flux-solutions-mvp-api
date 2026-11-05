import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchCustomers();
  }, [token]);

  async function fetchCustomers() {
    try {
      const res = await fetch(`${API_URL}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch customers (Are you an admin?)');
      const data = await res.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDocuments(customerId: string) {
    try {
      const res = await fetch(`${API_URL}/admin/customers/${customerId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data);
      setSelectedCustomer(customerId);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function downloadDocument(docId: string) {
    setDownloading(docId);
    try {
      const res = await fetch(`${API_URL}/admin/documents/${docId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to get download link');
      const data = await res.json();
      
      // SOLUCIÓN: Crear un enlace invisible y simular clic para evitar bloqueo de popups
      const link = document.createElement('a');
      link.href = data.url;
      link.target = '_blank';
      link.download = data.fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDownloading(null);
    }
  }

  if (loading) return <div className="p-10">Loading admin panel...</div>;
  if (error) return <div className="p-10 text-red-600">Error: {error}</div>;

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Panel de Clientes */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Customers</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((c) => (
                  <tr key={c.id} className={selectedCustomer === c.id ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button 
                        onClick={() => fetchDocuments(c.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Files
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de Documentos */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Customer Documents</h2>
          {!selectedCustomer ? (
            <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg border">Select a customer to view their files.</div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden border">
              <ul className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <li key={doc.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{doc.category} • {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      onClick={() => downloadDocument(doc.id)}
                      disabled={downloading === doc.id}
                      className="bg-black text-white px-3 py-1 text-sm rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                      {downloading === doc.id ? 'Opening...' : 'Download'}
                    </button>
                  </li>
                ))}
                {documents.length === 0 && (
                  <li className="p-4 text-center text-sm text-gray-500">No documents uploaded yet.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
