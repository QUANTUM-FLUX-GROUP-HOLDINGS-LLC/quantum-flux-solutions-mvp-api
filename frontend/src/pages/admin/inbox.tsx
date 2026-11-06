import { AdminLayout } from '../../modules/shared/AdminLayout';
import InboxModule from '../../modules/inbox/InboxModule'; // <-- Default Import

export default function AdminInboxPage() {
  return (
    <AdminLayout>
      <InboxModule />
    </AdminLayout>
  );
}
