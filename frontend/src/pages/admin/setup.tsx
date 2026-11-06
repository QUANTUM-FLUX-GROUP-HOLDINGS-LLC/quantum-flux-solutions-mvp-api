import { AdminLayout } from '../../modules/shared/AdminLayout';
import { SetupGuideModule } from '../../modules/setup/SetupGuideModule';

export default function SetupPage() {
  return (
    <AdminLayout>
      <SetupGuideModule />
    </AdminLayout>
  );
}
