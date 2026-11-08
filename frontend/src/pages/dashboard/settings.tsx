import { PortalLayout } from '../../modules/portal/PortalLayout';
import { ChangePasswordForm } from '../../modules/settings/components/ChangePasswordForm';
import { Lock } from 'lucide-react';

export default function ClientSettingsPage() {
  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile and security preferences.</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
          </div>
          <div className="p-6">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
