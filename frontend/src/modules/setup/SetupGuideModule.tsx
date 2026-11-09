import { useState } from 'react';
import { InviteTeamModal } from './components/InviteTeamModal';

export const SetupGuideModule = () => {
  const [openStep, setOpenStep] = useState<number | null>(1);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const steps = [
    { id: 1, title: 'Invite Your Team', desc: 'Add the staff who will work your clients and set their access level.', action: 'Invite Team Members' },
    { id: 2, title: 'Brand Your Client Portal', desc: 'Upload your company logo and pick the accent color your clients see.', action: 'Upload Logo' },
    { id: 3, title: 'Connect Credit Monitoring', desc: 'Link SmartCredit, MyFreeScoreNow, or both to pull credit reports.', action: 'Connect SmartCredit' },
    { id: 4, title: 'Set Up Client Payments', desc: 'Connect eCrypt to collect client payments inside VSP.', action: 'Connect eCrypt' },
    { id: 5, title: 'Choose How Clients Are Assigned', desc: 'Decide whether new clients rotate across your team or go to one person.', action: 'Configure Assignment' },
    { id: 6, title: 'Create Your Client Agreement', desc: 'Build the agreement your clients e-sign before work begins.', action: 'Create Agreement' },
    { id: 7, title: 'Create Your First Letter', desc: 'See how letters and dispute workflows come together in the Letter Library.', action: 'Open Letter Library' },
    { id: 8, title: 'Set Mailing Preferences', desc: 'Confirm how letters print and add the prepaid credits that pay for postage.', action: 'Buy Mailing Credits' },
  ];

  const handleAction = (stepId: number) => {
    if (stepId === 1) setIsInviteModalOpen(true);
    // Add logic for the remaining steps here
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Setup Guide</h1>
        <p className="text-gray-500 text-sm mt-1">Get your workspace ready to take on clients. Every step is optional, but VSP works best with all of them in place.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 flex items-center justify-between shadow-sm">
        <div>
          <p className="font-bold text-gray-800">1 Of 8 Steps Complete</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mt-2">
            <div className="w-1/8 h-full bg-red-500 rounded-full"></div>
          </div>
        </div>
        <span className="text-sm text-gray-500">13%</span>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <button 
              onClick={() => setOpenStep(openStep === step.id ? null : step.id)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4 text-left">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step.id === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {step.id === 1 ? '✓' : step.id}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
              <span className="text-gray-400">{openStep === step.id ? '▲' : '▼'}</span>
            </button>
            
            {openStep === step.id && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-600 mb-4">{step.desc}</p>
                <button onClick={() => handleAction(step.id)} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition">
                  {step.action} →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <InviteTeamModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  );
};
