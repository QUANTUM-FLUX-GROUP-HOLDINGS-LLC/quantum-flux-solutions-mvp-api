import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';
import { apiFetch } from '../../modules/shared/api';
import toast from 'react-hot-toast';
import { Search, Loader2, Send, AlertCircle } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

const POLL_INTERVAL_MS = 5000;

export default function AdminInbox() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [pollError, setPollError] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<Client[]>('/admin/clients')
      .then((data) => setClients((data ?? []).filter((c) => c.role === 'CLIENT')))
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoadingClients(false));
  }, []);

  const loadMessages = useCallback(async () => {
    if (!selectedClient) return;
    try {
      const data = await apiFetch<Message[]>(`/messages/${selectedClient.id}`);
      // Merge by id to avoid duplicates between the optimistic send and the poll.
      setMessages((prev) => {
        const seen = new Set(data.map((m) => m.id));
        const local = prev.filter((m) => !seen.has(m.id));
        const merged = [...local, ...data];
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return merged;
      });
      setPollError(false);
    } catch {
      setPollError(true);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (!selectedClient) return;
    setLoadingMessages(true);
    setMessages([]);
    setPollError(false);

    // TODO: replace polling with a WebSocket connection for true real-time updates.
    void loadMessages();
    const interval = setInterval(() => void loadMessages(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selectedClient, loadMessages]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    const timer = setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
      100,
    );
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClient || sending) return;

    setSending(true);
    try {
      const sent = await apiFetch<Message>('/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: selectedClient.id, content: newMessage.trim() }),
      });
      setMessages((prev) => [...prev, sent]);
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-8rem)] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* Client list sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Inbox</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search clients"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingClients ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-label="Loading clients" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No clients found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedClient(client)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selectedClient?.id === client.id
                        ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                        : 'hover:bg-gray-100 border-l-4 border-transparent'
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

        {/* Chat panel */}
        <div className="flex-1 flex flex-col bg-white">
          {!selectedClient ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a client to start chatting.
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                <div>
                  <h3 className="font-bold text-gray-900">{selectedClient.name}</h3>
                  <p className="text-xs text-gray-500">{selectedClient.email}</p>
                </div>
                {pollError && (
                  <span className="flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" /> Connection issue — retrying…
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {loadingMessages ? (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-label="Loading messages" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm mt-10">No messages yet. Say hello!</div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId !== selectedClient.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {msg.content}
                          <span className={`block text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message composer */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    aria-label="Message"
                    disabled={sending}
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    aria-label="Send message"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
