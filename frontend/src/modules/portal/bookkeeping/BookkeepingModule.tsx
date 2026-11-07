import { useState, useEffect } from 'react';
import { UploadCard } from '../../dashboard/components/UploadCard';
import { DocumentList } from '../../dashboard/components/DocumentList';
import { BookOpen, FileText, Loader2 } from 'lucide-react';
import { apiFetch } from '../../shared/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../shared/auth-context';

export const BookkeepingModule = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    businessName: '',
    period: '',
    revenue: '',
    expenses: '',
    notes: '',
  });

  useEffect(() => {
    if (!user?.id) return;
    apiFetch<any>(`/bookkeeping/profile`)
      .then((data) => {
        if (data) {
          setFormData({
            businessName: data.businessName || '',
            period: data.period || '',
            revenue: data.revenue?.toString() || '',
            expenses: data.expenses?.toString() || '',
            notes: data.notes || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await apiFetch(`/bookkeeping/profile`, {
        method: 'POST',
        body: JSON.stringify({
          businessName: formData.businessName,
          period: formData.period,
          revenue: Number(formData.revenue) || 0,
          expenses: Number(formData.expenses) || 0,
          notes: formData.notes,
        }),
      });
      toast.success('Bookkeeping saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-emerald-50 text-emerald-800 p-5 rounded-lg border border-emerald-100">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Bookkeeping Workspace
        </h2>
        <p className="text-sm mt-1 opacity-90">Track your revenue and expenses, and upload supporting documentation.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Business Name</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="Acme LLC"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Period</label>
            <input
              type="text"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="2026-Q4"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Revenue ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.revenue}
              onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Expenses ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.expenses}
              onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            placeholder="Any notes for your bookkeeper..."
          ></textarea>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 bg-emerald-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Bookkeeping'}
        </button>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" /> Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <UploadCard title="Upload Bookkeeping Document" description="Receipts, bank statements, or expense reports." category="BOOKKEEPING" />
        </div>
        <DocumentList category="BOOKKEEPING" />
      </div>
    </div>
  );
};
