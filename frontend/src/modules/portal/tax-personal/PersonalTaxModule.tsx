import { useState, useEffect } from 'react';
import { UploadCard } from '../../dashboard/components/UploadCard';
import { DocumentList } from '../../dashboard/components/DocumentList';
import { User, FileText, Loader2 } from 'lucide-react';
import { apiFetch } from '../../shared/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../shared/auth-context';

export const PersonalTaxModule = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    filingStatus: 'Single',
    dependents: 0,
    notes: ''
  });

  // Cargar datos existentes
  useEffect(() => {
    if (!user?.id) return;
    apiFetch<any>(`/tax/profile`)
      .then((data) => {
        if (data) {
          setFormData({
            filingStatus: data.filingStatus || 'Single',
            dependents: data.dependents || 0,
            notes: data.notes || ''
          });
        }
      })
      .catch((err) => console.log('No previous profile found', err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await apiFetch(`/tax/profile`, {
        method: 'POST', 
        body: JSON.stringify(formData)
      });
      toast.success('Personal Tax Profile saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-indigo-50 text-indigo-800 p-5 rounded-lg border border-indigo-100">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5" /> Personal Tax Workspace
        </h2>
        <p className="text-sm mt-1 opacity-90">Manage your personal tax profile, upload W-2s, and view your filed documents.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Tax Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Filing Status</label>
            <select 
              value={formData.filingStatus}
              onChange={(e) => setFormData({...formData, filingStatus: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="Single">Single</option>
              <option value="Married Filing Jointly">Married Filing Jointly</option>
              <option value="Married Filing Separately">Married Filing Separately</option>
              <option value="Head of Household">Head of Household</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Number of Dependents</label>
            <input 
              type="number" 
              min="0"
              value={formData.dependents}
              onChange={(e) => setFormData({...formData, dependents: parseInt(e.target.value) || 0})}
              className="w-full border border-gray-300 rounded-md p-2 text-sm" 
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Internal Notes</label>
          <textarea 
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3} 
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            placeholder="Add any additional notes here..."
          ></textarea>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" /> Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <UploadCard title="Upload Tax Document" description="Upload W-2, 1099, or prior year returns." category="TAX-PERSONAL" />
        </div>
        <DocumentList category="TAX-PERSONAL" />
      </div>
    </div>
  );
};
