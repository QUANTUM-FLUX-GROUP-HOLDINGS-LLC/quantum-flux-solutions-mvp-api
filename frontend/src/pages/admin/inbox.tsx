import { useState } from 'react';
import { AdminLayout } from '../../modules/shared/AdminLayout';

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState('Staff');

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex overflow-hidden">
          {/* Panel Izquierdo: Lista de Chats */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('Staff')} 
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'Staff' ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Staff
              </button>
              <button 
                onClick={() => setActiveTab('Clients')} 
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'Clients' ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Clients
              </button>
            </div>
            
            {/* Barra de Búsqueda */}
            <div className="p-3 border-b border-gray-100">
              <input type="text" placeholder="Search..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

            {/* Lista de Conversaciones (Vacía por ahora) */}
            <div className="flex-1 overflow-y-auto p-4 text-center text-sm text-gray-500">
              No staff members or conversations found.
            </div>
          </div>

          {/* Panel Derecho: Área de Chat */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">💬</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Select a conversation</h3>
              <p className="text-sm text-gray-500 max-w-xs">Choose a staff member or client from the list, or start a new message.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
