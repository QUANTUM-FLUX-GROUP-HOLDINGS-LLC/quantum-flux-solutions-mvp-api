import { useCallback, useEffect, useState } from 'react';
import { CreditMetrics } from './components/CreditMetrics';
import { ClientDirectory } from './components/ClientDirectory';
import { NewClientModal } from './components/NewClientModal';
import { apiFetch } from '../shared/api';
import toast from 'react-hot-toast';

export interface AdminClient {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export const CreditModule = () => {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<AdminClient[]>('/admin/clients');
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Clients</h1>
          <p className="text-gray-500 text-sm mt-1">Search, filter, and open client workspaces.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          + New Client
        </button>
      </div>

      <CreditMetrics clients={clients} />
      <ClientDirectory clients={clients} loading={loading} />

      <NewClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchClients} />
    </div>
  );
};
