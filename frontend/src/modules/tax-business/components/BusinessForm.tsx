import { CheckCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiDownload } from '../../shared/api';

interface Client {
  id: string;
  name: string;
}

interface BusinessFormData {
  entityType: string;
  ein: string;
  grossRevenue: string;
  hasEmployees: 'Yes' | 'No';
  notes: string;
}

interface BusinessFormProps {
  client: Client | null;
  formData: BusinessFormData;
  setFormData: (data: BusinessFormData) => void;
  onSave: () => Promise<boolean>;
  saving: boolean;
  loadingProfile: boolean;
  hasSaved: boolean;
}

export const BusinessForm = ({
  client,
  formData,
  setFormData,
  onSave,
  saving,
  loadingProfile,
  hasSaved,
}: BusinessFormProps) => {
  const handleSave = async () => {
    await onSave(); // Toasts are handled by the parent; result drives hasSaved.
  };

  const handleDownload = async () => {
    if (!client) return;
    try {
      await apiDownload(`/tax-business/${client.id}/pdf`, `tax-profile-${client.id}.pdf`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed.');
    }
  };

  if (!client) {
    return (
      <div className="flex-1 h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
        Select a corporate client from the list on the left.
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-900">{client.name}&rsquo;s Corporate Workspace</h2>
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={!hasSaved}
          className={`px-4 py-2 rounded-lg transition text-sm flex items-center gap-2 ${
            hasSaved
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {hasSaved && <CheckCircle className="w-4 h-4" />}
          {hasSaved ? 'Download PDF' : 'Save to enable PDF'}
        </button>
      </div>

      {loadingProfile ? (
        <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-400">
          Loading profile…
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Business Tax Profile (Form 1120-S)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="entityType" className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Entity Type</label>
              <select
                id="entityType"
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="S-Corporation (1120-S)">S-Corporation (1120-S)</option>
                <option value="C-Corporation (1120)">C-Corporation (1120)</option>
                <option value="LLC">LLC</option>
              </select>
            </div>
            <div>
              <label htmlFor="ein" className="block text-xs font-semibold text-gray-500 mb-1 uppercase">EIN (Tax ID)</label>
              <input
                id="ein"
                type="text"
                placeholder="XX-XXXXXXX"
                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.ein || ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
                  const formatted = raw.length > 2 ? `${raw.slice(0, 2)}-${raw.slice(2)}` : raw;
                  setFormData({ ...formData, ein: formatted });
                }}
              />
            </div>
            <div>
              <label htmlFor="grossRevenue" className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Gross Revenue ($)</label>
              <input
                id="grossRevenue"
                type="number"
                value={formData.grossRevenue}
                onChange={(e) => setFormData({ ...formData, grossRevenue: e.target.value })}
                placeholder="0"
                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="hasEmployees" className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Has Employees?</label>
              <select
                id="hasEmployees"
                value={formData.hasEmployees}
                onChange={(e) => setFormData({ ...formData, hasEmployees: e.target.value as 'Yes' | 'No' })}
                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="No">No (Single Member)</option>
                <option value="Yes">Yes (W-2s required)</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="notes" className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Internal Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add any additional notes here..."
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : 'Save Business Profile'}
            </button>
            {hasSaved && (
              <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
                <CheckCircle className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
