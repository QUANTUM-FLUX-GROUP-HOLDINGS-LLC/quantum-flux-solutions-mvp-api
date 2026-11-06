import { apiDownload } from '../../shared/api';
import styles from './tax-business.module.css';
export const BusinessForm = ({ client, formData, setFormData, onSave, saving }: any) => {
  if (!client) return <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">Select a corporate client from the list on the left.</div>;

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{client.name}'s Corporate Workspace</h1>
        <button onClick={() => apiDownload(`/tax-business/${client.id}/pdf`, `tax-profile-${client.id}.pdf`).catch((e) => alert(e.message))} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition text-sm">Download PDF</button>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Business Tax Profile (Form 1120-S)</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Entity Type</label>
            <select value={formData.entityType} onChange={(e) => setFormData({...formData, entityType: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50">
              <option value="S-Corporation (1120-S)">S-Corporation (1120-S)</option>
              <option value="C-Corporation (1120)">C-Corporation (1120)</option>
              <option value="LLC">LLC</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">EIN (Tax ID)</label>
            <input
            type="text"
            placeholder="XX-XXXXXXX"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.ein || ''}
            onChange={(e) => {
              // Solo números, máximo 9 dígitos
              const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
              // Auto-formatear con guion después de los primeros 2 dígitos
              const formatted = raw.length > 2 ? `${raw.slice(0, 2)}-${raw.slice(2)}` : raw;
              setFormData({ ...formData, ein: formatted });
            }}
          />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Gross Revenue ($)</label>
            <input type="number" value={formData.grossRevenue} onChange={(e) => setFormData({...formData, grossRevenue: e.target.value})} placeholder="0" className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Has Employees?</label>
            <select value={formData.hasEmployees} onChange={(e) => setFormData({...formData, hasEmployees: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50">
              <option value="No">No (Single Member)</option>
              <option value="Yes">Yes (W-2s required)</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Internal Notes</label>
          <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50" placeholder="Add any additional notes here..."></textarea>
        </div>
        <button onClick={onSave} disabled={saving} className={styles.saveButton}>{saving ? 'Saving...' : 'Save Business Profile'}</button>
      </div>
    </div>
  );
};
