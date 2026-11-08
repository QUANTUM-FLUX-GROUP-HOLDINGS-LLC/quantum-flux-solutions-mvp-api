import { BookOpen } from 'lucide-react';
import { DocumentsSection } from '../components/DocumentsSection';

export const BookkeepingModule = () => (
  <div className="space-y-8">
    <div className="bg-emerald-50 text-emerald-800 p-5 rounded-lg border border-emerald-100">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <BookOpen className="w-5 h-5" /> Bookkeeping
      </h2>
      <p className="text-sm mt-1 opacity-90">
        Upload your receipts, bank statements, and expense reports. Our team will process them and handle the calculations.
      </p>
    </div>

    <DocumentsSection
      uploadTitle="Upload Bookkeeping Document"
      uploadDescription="Receipts, bank statements, or expense reports."
      category="BOOKKEEPING"
    />
  </div>
);
