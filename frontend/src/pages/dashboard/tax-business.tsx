import { PortalLayout } from '../../modules/portal/PortalLayout';
import { BusinessTaxModule } from '../../modules/portal/tax-business/BusinessTaxModule';

export default function TaxBusinessPage() {
  return (
    <PortalLayout>
      <BusinessTaxModule />
    </PortalLayout>
  );
}
