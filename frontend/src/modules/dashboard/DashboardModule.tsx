import { useState, useEffect } from 'react';
import { UploadCard } from './components/UploadCard';
import { apiFetch, apiDownload } from '../shared/api';

type Dispute = {
  id: string;
  bureau: string;
  accountName: string;
  status: string;
  createdAt: string;
};

export const DashboardModule = () => {
  const [user, setUser] = useState<any>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const loadData = async () => {
      try {
        const data = await apiFetch<Dispute[]>('/credit/my-disputes');
        setDisputes(data);
      } catch (err) {
        console.error("Error cargando disputas", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Client'}</h1>
        <p className="text-gray-500">Manage your disputes and documents here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadCard title="Upload Identification" description="Please upload a valid government ID (Driver's License or Passport)." category="IDENTIFICATION" />
        <UploadCard title="Upload Financial Documents" description="Upload your recent W-2, Paystubs, or Bank Statements." category="FINANCIAL" />
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Disputes</h2>
        {loading ? (
          <p className="text-gray-500">Loading disputes...</p>
        ) : disputes.length === 0 ? (
          <p className="text-gray-500">No disputes found. Your account is in good standing.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="py-3 px-4">Bureau</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{d.bureau}</td>
                    <td className="py-3 px-4">{d.accountName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {d.status === 'PENDING' ? (
                        <span className="text-xs text-gray-400">Pending review</span>
                      ) : (
                        <button 
                          onClick={() => apiDownload(`/credit/my-disputes/${d.id}/pdf`, `Dispute_${d.id}.pdf`).catch(e => alert(e.message))}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Download Letter
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
