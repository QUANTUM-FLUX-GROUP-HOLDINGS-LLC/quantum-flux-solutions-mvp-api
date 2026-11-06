export const ClientDirectory = ({ clients, loading }: { clients: any[], loading: boolean }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Client Directory</h2>
        <button className="text-sm text-gray-600 font-medium hover:text-gray-900 flex items-center gap-1">✉️ Email Clients</button>
      </div>

      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No clients match these filters.</div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                  {client.name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{client.name || 'Unnamed Client'}</p>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{client.role}</span>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
