import { useEffect, useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';
import { apiFetch } from '../../modules/shared/api';
import { ClientDocuments } from '../../modules/admin/components/ClientDocuments';
import { LetterLibraryModule } from '../../modules/letter-library/LetterLibraryModule';
import toast from 'react-hot-toast';
import { Plus, CheckCircle, Clock, Loader2, X, FolderOpen, FileText, Scale } from 'lucide-react';

type Dispute = {
  id: string;
  bureau: string;
  accountName: string;
  accountNumber?: string;
  status: string;
  createdAt: string;
  customer: { id: string; name: string; email: string };
};

export default function AdminCreditPage() {
  const [activeTab, setActiveTab] = useState<'disputes' | 'letters'>('disputes');
  
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [docsClient, setDocsClient] = useState<{ id: string; name: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerId: '',
    bureau: 'Equifax',
    accountName: '',
    accountNumber: '',
  });

  useEffect(() => {
    fetchDisputes();
    fetchClients();
  }, []);

  const fetchDisputes = async () => {
    try {
      const data = await apiFetch<Dispute[]>('/credit/disputes');
      setDisputes(data);
    } catch (err) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await apiFetch<any[]>('/admin/clients');
      setClients(data.filter(c => c.role === 'CLIENT'));
    } catch (err) {
      console.error('Failed to load clients');
    }
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.accountName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/credit/customers/${formData.customerId}/disputes`, {
        method: 'POST',
        body: JSON.stringify({
          bureau: formData.bureau,
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
        }),
      });
      toast.success('Dispute created successfully');
      setIsModalOpen(false);
      setFormData({ customerId: '', bureau: 'Equifax', accountName: '', accountNumber: '' });
      fetchDisputes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create dispute');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    if (!confirm('Mark this dispute as RESOLVED? This will allow the client to download the PDF letter.')) return;
    try {
      await apiFetch(`/credit/disputes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'RESOLVED' }),
      });
      toast.success('Dispute resolved!');
      fetchDisputes();
    } catch (err) {
      toast.error('Failed to update dispute');
    }
  };

  return (
    <AdminLayout>
      {/* Sub-Menú del Módulo */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('disputes')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'disputes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Scale className="w-4 h-4" /> Disputes
          </button>
          <button
            onClick={() => setActiveTab('letters')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'letters' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" /> Letter Library
          </button>
        </div>
      </div>

      {/* Contenido de la Pestaña Activa */}
      {activeTab === 'letters' ? (
        <div className="h-[calc(100vh-14rem)]">
          <LetterLibraryModule />
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
              <p className="text-gray-500 mt-1">Manage client disputes and generate letters.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Dispute
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : disputes.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="mb-4">No disputes found in the system.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Bureau</th>
                    <th className="px-6 py-4">Account</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {disputes.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{d.customer?.name}</p>
                        <p className="text-xs text-gray-500">{d.customer?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{d.bureau}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {d.accountName}
                        {d.accountNumber && <span className="block text-xs text-gray-400">#{d.accountNumber}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          d.status === 'PENDING' 
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {d.status === 'PENDING' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        <button
                          onClick={() => setDocsClient({ id: d.customer.id, name: d.customer.name })}
                          className="text-gray-500 hover:text-gray-800 font-medium text-sm flex items-center gap-1"
                          title="View Client Documents"
                        >
                          <FolderOpen className="w-4 h-4" /> Files
                        </button>
                        {d.status === 'PENDING' && (
                          <button
                            onClick={() => handleResolve(d.id)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal para Crear Disputa */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800">Create New Dispute</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateDispute} className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a client...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Bureau</label> 
                    <select
                      value={formData.bureau}
                      onChange={(e) => setFormData({ ...formData, bureau: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Equifax">Equifax</option>
                      <option value="Experian">Experian</option>
                      <option value="TransUnion">TransUnion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Capital One"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. ****1234"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? 'Creating...' : 'Create Dispute'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para ver Documentos del Cliente */}
          {docsClient && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Client Files</h3>
                    <p className="text-sm text-gray-500">{docsClient.name}</p>
                  </div>
                  <button onClick={() => setDocsClient(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 max-h-[70vh] overflow-y-auto">
                  <ClientDocuments clientId={docsClient.id} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
