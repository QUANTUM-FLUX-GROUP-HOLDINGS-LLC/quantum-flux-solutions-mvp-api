import { useCallback, useEffect, useState } from 'react';
import { ClientList } from './components/ClientList';
import { BusinessForm } from './components/BusinessForm';

interface Client {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface BusinessFormData {
  entityType: string;
  ein: string;
  grossRevenue: string;
  hasEmployees: 'Yes' | 'No';
  notes: string;
}

const DEFAULT_FORM: BusinessFormData = {
  entityType: 'S-Corporation (1120-S)',
  ein: '',
  grossRevenue: '',
  hasEmployees: 'No',
  notes: '',
};

async function loadApi(path: string): Promise<unknown> {
  const { apiFetch } = await import('../shared/api');
  return apiFetch(path);
}

export const TaxBusinessModule = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BusinessFormData>(DEFAULT_FORM);
  const [savedFor, setSavedFor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = (await loadApi('/admin/clients')) as Client[];
        if (!cancelled) setClients((data ?? []).filter((c) => c.role === 'CLIENT'));
      } catch {
        if (!cancelled) toastError();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toastError = () => {
    // Imported lazily to avoid circular dependency at module scope.
    void import('react-hot-toast').then(({ default: toast }) =>
      toast.error('Failed to load clients'),
    );
  };

  // Load the selected client's business profile.
  useEffect(() => {
    if (!selectedClient) return;
    let cancelled = false;
    setLoadingProfile(true);
    void (async () => {
      try {
        const data = (await loadApi(`/tax-business/${selectedClient.id}`)) as
          | (Partial<BusinessFormData> & { hasEmployees?: boolean })
          | null;
        if (cancelled) return;
        if (data) {
          setFormData({
            entityType: data.entityType ?? DEFAULT_FORM.entityType,
            ein: data.ein ?? '',
            grossRevenue: data.grossRevenue != null ? String(data.grossRevenue) : '',
            hasEmployees: data.hasEmployees ? 'Yes' : 'No',
            notes: data.notes ?? '',
          });
        } else {
          setFormData(DEFAULT_FORM);
        }
        setSavedFor(null);
      } catch {
        if (!cancelled) {
          void import('react-hot-toast').then(({ default: toast }) =>
            toast.error('Failed to load business profile'),
          );
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedClient]);

  const updateFormData = (data: BusinessFormData) => {
    setFormData(data);
    setSavedFor(null); // Mark unsaved changes.
  };

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!selectedClient) return false;
    setSaving(true);
    try {
      const { apiFetch } = await import('../shared/api');
      await apiFetch(`/tax-business/${selectedClient.id}`, {
        method: 'POST',
        body: JSON.stringify({
          entityType: formData.entityType,
          ein: formData.ein.trim() || undefined,
          grossRevenue: Number(formData.grossRevenue) || 0,
          hasEmployees: formData.hasEmployees === 'Yes',
          notes: formData.notes,
        }),
      });
      setSavedFor(selectedClient.id);
      void import('react-hot-toast').then(({ default: toast }) =>
        toast.success('Business profile saved.'),
      );
      return true;
    } catch {
      void import('react-hot-toast').then(({ default: toast }) =>
        toast.error('Failed to save business profile.'),
      );
      return false;
    } finally {
      setSaving(false);
    }
  }, [selectedClient, formData]);

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <ClientList clients={clients} selected={selectedClient} onSelect={setSelectedClient} loading={loading} />
      <BusinessForm
        client={selectedClient}
        formData={formData}
        setFormData={updateFormData}
        onSave={handleSave}
        saving={saving}
        loadingProfile={loadingProfile}
        hasSaved={Boolean(selectedClient && savedFor === selectedClient.id)}
      />
    </div>
  );
};
