import { useState } from 'react';
export const LetterLibraryModule = () => {
  const [activeTab, setActiveTab] = useState('Workflows');
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Letters & Workflows</h1></div>
      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('Workflows')} className={`pb-3 px-4 text-sm font-medium border-b-2 ${activeTab === 'Workflows' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}>Workflows</button>
        <button onClick={() => setActiveTab('Templates')} className={`pb-3 px-4 text-sm font-medium border-b-2 ${activeTab === 'Templates' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}>Letter Templates</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Charge-Off', 'Debt Collection', 'Repossession', 'Late Payment'].map((title) => (
          <div key={title} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm relative">
            <span className="absolute top-4 right-4 bg-black text-white text-[10px] font-bold px-2 py-1 rounded">Suggested</span>
            <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
            <p className="text-xs text-gray-600">Step 1 – Credit Bureau Dispute Letter<br/>Step 2 – Method of Verification</p>
          </div>
        ))}
      </div>
    </div>
  );
};
