'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, AlertCircle, MessageCircle } from 'lucide-react'
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

  const loadConversations = useCallback(async (showLoading = false) => {
    if (showLoading || conversations.length === 0) {
      setIsLoading(true)
    }
    setError(null)
    try {
      const data = await fetchWhatsAppConversations()
      
      setConversations(prevConversations => {
        const currentIds = new Set(prevConversations.map(c => c.id))
        const newIds = new Set(data.map(c => c.id))
        const hasNewConversations = ![...newIds].every(id => currentIds.has(id))
        const hasRemovedConversations = ![...currentIds].every(id => newIds.has(id))
        
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

  useEffect(() => {
    loadConversations(true)
    
    const interval = setInterval(() => {
      loadConversations(false)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [loadConversations])

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'open' && conv.status !== 'open') return false
    if (filter === 'pending' && conv.status !== 'pending') return false

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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-soft h-full flex flex-col overflow-hidden">
      {/* Encabezado */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Conversaciones</h2>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              filter === 'all'
                ? 'bg-gradient-primary text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              filter === 'open'
                ? 'bg-gradient-primary text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Abiertas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              filter === 'pending'
                ? 'bg-gradient-primary text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Pendientes
          </button>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="ml-3 text-gray-600">Cargando conversaciones...</span>
          </div>
        ) : error ? (
          <div className="p-6 flex items-center gap-3 text-red-600 bg-red-50 m-4 rounded-xl border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">
              {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
            </p>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Las conversaciones aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => onSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
