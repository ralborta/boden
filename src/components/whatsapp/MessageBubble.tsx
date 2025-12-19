'use client'

import type { WhatsAppMessage } from '@/types/whatsapp'
import { Check, CheckCheck } from 'lucide-react'

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
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-3 group`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 ${
          isAgent
            ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md hover:shadow-md'
        }`}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </p>
        <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${
          isAgent ? 'text-white/80' : 'text-gray-500'
        }`}>
          <span className="text-[11px] font-medium">{formatTime(message.sentAt)}</span>
          {isAgent && (
            <span className="flex items-center">
              {message.read ? (
                <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
              ) : message.delivered ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
