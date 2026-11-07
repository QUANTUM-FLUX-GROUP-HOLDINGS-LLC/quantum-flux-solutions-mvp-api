import { useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';
import { useAuth } from '../../modules/shared/auth-context';
import toast from 'react-hot-toast';
import { User, Lock, Save, Building2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  
  // Estado para el formulario de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setSaving(true);
    // Simulamos la llamada al backend POST /auth/change-password
    setTimeout(() => {
      toast.success('Password updated successfully (mock)');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaving(false);
    }, 800);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and workspace preferences.</p>
      </div>

      <div className="max-w-4xl space-y-6">
        
        {/* Sección: Perfil */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Profile Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                defaultValue={user?.name || ''} 
                disabled 
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-500 cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                defaultValue={user?.email || ''} 
                disabled 
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-500 cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

        {/* Sección: Seguridad */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Security</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input 
                type="password" 
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full max-w-md border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input 
                type="password" 
                required
                minLength={6}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full max-w-md border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                required
                minLength={6}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full max-w-md border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div className="pt-2">
              <button 
                type="submit"
                disabled={saving}
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Sección: Organización */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Organization</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input 
                type="text" 
                defaultValue="Quantum Flux Solutions" 
                className="w-full max-w-md border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input 
                type="email" 
                defaultValue="support@quantumflux.com" 
                className="w-full max-w-md border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900 flex items-center gap-2 mt-2">
              <Save className="w-4 h-4" /> Save Organization
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
