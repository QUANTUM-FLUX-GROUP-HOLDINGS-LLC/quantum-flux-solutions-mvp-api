import { useState } from 'react';

export const UploadCard = ({ title, description }: { title: string, description: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      alert('File uploaded successfully!');
      setUploading(false);
      setFile(null);
    }, 1500);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
      {file && (
        <button onClick={handleUpload} disabled={uploading} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      )}
    </div>
  );
};
