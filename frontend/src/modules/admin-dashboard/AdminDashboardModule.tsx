import Link from 'next/link';

export const AdminDashboardModule = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your organization's activity and performance.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="font-semibold text-gray-800">Finish Setting Up Your Workspace</h2>
          <p className="text-sm text-gray-500">1 of 8 Steps Complete</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mt-2">
            <div className="w-1/8 h-full bg-red-500 rounded-full"></div>
          </div>
        </div>
        <Link href="/admin/setup" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
          Open Setup Guide →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'TOTAL CLIENTS', value: '0', icon: '👥' },
          { label: 'NEW ENROLLMENTS (30D)', value: '0', icon: '👤+' },
          { label: 'TEAM MEMBERS', value: '1', icon: '⭐' },
          { label: 'LETTERS GENERATED', value: '0', icon: '📄' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className="text-2xl bg-gray-50 p-2 rounded-md">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">Client Capacity</span>
            <span className="text-xs text-gray-500">Starter plan</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">0 <span className="text-sm font-normal text-gray-500">/ 500 clients</span></p>
          <div className="w-full h-2 bg-gray-200 rounded-full"><div className="w-0 h-full bg-gray-400 rounded-full"></div></div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">Seat Capacity</span>
            <span className="text-xs text-gray-500">Starter plan</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">1 <span className="text-sm font-normal text-gray-500">/ 3 seats</span></p>
          <div className="w-full h-2 bg-gray-200 rounded-full"><div className="w-1/3 h-full bg-green-500 rounded-full"></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-64"><h3 className="text-sm font-semibold text-gray-800 mb-4">Client Status Breakdown</h3><p className="text-sm text-gray-500">No clients yet.</p></div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-64"><h3 className="text-sm font-semibold text-gray-800 mb-4">Enrollments (Last 6 Months)</h3><p className="text-sm text-gray-500">No enrollments in the last 6 months.</p></div>
      </div>
    </div>
  );
};
