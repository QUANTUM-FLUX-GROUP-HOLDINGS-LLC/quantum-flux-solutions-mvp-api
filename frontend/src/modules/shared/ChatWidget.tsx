import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './auth-context';
import { apiFetch } from './api';
import toast from 'react-hot-toast';
import { Send, MessageCircle, X } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

const POLL_INTERVAL_MS = 5000;

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const myId = user?.id || '';
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agentUnavailable, setAgentUnavailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resolve the support agent once the user is known.
  useEffect(() => {
    if (!myId) return;
    apiFetch<{ id: string }>('/messages/support-agent')
      .then((agent) => {
        setAgentId(agent?.id || null);
        setAgentUnavailable(!agent?.id);
      })
      .catch(() => setAgentUnavailable(true));
  }, [myId]);

  const loadMessages = useCallback(async () => {
    if (!myId || !agentId) return;
    try {
      const data = await apiFetch<Message[]>(`/messages?user1=${myId}&user2=${agentId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      // Silent: the widget polls periodically, transient failures self-heal.
    }
  }, [myId, agentId]);

  // Poll for new messages while the widget is open.
  useEffect(() => {
    if (!isOpen || !myId || !agentId) return;
    void loadMessages();
    const interval = setInterval(() => void loadMessages(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isOpen, myId, agentId, loadMessages]);

  // Auto-scroll to bottom.
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
      100,
    );
    return () => clearTimeout(timer);
  }, [messages, isOpen]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !agentId || sending || !myId) return;

    setSending(true);

    // Optimistic message; removed from the list if the request fails.
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      senderId: myId,
      receiverId: agentId,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput('');

    try {
      await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: agentId, content }),
      });
      // Refresh to replace the optimistic message with the persisted one.
      void loadMessages();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInput(content);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 h-96 rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Support Chat</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {agentUnavailable ? (
              <div className="text-center text-gray-400 text-sm mt-10">
                Support is not available right now. Please try again later.
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm mt-10">
                Start a conversation with support.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.senderId === myId
                      ? 'bg-indigo-500 text-white self-end rounded-br-none'
                      : 'bg-white border text-gray-800 self-start rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Type a message..."
              aria-label="Message"
              disabled={sending || agentUnavailable}
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!input.trim() || sending || agentUnavailable}
              aria-label="Send message"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open support chat"
          className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
