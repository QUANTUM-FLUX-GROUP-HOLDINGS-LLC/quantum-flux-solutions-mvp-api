import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../shared/api';
import { useAuth } from '../shared/auth-context';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

export const InboxModule = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch clients list on mount
  useEffect(() => {
    if (!user) return;
    const role = user.role || 'USER';
    apiFetch<any[]>(`/admin/clients?role=${role}`)
      .then(data => setClients(data))
      .catch(err => toast.error('Failed to load clients'));
  }, [user]);

  // Fetch messages when a client is selected
  useEffect(() => {
    if (!selectedClient || !user) return;
    // Assuming endpoint format: /messages?user1=ID&user2=ID
    apiFetch<any[]>(`/messages?user1=${user.id}&user2=${selectedClient.id}`)
      .then(data => {
        setMessages(data);
        scrollToBottom();
      })
      .catch(err => toast.error('Failed to load messages'));
  }, [selectedClient, user]);

  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedClient || !user) return;

    setSending(true);
    const payload = {
      receiverId: selectedClient.id,
      content: input.trim(),
    };

    try {
      const newMessage = await apiFetch<any>('/messages', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMessages(prev => [...prev, newMessage]);
      setInput('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Sidebar: Clients List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                selectedClient?.id === client.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50'
              }`}
            >
              <p className="font-semibold text-gray-900 text-sm">{client.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{client.email}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {selectedClient ? (
          <>
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-bold text-gray-800">Chat with {selectedClient.name}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p>No messages yet.</p>
                  <p className="text-sm mt-1">Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === user?.id || msg.sender?.id === user?.id;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                        isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={sending}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || sending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium text-gray-500">Select a client to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};
