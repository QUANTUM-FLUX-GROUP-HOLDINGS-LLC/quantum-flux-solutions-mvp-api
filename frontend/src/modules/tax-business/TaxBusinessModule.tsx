import { useState, useEffect } from 'react';
import { ClientList } from './components/ClientList';
import { BusinessForm } from './components/BusinessForm';
import { useAuth } from '../shared/auth-context';


export const TaxBusinessModule = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ entityType: 'S-Corporation (1120-S)', ein: '', grossRevenue: '', hasEmployees: 'No', notes: '' });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const role = user?.role || 'USER';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/admin/clients?role=${role}`);
        if (res.ok) setClients(await res.json());
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const fetchProfile = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/tax-business/${selectedClient.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data) setFormData({ entityType: data.entityType, ein: data.ein, grossRevenue: data.grossRevenue?.toString() || '', hasEmployees: data.hasEmployees ? 'Yes' : 'No', notes: data.notes || '' });
            else setFormData({ entityType: 'S-Corporation (1120-S)', ein: '', grossRevenue: '', hasEmployees: 'No', notes: '' });
          }
        } catch (e) { console.error(e); }
      };
      fetchProfile();
    }
  }, [selectedClient]);

  const handleSave = async () => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/tax-business/${selectedClient.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, hasEmployees: formData.hasEmployees === 'Yes' })
      });
      if (res.ok) alert('Profile saved successfully!');
    } catch (e) { console.error(e); alert('Error saving'); } finally { setSaving(false); }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <ClientList clients={clients} selected={selectedClient} onSelect={setSelectedClient} loading={loading} />
      <BusinessForm client={selectedClient} formData={formData} setFormData={setFormData} onSave={handleSave} saving={saving} />
    </div>
  );
};
