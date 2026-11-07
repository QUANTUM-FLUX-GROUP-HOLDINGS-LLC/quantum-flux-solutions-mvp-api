import { UploadCard } from '../../dashboard/components/UploadCard';
import { DocumentList } from '../../dashboard/components/DocumentList';
import { User, FileText } from 'lucide-react';

export const PersonalTaxModule = () => {
  return (
    <div className="space-y-8">
      <div className="bg-indigo-50 text-indigo-800 p-5 rounded-lg border border-indigo-100">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5" /> Personal Tax Workspace
        </h2>
        <p className="text-sm mt-1 opacity-90">
          Upload your W-2s, 1099s, and other tax documents. Our team will process them and prepare your return.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" /> Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <UploadCard title="Upload Tax Document" description="Upload W-2, 1099, or prior year returns." category="TAX_PERSONAL" />
        </div>
        <DocumentList category="TAX_PERSONAL" />
      </div>
    </div>
  );
};
