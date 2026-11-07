import { UploadCard } from '../../dashboard/components/UploadCard';
import { DocumentList } from '../../dashboard/components/DocumentList';
import { Building2, FileText } from 'lucide-react';

export const BusinessTaxModule = () => {
  return (
    <div className="space-y-8">
      <div className="bg-purple-50 text-purple-800 p-5 rounded-lg border border-purple-100">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5" /> Business Tax Workspace
        </h2>
        <p className="text-sm mt-1 opacity-90">
          Upload your corporate tax documents, balance sheets, and P&L statements. Our team will handle your filings.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" /> Financial Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <UploadCard title="Upload Business Document" description="Upload tax returns, balance sheets, or P&L statements." category="TAX_BUSINESS" />
        </div>
        <DocumentList category="TAX_BUSINESS" />
      </div>
    </div>
  );
};
