'use client';
import { useState } from 'react';

export function UploadCard({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  async function onUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('category', 'CREDIT_REPORT');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Upload failed');
      setFile(null);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        onClick={onUpload}
        disabled={!file || busy}
        className="w-full bg-black text-white px-3 py-2 rounded-md disabled:opacity-50"
      >
        {busy ? 'Uploading...' : 'Upload File'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">File uploaded successfully!</p>}
    </div>
  );
}
