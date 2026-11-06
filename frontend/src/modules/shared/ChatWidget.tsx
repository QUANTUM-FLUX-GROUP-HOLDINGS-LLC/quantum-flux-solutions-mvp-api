import { useState, useEffect, useRef } from 'react';
import { useAuth } from './auth-context';
import { apiFetch } from './api';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const { user } = useAuth();
  const myId = user?.id || '';
  const [agentId, setAgentId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isOpen]);

  // Fetch Admin ID
  useEffect(() => {
    if (!myId) return;
    apiFetch<{ id: string }>('/messages/support-agent')
      .then((agent) => setAgentId(agent?.id || null))
      .catch((err) => console.error('Could not find support agent', err));
  }, [myId]);

  // Fetch messages when opened
  useEffect(() => {
    if (!isOpen || !myId || !agentId) return;
    apiFetch<any[]>(`/messages?user1=${myId}&user2=${agentId}`)
      .then((data) => setMessages(data))
      .catch((err) => console.error(err));
  }, [isOpen, myId, agentId]);

  const handleSend = async () => {
    if (!input.trim() || !agentId) return;
    const payload = { senderId: myId, receiverId: agentId, content: input };
    
    // Optimistic UI update
    const optimisticMsg = { ...payload, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput('');

    try {
      await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 h-96 rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Support Chat</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 font-bold text-xl leading-none">&times;</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm mt-10">Start a conversation with support.</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.senderId === myId ? 'bg-indigo-500 text-white self-end' : 'bg-white border text-gray-800 self-start'}`}>
                  {msg.content}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t bg-white flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <button onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md transition flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition flex items-center justify-center relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}
    </div>
  );
};
