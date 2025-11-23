'use client'

import { useState } from 'react'
import ConversationList from '@/components/whatsapp/ConversationList'
import ChatWindow from '@/components/whatsapp/ChatWindow'

export default function WhatsAppPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    <div className="h-full flex flex-col">
      {/* Título y subtítulo */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-light mb-2">WhatsApp</h1>
        <p className="text-subtext-light">
          Centralizá las conversaciones de tu asistente con los clientes.
        </p>
      </div>

      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)] gap-4 flex-1 min-h-0">
        {/* Columna izquierda: Lista de conversaciones */}
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />

        {/* Columna derecha: Ventana de chat */}
        <ChatWindow conversationId={selectedConversationId} />
      </div>
    </div>
  )
}

