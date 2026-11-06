import { PortalLayout } from '../../modules/portal/PortalLayout';
import { CreditRepairModule } from '../../modules/portal/credit-repair/CreditRepairModule';

export default function CreditRepairPage() {
  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Credit Repair Workspace</h1>
      <CreditRepairModule />
    </PortalLayout>
  );
}
