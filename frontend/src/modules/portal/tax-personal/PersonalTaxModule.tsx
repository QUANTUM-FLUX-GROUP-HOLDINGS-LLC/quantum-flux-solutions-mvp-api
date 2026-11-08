import { User } from 'lucide-react';
import { DocumentsSection } from '../components/DocumentsSection';

export const PersonalTaxModule = () => (
  <div className="space-y-8">
    <div className="bg-indigo-50 text-indigo-800 p-5 rounded-lg border border-indigo-100">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <User className="w-5 h-5" /> Personal Tax
      </h2>
      <p className="text-sm mt-1 opacity-90">
        Upload your W-2s, 1099s, and other tax documents. Our team will process them and prepare your return.
      </p>
    </div>

    <DocumentsSection
      uploadTitle="Upload Tax Document"
      uploadDescription="Upload W-2, 1099, or prior year returns."
      category="TAX_PERSONAL"
    />
  </div>
);
