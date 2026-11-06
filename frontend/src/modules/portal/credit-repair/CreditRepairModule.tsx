import { useState, useEffect } from 'react';
import { UploadCard } from '../../dashboard/components/UploadCard';
import { apiFetch, apiDownload } from '../../shared/api';
import toast from 'react-hot-toast';
import { ShieldCheck, FileText } from 'lucide-react';

type Dispute = { id: string; bureau: string; accountName: string; status: string; createdAt: string; };

export const CreditRepairModule = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Dispute[]>('/credit/my-disputes')
      .then(setDisputes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="bg-rose-50 text-rose-800 p-5 rounded-lg border border-rose-100">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Credit Repair Workspace
        </h2>
        <p className="text-sm mt-1 opacity-90">Track your disputes, upload credit reports, and manage your credit profile.</p>
      </div>

      {/* Zona de Subida */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" /> Upload Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadCard title="Upload Credit Report" description="Upload your latest report from Equifax, Experian, or TransUnion." category="CREDIT_REPORT" />
          <UploadCard title="Upload Identification" description="Upload a valid government-issued ID." category="CREDIT_ID" />
        </div>
      </div>

      {/* Tabla de Disputas */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Your Disputes</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading disputes...</div>
        ) : disputes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No disputes found. Your account is in good standing.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Bureau</th>
                <th className="py-3 px-6">Account</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {disputes.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{d.bureau}</td>
                  <td className="py-4 px-6 text-gray-600">{d.accountName}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      d.status === 'PENDING' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    {d.status !== 'PENDING' && (
                      <button 
                        onClick={() => apiDownload(`/credit/my-disputes/${d.id}/pdf`, `Dispute_${d.id}.pdf`).catch(e => toast.error(e.message))} 
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Download Letter
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
