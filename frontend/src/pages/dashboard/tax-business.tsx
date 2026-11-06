import { PortalLayout } from '../../modules/portal/PortalLayout';
import { BusinessTaxModule } from '../../modules/portal/tax-business/BusinessTaxModule';

export default function TaxBusinessPage() {
  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Business Tax Workspace</h1>
      <BusinessTaxModule />
    </PortalLayout>
  );
}
