import { PortalLayout } from '../../modules/portal/PortalLayout';
import { PersonalTaxModule } from '../../modules/portal/tax-personal/PersonalTaxModule';

export default function TaxPersonalPage() {
  return (
    <PortalLayout>
      <PersonalTaxModule />
    </PortalLayout>
  );
}
