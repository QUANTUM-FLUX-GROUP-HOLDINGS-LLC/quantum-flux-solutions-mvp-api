import { UploadCard } from '../../dashboard/components/UploadCard';
import { DocumentList } from '../../dashboard/components/DocumentList';
import { FileText } from 'lucide-react';

interface DocumentsSectionProps {
  uploadTitle: string;
  uploadDescription: string;
  category: string;
}

/**
 * Shared documents section used by all client portal service modules.
 */
export const DocumentsSection = ({
  uploadTitle,
  uploadDescription,
  category,
}: DocumentsSectionProps) => (
  <section>
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <FileText className="w-5 h-5 text-gray-500" /> Documents
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <UploadCard title={uploadTitle} description={uploadDescription} category={category} />
    </div>
    <DocumentList category={category} />
  </section>
);
