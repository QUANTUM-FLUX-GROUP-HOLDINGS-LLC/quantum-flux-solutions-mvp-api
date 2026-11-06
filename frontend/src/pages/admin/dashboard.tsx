import { AdminLayout } from '../../modules/shared/AdminLayout';
import { AdminDashboardModule } from '../../modules/admin-dashboard/AdminDashboardModule';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <AdminDashboardModule />
    </AdminLayout>
  );
}
