import { useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';

export default function LetterLibrary() {
  const [activeTab, setActiveTab] = useState('Workflows');

  const workflows = [
    { title: 'Charge-Off', steps: '4 Steps', tags: ['Bureaus', 'One Per Bureau'], desc: '1. Step 1 – Credit Bureau Dispute Letter (FCRA §611)\n2. Step 2 – Method of Verification Letter\n3. Step 3 – Direct Furnisher Dispute Letter (FCRA §623(a)(8))\n4. Step 4 – Pre-Demand Notice' },
    { title: 'Debt Collection', steps: '3 Steps', tags: ['Furnisher'], desc: '1. Step 1 – Investigation + Formal Dispute\n2. Step 2 – Notice of FDCPA Violation & Intent to File Complaints\n3. Step 3 – Pre-Demand Notice' },
    { title: 'Repossession', steps: '4 Steps', tags: ['Lender'], desc: '1. Step 1 – Request for Documentation\n2. Step 2 – Notice of Violation & Demand for Deletion\n3. Step 3 – Credit Bureau Dispute\n4. Step 4 – Pre-Demand Notice' },
    { title: 'Late Payment', steps: '4 Steps', tags: ['Bureaus', 'Furnisher'], desc: '1. Step 1 – Credit Bureau Dispute Letter (FCRA §611)\n2. Step 2 – Method of Verification Letter\n3. Step 3 – Direct Furnisher Dispute Letter\n4. Step 4 – Pre-Demand Notice' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Letters & Workflows</h1>
          <p className="text-gray-500 text-sm mt-1">A letter template is one letter and who it goes to. A workflow is a sequence of those letters, sent round after round.</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button className="border border-gray-300 bg-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">↓ Export Library</button>
          <button className="border border-gray-300 bg-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">↑ Import Library</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('Workflows')} className={`pb-3 px-4 text-sm font-medium border-b-2 ${activeTab === 'Workflows' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}>Workflows</button>
          <button onClick={() => setActiveTab('Templates')} className={`pb-3 px-4 text-sm font-medium border-b-2 ${activeTab === 'Templates' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}>Letter Templates</button>
        </div>

        {activeTab === 'Workflows' && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-4">Suggested Workflows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflows.map((wf, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm relative">
                  <span className="absolute top-4 right-4 bg-black text-white text-[10px] font-bold px-2 py-1 rounded">VSP Suggested</span>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{wf.title}</h3>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{wf.steps}</span>
                    {wf.tags.map(tag => <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{tag}</span>)}
                  </div>
                  <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{wf.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
