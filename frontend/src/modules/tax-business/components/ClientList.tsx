import { Loader2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ClientListProps {
  clients: Client[];
  selected: Client | null;
  onSelect: (client: Client) => void;
  loading: boolean;
}

export const ClientList = ({ clients, selected, onSelect, loading }: ClientListProps) => (
  <div className="w-1/3 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <h2 className="font-bold text-gray-800">Corporate Clients</h2>
    </div>
    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-label="Loading clients" />
        </div>
      ) : clients.length === 0 ? (
        <p className="p-6 text-center text-gray-500 text-sm">No clients found.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {clients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => onSelect(client)}
              className={`w-full text-left p-4 transition-colors ${
                selected?.id === client.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <p className="font-medium text-gray-900">{client.name || 'Unnamed'}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{client.email}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);
