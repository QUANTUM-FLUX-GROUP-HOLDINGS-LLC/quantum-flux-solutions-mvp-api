import { DashboardLayout } from '../../modules/dashboard/components/DashboardLayout';
import { BookkeepingModule } from '../../modules/portal/bookkeeping/BookkeepingModule';

export default function BookkeepingPage() {
  return (
    <DashboardLayout>
      <BookkeepingModule />
    </DashboardLayout>
  );
}
