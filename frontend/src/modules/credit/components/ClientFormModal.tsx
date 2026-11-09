import { useEffect, useState } from 'react';
import { apiFetch } from '../../shared/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface ClientFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  /** Present in edit mode; omitted in create mode. */
  initial?: { id: string; name: string; email: string };
  onClose: () => void;
  onRefresh: () => void;
}

export const ClientFormModal = ({
  isOpen, mode, initial, onClose, onRefresh,
}: ClientFormModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Hydrate form values every time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setName(initial?.name ?? '');
    setEmail(initial?.email ?? '');

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, initial, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'edit' && initial) {
        await apiFetch(`/admin/clients/${initial.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, email }),
        });
        toast.success('Client updated successfully.');
      } else {
        await apiFetch('/admin/clients', {
          method: 'POST',
          body: JSON.stringify({ name, email }),
        });
        toast.success('Client created successfully. They can set a password via "Forgot password".');
      }
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'edit' ? 'Edit client' : 'Add new client'}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="client-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="client-name"
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="client-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              id="client-email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="john@example.com"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
