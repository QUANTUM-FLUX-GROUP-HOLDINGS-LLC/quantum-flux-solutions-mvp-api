import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../shared/api';
import toast from 'react-hot-toast';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';

interface AdminDocument {
  id: string;
  fileName: string;
  category: string;
  createdAt: string;
}

export const ClientDocuments = ({ clientId }: { clientId: string }) => {
  const [docs, setDocs] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDocs = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<AdminDocument[]>(`/admin/clients/${clientId}/documents`);
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void loadDocs();
  }, [loadDocs]);

  const handleDownload = async (docId: string) => {
    try {
      toast.loading('Generating link…', { id: 'dl-admin' });
      const res = await apiFetch<{ url: string }>(`/admin/documents/${docId}/download`);
      window.open(res.url, '_blank');
      toast.success('Download started', { id: 'dl-admin' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed', { id: 'dl-admin' });
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-label="Loading documents" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center border border-red-200 bg-red-50 rounded-lg mt-4">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 text-sm mb-3">Could not load documents.</p>
        <button
          type="button"
          onClick={() => void loadDocs()}
          className="text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No documents uploaded by this client yet.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">File Name</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {docs.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span className="font-medium text-gray-800">{doc.fileName}</span>
              </td>
              <td className="px-4 py-3 text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{doc.category}</span>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(doc.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => void handleDownload(doc.id)}
                  className="text-indigo-600 hover:text-indigo-900 font-medium inline-flex items-center gap-1"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
