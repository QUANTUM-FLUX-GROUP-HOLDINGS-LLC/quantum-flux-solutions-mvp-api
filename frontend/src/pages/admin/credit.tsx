import { useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';

export default function CreditModule() {
  const [activeTab, setActiveTab] = useState('Active');
  const tabs = ['Active', 'Leads', 'Non-Payment', 'Paused', 'Finished', 'Deleted'];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Clients</h1>
            <p className="text-gray-500 text-sm mt-1">Search, filter, and open client workspaces. Follow-up due dates help prioritize outreach.</p>
          </div>
          <div className="flex gap-2">
            <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <span>👤</span> Lead
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2">
              <span>+</span> New Client
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'TOTAL CLIENTS', value: '0', sub: 'Excludes finished and deleted...' },
            { label: 'NEW ENROLLMENTS (30D)', value: '0', sub: '' },
            { label: 'ACTIVE', value: '0', sub: '' },
            { label: 'NEEDS ATTENTION', value: '0', sub: 'All Clear' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              {stat.sub && <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>}
            </div>
          ))}
        </div>

        {/* Client Directory Panel */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Client Directory</h2>
            <button className="text-sm text-gray-600 font-medium hover:text-gray-900 flex items-center gap-1">
              ✉️ Email Clients
            </button>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-4 border-b border-gray-100 flex gap-4 text-sm overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 border-b-2 font-medium whitespace-nowrap ${
                  activeTab === tab ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab} <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">0</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 flex flex-wrap gap-3 border-b border-gray-100">
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-48">
              <option>All Contracts</option>
            </select>
            <input type="text" placeholder="Search Name, Email, or Phone" className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white flex-1 min-w-[200px]" />
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-40">
              <option>All Providers</option>
            </select>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-40">
              <option>Due Date</option>
            </select>
            <button className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50 flex items-center gap-2">
              🔄 Check Monitoring Status
            </button>
          </div>

          {/* Empty State */}
          <div className="p-12 text-center text-gray-500 text-sm">
            No clients match these filters.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
