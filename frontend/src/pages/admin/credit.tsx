import { AdminLayout } from '../../modules/shared/AdminLayout';
import { CreditModule } from '../../modules/credit/CreditModule';

export default function CreditPage() {
  return (
    <AdminLayout>
      <CreditModule />
    </AdminLayout>
  );
}
