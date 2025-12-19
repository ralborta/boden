'use client'

import type { WhatsAppConversation } from '@/types/whatsapp'

interface ConversationListItemProps {
  conversation: WhatsAppConversation
  isSelected: boolean
  onClick: () => void
}

export default function ConversationListItem({
  conversation,
  isSelected,
  onClick,
}: ConversationListItemProps) {
  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      } else if (diffDays === 1) {
        return 'Ayer'
      } else if (diffDays < 7) {
        return date.toLocaleDateString('es-ES', { weekday: 'short' })
      } else {
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
      }
    } catch {
      return ''
    }
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-gradient-to-r from-primary-50 to-purple-50 border-l-4 border-primary-600 shadow-sm'
          : 'hover:bg-gray-50 active:bg-gray-100'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0 shadow-md ${
          isSelected 
            ? 'bg-gradient-primary ring-2 ring-primary-300 ring-offset-2' 
            : 'bg-gradient-primary'
        }`}>
          {getInitials(conversation.contactName)}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-sm font-semibold truncate ${
              isSelected ? 'text-gray-900' : 'text-gray-800'
            }`}>
              {conversation.contactName}
            </h3>
            <span className={`text-xs flex-shrink-0 ml-2 ${
              isSelected ? 'text-primary-700 font-medium' : 'text-gray-500'
            }`}>
              {formatTime(conversation.lastMessageAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className={`text-sm truncate ${
              isSelected ? 'text-gray-700' : 'text-gray-600'
            }`}>
              {conversation.lastMessagePreview || 'Sin mensajes'}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs px-2.5 py-1 rounded-full flex-shrink-0 font-semibold shadow-sm min-w-[24px] text-center">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500 truncate">
              {conversation.contactPhone}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(conversation.status)}`}>
              {conversation.status === 'open' ? 'Abierta' : conversation.status === 'pending' ? 'Pendiente' : conversation.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
