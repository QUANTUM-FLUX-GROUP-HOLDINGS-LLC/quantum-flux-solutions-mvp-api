import { useState, useEffect } from 'react';

export const InboxModule = () => {
  const [activeTab, setActiveTab] = useState('Clients');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const myId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').id : '';

  // Cargar lista de clientes
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/admin/clients?role=ADMIN`)
      .then(res => res.json())
      .then(data => setClients(Array.isArray(data) ? data : []));
  }, []);

  // Cargar mensajes al seleccionar cliente
  useEffect(() => {
    if (selectedClient && myId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/messages?user1=${myId}&user2=${selectedClient.id}`)
        .then(res => res.json())
        .then(data => setMessages(Array.isArray(data) ? data : []));
    }
  }, [selectedClient, myId]);

  const handleSend = async () => {
    if (!input.trim() || !selectedClient) return;
    const newMsg = { senderId: myId, receiverId: selectedClient.id, content: input };
    setMessages([...messages, { ...newMsg, id: Date.now().toString(), createdAt: new Date() }]); // Optimistic update
    setInput('');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4"><h1 className="text-2xl font-bold text-gray-900">Inbox</h1></div>
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex overflow-hidden">
        
        {/* Lista de Clientes */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="flex border-b border-gray-200">
            <button className="flex-1 py-3 text-sm font-medium text-gray-900 bg-gray-50 border-b-2 border-gray-900">Clients</button>
          </div>
          <div className="p-3 border-b border-gray-100"><input type="text" placeholder="Search..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
          <div className="flex-1 overflow-y-auto">
            {clients.map(c => (
              <div key={c.id} onClick={() => setSelectedClient(c)} className={`p-4 border-b border-gray-100 cursor-pointer ${selectedClient?.id === c.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50'}`}>
                <p className="font-medium text-gray-900">{c.name || 'Unnamed'}</p>
                <p className="text-xs text-gray-500">{c.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Área de Chat */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedClient ? (
            <>
              <div className="p-4 bg-white border-b border-gray-200 font-medium text-gray-800">Chat with {selectedClient.name}</div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(m => (
                  <div key={m.id} className={`max-w-[70%] p-3 rounded-lg text-sm ${m.senderId === myId ? 'bg-indigo-600 text-white self-end ml-auto' : 'bg-white border border-gray-200 text-gray-800 mr-auto'}`}>
                    {m.content}
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
                <button onClick={handleSend} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium">Send</button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl mb-2">💬</span>
              <p>Select a client to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
