'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import ConversationList from '@/components/whatsapp/ConversationList'
import ChatWindow from '@/components/whatsapp/ChatWindow'

export default function WhatsAppPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    <div className="h-full flex flex-col">
      {/* Título y subtítulo */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">WhatsApp</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Centralizá las conversaciones de tu asistente con los clientes
            </p>
          </div>
        </div>
      </div>

      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-6 flex-1 min-h-0">
        {/* Columna izquierda: Lista de conversaciones */}
        <div className="h-full min-h-0">
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>

        {/* Columna derecha: Ventana de chat */}
        <div className="h-full min-h-0">
          <ChatWindow conversationId={selectedConversationId} />
        </div>
      </div>
    </div>
  )
}
