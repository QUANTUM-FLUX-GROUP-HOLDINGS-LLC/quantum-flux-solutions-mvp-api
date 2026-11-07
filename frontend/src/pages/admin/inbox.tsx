import { useEffect, useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';
import { apiFetch } from '../../modules/shared/api';
import toast from 'react-hot-toast';
import { Search, Loader2, Send } from 'lucide-react';

export default function AdminInbox() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch clients to chat with
    apiFetch<any[]>('/admin/clients')
      .then((data) => setClients(data.filter(c => c.role === 'CLIENT')))
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoadingClients(false));
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    setLoadingMessages(true);
    
    // In a real app, this would be a WebSocket. For now, we poll every 5s.
    const fetchMessages = () => {
      apiFetch<any[]>(`/messages/${selectedClient.id}`)
        .then(setMessages)
        .catch(() => console.error('Failed to load messages'))
        .finally(() => setLoadingMessages(false));
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedClient]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClient) return;

    const content = newMessage;
    setNewMessage('');
    
    try {
      const sentMsg = await apiFetch<any>(`/messages`, {
        method: 'POST',
        body: JSON.stringify({ receiverId: selectedClient.id, content }),
      });
      setMessages((prev) => [...prev, sentMsg]);
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-8rem)] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Sidebar de Clientes */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Inbox</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingClients ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : filteredClients.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No clients found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selectedClient?.id === client.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 text-sm">{client.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{client.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel de Chat */}
        <div className="flex-1 flex flex-col bg-white">
          {!selectedClient ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a client to start chatting.
            </div>
          ) : (
            <>
              {/* Header del Chat */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                <div>
                  <h3 className="font-bold text-gray-900">{selectedClient.name}</h3>
                  <p className="text-xs text-gray-500">{selectedClient.email}</p>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {loadingMessages ? (
                  <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm mt-10">No messages yet. Say hello!</div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.senderId !== selectedClient.id; // Admin is the sender
                    return (
                      <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                          isMe ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
