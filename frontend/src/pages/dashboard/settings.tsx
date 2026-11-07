import { useState } from 'react';
import { PortalLayout } from '../../modules/portal/PortalLayout';
import { useAuth } from '../../modules/shared/auth-context';
import { apiFetch } from '../../modules/shared/api';
import toast from 'react-hot-toast';
import { Lock, Save } from 'lucide-react';

export default function ClientSettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword }),
      });
      toast.success('Password updated successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile and security preferences.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" required value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" required minLength={6} value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" required minLength={6} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}
