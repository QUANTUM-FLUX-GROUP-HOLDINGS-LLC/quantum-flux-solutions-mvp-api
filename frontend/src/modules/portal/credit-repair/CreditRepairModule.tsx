import { useCallback, useEffect, useState } from 'react';
import { UploadCard } from '../../dashboard/components/UploadCard';
import { DocumentList } from '../../dashboard/components/DocumentList';
import { ShieldCheck, FileText, Download, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiFetch, apiDownload } from '../../shared/api';
import toast from 'react-hot-toast';

type Dispute = {
  id: string;
  bureau: string;
  accountName: string;
  accountNumber?: string;
  status: string;
  createdAt: string;
};

/** Color/icon mapping for dispute statuses. Unknown statuses render as neutral. */
function statusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return {
        classes: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: <Clock className="w-3.5 h-3.5" />,
      };
    case 'RESOLVED':
      return {
        classes: 'bg-green-50 text-green-700 border-green-200',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
      };
    default:
      return {
        classes: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: <Clock className="w-3.5 h-3.5" />,
      };
  }
}

function DisputeRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
      <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded-md" /></td>
      <td className="px-6 py-4"><div className="h-4 w-14 bg-gray-200 rounded ml-auto" /></td>
    </tr>
  );
}

export const CreditRepairModule = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Dispute[]>('/credit/my-disputes');
      setDisputes(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load your disputes.');
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDisputes();
  }, [loadDisputes]);

  const handleDownload = async (id: string) => {
    try {
      toast.loading('Generating PDF...', { id: 'dl-pdf' });
      await apiDownload(`/credit/my-disputes/${id}/pdf`, `Dispute_${id}.pdf`);
      toast.success('Download started', { id: 'dl-pdf' });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to download PDF',
        { id: 'dl-pdf' },
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 text-blue-800 p-5 rounded-lg border border-blue-100">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Dispute Tracker
        </h2>
        <p className="text-sm mt-1 opacity-90">
          Track your disputes, upload credit reports, and download your generated letters.
        </p>
      </div>

      {/* Disputes section */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" /> Your Disputes
        </h3>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <table className="w-full text-left border-collapse" aria-busy="true">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Bureau</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((i) => <DisputeRowSkeleton key={i} />)}
              </tbody>
            </table>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                type="button"
                onClick={() => void loadDisputes()}
                className="text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-800"
              >
                Retry
              </button>
            </div>
          ) : disputes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No disputes yet. Upload a credit report below to get started.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Bureau</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {disputes.map((d) => {
                  const badge = statusBadge(d.status);
                  return (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{d.bureau}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {d.accountName}
                        {d.accountNumber && (
                          <span className="block text-xs text-gray-400">#{d.accountNumber}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.classes}`}
                        >
                          {badge.icon}
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => void handleDownload(d.id)}
                          disabled={d.status === 'PENDING'}
                          className={`inline-flex items-center gap-1 font-medium text-sm ${
                            d.status === 'PENDING'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                        >
                          <Download className="w-4 h-4" /> Letter
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Credit reports section */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" /> Credit Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <UploadCard
            title="Upload Credit Report"
            description="Upload your latest Equifax, Experian, or TransUnion report."
            category="CREDIT_REPORT"
          />
        </div>
        <DocumentList category="CREDIT_REPORT" />
      </section>
    </div>
  );
};
