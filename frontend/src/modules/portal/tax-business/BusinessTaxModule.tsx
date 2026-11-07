import { useState, useEffect } from 'react';
import { UploadCard } from '../../dashboard/components/UploadCard';
import { DocumentList } from '../../dashboard/components/DocumentList';
import { Building2, FileText, Loader2 } from 'lucide-react';
import { apiFetch } from '../../shared/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../shared/auth-context';

export const BusinessTaxModule = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    entityType: 'S-Corporation (1120-S)',
    ein: '',
    grossRevenue: '',
    hasEmployees: 'No',
    notes: ''
  });

  // Cargar datos existentes al entrar
  useEffect(() => {
    if (!user?.id) return;
    apiFetch<any>(`/tax-business/${user.id}`)
      .then((data) => {
        if (data) {
          setFormData({
            entityType: data.entityType || 'S-Corporation (1120-S)',
            ein: data.ein || '',
            grossRevenue: data.grossRevenue?.toString() || '',
            hasEmployees: data.hasEmployees || 'No',
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
      // La ruta del backend es POST /tax-business/:id
      await apiFetch(`/tax-business/${user.id}`, {
        method: 'POST', 
        body: JSON.stringify(formData)
      });
      toast.success('Business Profile saved successfully!');
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
      <div className="bg-purple-50 text-purple-800 p-5 rounded-lg border border-purple-100">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5" /> Business Tax Workspace
        </h2>
        <p className="text-sm mt-1 opacity-90">Manage your corporate tax profile, upload financial statements, and view your filings.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Entity Type</label>
            <select 
              value={formData.entityType} 
              onChange={(e) => setFormData({...formData, entityType: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="S-Corporation (1120-S)">S-Corporation (1120-S)</option>
              <option value="C-Corporation (1120)">C-Corporation (1120)</option>
              <option value="LLC">LLC</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">EIN (Tax ID)</label>
            <input 
              type="text" 
              placeholder="XX-XXXXXXX" 
              value={formData.ein}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
                const formatted = raw.length > 2 ? `${raw.slice(0, 2)}-${raw.slice(2)}` : raw;
                setFormData({...formData, ein: formatted});
              }}
              className="w-full border border-gray-300 rounded-md p-2 text-sm" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Gross Revenue ($)</label>
            <input 
              type="number" 
              placeholder="0" 
              value={formData.grossRevenue}
              onChange={(e) => setFormData({...formData, grossRevenue: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 text-sm" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Has Employees?</label>
            <select 
              value={formData.hasEmployees}
              onChange={(e) => setFormData({...formData, hasEmployees: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
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
          className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" /> Financial Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <UploadCard title="Upload Business Document" description="Upload tax returns, balance sheets, or P&L statements." category="TAX-BUSINESS" />
        </div>
        <DocumentList category="TAX-BUSINESS" />
      </div>
    </div>
  );
};
