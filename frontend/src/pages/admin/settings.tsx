import { AdminLayout } from '../../modules/shared/AdminLayout';
import { useAuth } from '../../modules/shared/auth-context';
import { ChangePasswordForm } from '../../modules/settings/components/ChangePasswordForm';
import { TwoFactorPanel } from '../../modules/settings/components/TwoFactorPanel';
import { User, Lock, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and workspace preferences.</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Profile section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Profile Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="admin-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="admin-name"
                type="text"
                defaultValue={user?.name || ''}
                disabled
                aria-readonly="true"
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="admin-email"
                type="email"
                defaultValue={user?.email || ''}
                disabled
                aria-readonly="true"
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Security section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Security</h2>
          </div>
          <div className="p-6">
            <ChangePasswordForm />
          </div>
        </div>

        {/* Two-Factor Authentication section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Two-Factor Authentication</h2>
          </div>
          <div className="p-6">
            <TwoFactorPanel />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
