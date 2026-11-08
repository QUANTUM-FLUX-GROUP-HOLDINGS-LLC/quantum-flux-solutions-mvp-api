import type { AdminClient } from '../CreditModule';

interface ClientDirectoryProps {
  clients: AdminClient[];
  loading: boolean;
}

export const ClientDirectory = ({ clients, loading }: ClientDirectoryProps) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    <div className="p-4 border-b border-gray-100">
      <h2 className="font-semibold text-gray-800">Client Directory</h2>
    </div>

    <div className="divide-y divide-gray-100">
      {loading ? (
        <div className="p-12 text-center text-gray-500 text-sm">Loading clients…</div>
      ) : clients.length === 0 ? (
        <div className="p-12 text-center text-gray-500 text-sm">No clients found.</div>
      ) : (
        clients.map((client) => (
          <div key={client.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                {(client.name?.charAt(0) || client.email.charAt(0)).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{client.name || 'Unnamed Client'}</p>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              {client.role}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);
