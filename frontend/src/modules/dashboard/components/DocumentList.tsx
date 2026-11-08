import { useCallback, useEffect, useState } from 'react';
import { apiFetch, apiDownload } from '../../shared/api';
import toast from 'react-hot-toast';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';

interface ClientDocument {
  id: string;
  fileName: string;
  createdAt: string;
}

export const DocumentList = ({ category }: { category: string }) => {
  const [docs, setDocs] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ClientDocument[]>(`/documents?category=${encodeURIComponent(category)}`);
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load your documents.');
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void loadDocs();
  }, [loadDocs]);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-label="Loading documents" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 text-sm mb-3">{error}</p>
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
      <div className="text-center p-6 bg-gray-50 border border-gray-200 border-dashed rounded-lg">
        <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">File Name</th>
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
                {new Date(doc.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() =>
                    apiDownload(`/documents/${doc.id}/download`, doc.fileName).catch((e) =>
                      toast.error(e instanceof Error ? e.message : 'Download failed'),
                    )
                  }
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
