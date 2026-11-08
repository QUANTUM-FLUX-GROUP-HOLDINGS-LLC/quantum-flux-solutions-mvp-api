import { useState } from 'react';
import { apiFetch } from '../../shared/api';
import toast from 'react-hot-toast';
import { Upload, AlertCircle } from 'lucide-react';

// Keep in sync with the backend upload limit.
const MAX_FILE_SIZE_MB = 10;

interface UploadCardProps {
  title: string;
  description: string;
  category: string;
}

export const UploadCard = ({ title, description, category }: UploadCardProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleUpload = async () => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setUploading(true);
    setStatus('idle');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      await apiFetch('/documents', {
        method: 'POST',
        body: formData,
      });
      setStatus('success');
      toast.success('File uploaded successfully.');
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error(err instanceof Error ? `Upload failed: ${err.message}` : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>

      <input
        type="file"
        aria-label={`Upload file for ${title}`}
        onChange={(e) => {
          setFile(e.target.files?.[0] || null);
          setStatus('idle');
        }}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
      />

      {file && (
        <button
          type="button"
          onClick={() => void handleUpload()}
          disabled={uploading}
          className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      )}

      {status === 'success' && (
        <p className="text-green-600 text-sm mt-3">File uploaded successfully.</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-sm mt-3 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> Upload failed. Please try again.
        </p>
      )}
    </div>
  );
};
