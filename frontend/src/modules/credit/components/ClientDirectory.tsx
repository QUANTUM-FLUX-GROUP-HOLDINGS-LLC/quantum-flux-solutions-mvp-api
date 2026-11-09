import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { AdminClient } from '../CreditModule';

interface ClientDirectoryProps {
  clients: AdminClient[];
  loading: boolean;
  onEdit: (client: AdminClient) => void;
  onDelete: (client: AdminClient) => void;
}

export const ClientDirectory = ({ clients, loading, onEdit, onDelete }: ClientDirectoryProps) => {
  // Id of the row whose delete action is awaiting inline confirmation.
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
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
            <div
              key={client.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                  {(client.name?.charAt(0) || client.email.charAt(0)).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{client.name || 'Unnamed Client'}</p>
                  <p className="text-sm text-gray-500 truncate">{client.email}</p>
                </div>
              </div>

              {confirmId === client.id ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-600 font-medium hidden sm:inline">Delete?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmId(null);
                      onDelete(client);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {client.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEdit(client)}
                    aria-label={`Edit ${client.name || client.email}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(client.id)}
                    aria-label={`Delete ${client.name || client.email}`}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
