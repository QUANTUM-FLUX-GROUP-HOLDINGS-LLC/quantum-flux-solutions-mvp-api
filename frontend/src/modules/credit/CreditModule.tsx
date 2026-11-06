import { useState, useEffect } from 'react';
import { CreditMetrics } from './components/CreditMetrics';
import { ClientDirectory } from './components/ClientDirectory';
import { NewClientModal } from './components/NewClientModal';

export const CreditModule = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const role = localStorage.getItem('role') || 'USER';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/admin/clients?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Clients</h1>
          <p className="text-gray-500 text-sm mt-1">Search, filter, and open client workspaces.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">+ New Client</button>
      </div>
      
      <CreditMetrics clients={clients} />
      <ClientDirectory clients={clients} loading={loading} />
      
      <NewClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchClients} />
    </div>
  );
};
