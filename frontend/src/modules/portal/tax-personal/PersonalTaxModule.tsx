import { UploadCard } from '../../dashboard/components/UploadCard';

export const PersonalTaxModule = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg">
        <h3 className="font-semibold">Welcome to your Personal Tax Workspace</h3>
        <p className="text-sm">Upload your documents here. They will be securely isolated from other services.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadCard title="Upload Personal Tax Documents" description="Upload W-2, 1099, or relevant files for this service." category="TAX-PERSONAL" />
      </div>
    </div>
  );
};
