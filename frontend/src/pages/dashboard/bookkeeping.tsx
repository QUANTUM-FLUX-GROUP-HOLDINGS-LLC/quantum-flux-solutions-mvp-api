import { PortalLayout } from '../../modules/portal/PortalLayout';
import { BookkeepingModule } from '../../modules/portal/bookkeeping/BookkeepingModule';

export default function BookkeepingPage() {
  return (
    <PortalLayout>
      <BookkeepingModule />
    </PortalLayout>
  );
}
