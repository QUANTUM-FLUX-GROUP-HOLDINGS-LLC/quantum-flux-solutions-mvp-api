export const SettingsModule = () => (
  <div className="max-w-5xl mx-auto">
    <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="text-gray-500 text-sm mt-1">Manage Profile and Organization.</p></div>
    <div className="flex border-b border-gray-200 mb-8 overflow-x-auto text-sm">
      {['Profile & Personal', 'Notifications', 'Organization', 'Payments'].map((tab, i) => (
        <button key={tab} className={`pb-3 px-4 font-medium border-b-2 whitespace-nowrap ${i === 0 ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}>{tab}</button>
      ))}
    </div>
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="font-bold text-gray-800 mb-4">Personal Account</h2>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label><input type="text" defaultValue="Admin" className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label><input type="text" defaultValue="User" className="w-full border border-gray-300 rounded-md p-2 text-sm" /></div>
      </div>
      <div className="mt-4 flex justify-end"><button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium">Save Profile</button></div>
    </div>
  </div>
);
