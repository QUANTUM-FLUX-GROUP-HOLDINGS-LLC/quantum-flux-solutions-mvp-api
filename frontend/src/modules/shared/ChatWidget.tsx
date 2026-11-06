import { useState, useEffect } from 'react';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const myId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').id : '';
  const adminId = 'admin-id-placeholder'; // En producción, esto debería ser el ID del admin asignado

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMsg = { senderId: myId, receiverId: adminId, content: input };
    setMessages([...messages, { ...newMsg, id: Date.now().toString(), createdAt: new Date() }]);
    setInput('');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://quantum-flux-api-npru.onrender.com'}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 h-96 rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Soporte Interno</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 font-bold">×</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.senderId === myId ? 'bg-indigo-500 text-white self-end' : 'bg-white border text-gray-800 self-start'}`}>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="p-3 border-t bg-white flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Escribe un mensaje..." className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none" />
            <button onClick={handleSend} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium">Enviar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}
    </div>
  );
};
