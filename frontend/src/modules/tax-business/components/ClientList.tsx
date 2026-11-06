export const ClientList = ({ clients, selected, onSelect, loading }: any) => (
  <div className="w-1/3 bg-[#1A1A1A] text-white rounded-lg overflow-hidden flex flex-col shadow-lg">
    <div className="p-4 border-b border-gray-800 bg-[#222]">
      <h2 className="font-bold text-lg">Corporate Clients</h2>
    </div>
    <div className="flex-1 overflow-y-auto">
      {loading ? <p className="p-4 text-gray-400 text-sm">Loading...</p> : clients.length === 0 ? <p className="p-4 text-gray-400 text-sm">No clients found.</p> : clients.map((client: any) => (
        <div key={client.id} onClick={() => onSelect(client)} className={`p-4 border-b border-gray-800 cursor-pointer transition ${selected?.id === client.id ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}>
          <p className="font-medium text-white">{client.name || 'Unnamed'}</p>
          <p className="text-xs text-gray-400">{client.email}</p>
        </div>
      ))}
    </div>
  </div>
);
