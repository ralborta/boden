'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { fetchWhatsAppConversations } from '@/lib/api/whatsapp'
import type { WhatsAppConversation } from '@/types/whatsapp'
import ConversationListItem from './ConversationListItem'

interface ConversationListProps {
  selectedConversationId: string | null
  onSelect: (conversationId: string) => void
}

type FilterType = 'all' | 'open' | 'pending'

export default function ConversationList({
  selectedConversationId,
  onSelect,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Primera carga con loading
    loadConversations(true)
    
    // Polling para actualizar conversaciones cada 5 segundos (sin mostrar loading)
    const interval = setInterval(() => {
      loadConversations(false)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [loadConversations])

  const loadConversations = useCallback(async (showLoading = false) => {
    // Solo mostrar loading en la primera carga o si se solicita explícitamente
    if (showLoading || conversations.length === 0) {
      setIsLoading(true)
    }
    setError(null)
    try {
      const data = await fetchWhatsAppConversations()
      
      setConversations(prevConversations => {
        // Solo actualizar si hay cambios reales (comparar por IDs y lastMessageAt)
        const currentIds = new Set(prevConversations.map(c => c.id))
        const newIds = new Set(data.map(c => c.id))
        const hasNewConversations = ![...newIds].every(id => currentIds.has(id))
        const hasRemovedConversations = ![...currentIds].every(id => newIds.has(id))
        
        // Comparar si algún mensaje cambió (por lastMessageAt)
        const hasMessageChanges = prevConversations.some(conv => {
          const newConv = data.find(c => c.id === conv.id)
          return newConv && newConv.lastMessageAt !== conv.lastMessageAt
        })
        
        if (hasNewConversations || hasRemovedConversations || hasMessageChanges || prevConversations.length === 0) {
          return data
        }
        return prevConversations
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las conversaciones')
    } finally {
      setIsLoading(false)
    }
  }, [conversations.length])

  const filteredConversations = conversations.filter((conv) => {
    // Filtro por estado
    if (filter === 'open' && conv.status !== 'open') return false
    if (filter === 'pending' && conv.status !== 'pending') return false

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return (
        conv.contactName.toLowerCase().includes(query) ||
        conv.contactPhone.includes(query) ||
        conv.lastMessagePreview.toLowerCase().includes(query)
      )
    }

    return true
  })

  return (
    <div className="bg-card-light border border-border-light rounded-xl shadow-soft h-full flex flex-col">
      {/* Encabezado */}
      <div className="p-4 border-b border-border-light">
        <h2 className="text-lg font-semibold text-text-light mb-4">Conversaciones</h2>

        {/* Filtros */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-background-light text-subtext-light hover:text-text-light'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'open'
                ? 'bg-primary text-white'
                : 'bg-background-light text-subtext-light hover:text-text-light'
            }`}
          >
            Abiertas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-primary text-white'
                : 'bg-background-light text-subtext-light hover:text-text-light'
            }`}
          >
            Pendientes
          </button>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-subtext-light" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="ml-2 text-subtext-light">Cargando conversaciones...</span>
          </div>
        ) : error ? (
          <div className="p-4 flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-subtext-light text-sm">
            {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

