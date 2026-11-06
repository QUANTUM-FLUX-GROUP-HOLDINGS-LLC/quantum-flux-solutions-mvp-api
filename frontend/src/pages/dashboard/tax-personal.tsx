import { PortalLayout } from '../../modules/portal/PortalLayout';
import { PersonalTaxModule } from '../../modules/portal/tax-personal/PersonalTaxModule';

export default function TaxPersonalPage() {
  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Personal Tax Workspace</h1>
      <PersonalTaxModule />
    </PortalLayout>
  );
}
