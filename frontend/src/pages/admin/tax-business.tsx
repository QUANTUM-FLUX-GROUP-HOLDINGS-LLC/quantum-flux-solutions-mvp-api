import { AdminLayout } from '../../modules/shared/AdminLayout';
import { TaxBusinessModule } from '../../modules/tax-business/TaxBusinessModule';

export default function TaxBusinessPage() {
  return (
    <AdminLayout>
      <TaxBusinessModule />
    </AdminLayout>
  );
}
