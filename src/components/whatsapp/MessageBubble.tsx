'use client'

import type { WhatsAppMessage } from '@/types/whatsapp'

interface MessageBubbleProps {
  message: WhatsAppMessage
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const isAgent = message.from === 'agent'

  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isAgent
            ? 'bg-primary text-white'
            : 'bg-background-light text-text-light border border-border-light'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 ${
          isAgent ? 'text-white/70' : 'text-subtext-light'
        }`}>
          <span className="text-xs">{formatTime(message.sentAt)}</span>
          {isAgent && (
            <span className="text-xs">
              {message.read ? '✓✓' : message.delivered ? '✓' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

