import { PortalLayout } from '../../modules/portal/PortalLayout';
import { BookkeepingModule } from '../../modules/portal/bookkeeping/BookkeepingModule';

export default function BookkeepingPage() {
  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookkeeping Workspace</h1>
      <BookkeepingModule />
    </PortalLayout>
  );
}
