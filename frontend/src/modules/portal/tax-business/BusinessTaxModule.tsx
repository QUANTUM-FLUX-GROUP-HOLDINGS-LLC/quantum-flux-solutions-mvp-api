import { Building2 } from 'lucide-react';
import { DocumentsSection } from '../components/DocumentsSection';

export const BusinessTaxModule = () => (
  <div className="space-y-8">
    <div className="bg-purple-50 text-purple-800 p-5 rounded-lg border border-purple-100">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Building2 className="w-5 h-5" /> Business Tax
      </h2>
      <p className="text-sm mt-1 opacity-90">
        Upload your corporate tax documents, balance sheets, and P&L statements. Our team will handle your filings.
      </p>
    </div>

    <DocumentsSection
      uploadTitle="Upload Business Document"
      uploadDescription="Upload tax returns, balance sheets, or P&L statements."
      category="TAX_BUSINESS"
    />
  </div>
);
