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
        // Hoy: mostrar hora
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      } else if (diffDays === 1) {
        return 'Ayer'
      } else if (diffDays < 7) {
        // Esta semana: día de la semana
        return date.toLocaleDateString('es-ES', { weekday: 'short' })
      } else {
        // Más antiguo: fecha
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

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-colors border-b border-border-light ${
        isSelected
          ? 'bg-background-light border-l-4 border-primary'
          : 'hover:bg-background-light'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {getInitials(conversation.contactName)}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-text-light truncate">
              {conversation.contactName}
            </h3>
            <span className="text-xs text-subtext-light flex-shrink-0 ml-2">
              {formatTime(conversation.lastMessageAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-subtext-light truncate">
              {conversation.lastMessagePreview}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs text-subtext-light mt-1 truncate">
            {conversation.contactPhone}
          </p>
        </div>
      </div>
    </div>
  )
}

