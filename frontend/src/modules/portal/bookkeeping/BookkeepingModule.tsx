import { UploadCard } from '../../dashboard/components/UploadCard';
import { DocumentList } from '../../dashboard/components/DocumentList';
import { BookOpen, FileText } from 'lucide-react';

export const BookkeepingModule = () => {
  return (
    <div className="space-y-8">
      <div className="bg-emerald-50 text-emerald-800 p-5 rounded-lg border border-emerald-100">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Bookkeeping Workspace
        </h2>
        <p className="text-sm mt-1 opacity-90">
          Upload your receipts, bank statements, and expense reports. Our team will process them and handle the calculations.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" /> Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <UploadCard 
            title="Upload Bookkeeping Document" 
            description="Receipts, bank statements, or expense reports." 
            category="BOOKKEEPING" 
          />
        </div>
        <DocumentList category="BOOKKEEPING" />
      </div>
    </div>
  );
};
