import { UploadCard } from '../../dashboard/components/UploadCard';
import { DocumentList } from '../../dashboard/components/DocumentList';
import { Building2, FileText } from 'lucide-react';

export const BusinessTaxModule = () => {
  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="bg-purple-50 text-purple-800 p-5 rounded-lg border border-purple-100">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5" /> Business Tax Workspace
        </h2>
        <p className="text-sm mt-1 opacity-90">Manage your corporate tax profile, upload financial statements, and view your filings.</p>
      </div>

      {/* Formulario Básico */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Entity Type</label>
            <select className="w-full border border-gray-300 rounded-md p-2 text-sm">
              <option>S-Corporation (1120-S)</option>
              <option>C-Corporation (1120)</option>
              <option>LLC</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Gross Revenue ($)</label>
            <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-md p-2 text-sm" />
          </div>
        </div>
        <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition">
          Save Profile
        </button>
      </div>

      {/* Zona de Subida y Lista */}
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
