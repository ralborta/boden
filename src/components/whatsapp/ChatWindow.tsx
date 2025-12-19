'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { fetchWhatsAppMessages, sendWhatsAppMessage } from '@/lib/api/whatsapp'
import { fetchWhatsAppConversations } from '@/lib/api/whatsapp'
import type { WhatsAppMessage, WhatsAppConversation } from '@/types/whatsapp'
import MessageBubble from './MessageBubble'

interface ChatWindowProps {
  conversationId: string | null
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [conversation, setConversation] = useState<WhatsAppConversation | null>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [errorMessages, setErrorMessages] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadConversation = async () => {
    if (!conversationId) return
    try {
      const conversations = await fetchWhatsAppConversations()
      const found = conversations.find((c) => c.id === conversationId)
      if (found) {
        setConversation(found)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const loadMessages = useCallback(async (showLoading = false) => {
    if (!conversationId) return

    // Solo mostrar loading en la primera carga o si se solicita explícitamente
    setMessages(prevMessages => {
      const wasEmpty = prevMessages.length === 0
      if (showLoading || wasEmpty) {
        setIsLoadingMessages(true)
      }
      return prevMessages
    })
    
    setErrorMessages(null)
    try {
      const data = await fetchWhatsAppMessages(conversationId)
      
      setMessages(prevMessages => {
        // Comparar de manera más robusta: por IDs de todos los mensajes
        const currentIds = new Set(prevMessages.map(m => m.id))
        const newIds = new Set(data.map(m => m.id))
        const hasChanges = 
          currentIds.size !== newIds.size ||
          ![...newIds].every(id => currentIds.has(id)) ||
          ![...currentIds].every(id => newIds.has(id))
        
        if (hasChanges || prevMessages.length === 0) {
          return data
        }
        return prevMessages
      })
    } catch (error) {
      setErrorMessages(
        error instanceof Error ? error.message : 'No se pudieron cargar los mensajes'
      )
    } finally {
      setIsLoadingMessages(false)
    }
  }, [conversationId])

  useEffect(() => {
    if (conversationId) {
      loadConversation()
      // Primera carga con loading
      loadMessages(true)
      
      // Polling para actualizar mensajes cada 5 segundos (sin mostrar loading)
      const interval = setInterval(() => {
        loadMessages(false)
      }, 5000)
      
      return () => clearInterval(interval)
    } else {
      setMessages([])
      setConversation(null)
    }
  }, [conversationId, loadMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!conversationId || !messageText.trim() || isSending) return

    const textToSend = messageText.trim()
    setMessageText('')
    setIsSending(true)

    try {
      const newMessage = await sendWhatsAppMessage(conversationId, textToSend)
      // Recargar mensajes inmediatamente después de enviar (sin mostrar loading)
      await loadMessages(false)
    } catch (error) {
      // Restaurar texto si hay error
      setMessageText(textToSend)
      alert(error instanceof Error ? error.message : 'No se pudo enviar el mensaje')
    } finally {
      setIsSending(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [messageText])

  if (!conversationId) {
    return (
      <div className="bg-card-light border border-border-light rounded-xl shadow-soft h-full flex items-center justify-center">
        <div className="text-center text-subtext-light">
          <p className="text-lg mb-2">Selecciona una conversación para comenzar</p>
          <p className="text-sm">Elige un chat de la lista para ver los mensajes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card-light border border-border-light rounded-xl shadow-soft h-full flex flex-col">
      {/* Header */}
      {conversation && (
        <div className="p-4 border-b border-border-light">
          <h3 className="text-lg font-semibold text-text-light">{conversation.contactName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-subtext-light">{conversation.contactPhone}</p>
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-xs text-green-600">En línea</span>
          </div>
        </div>
      )}

      {/* Cuerpo de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="ml-2 text-subtext-light">Cargando mensajes...</span>
          </div>
        ) : errorMessages ? (
          <div className="flex items-center gap-2 text-red-600 p-4">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{errorMessages}</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-subtext-light py-8">
            <p>No hay mensajes aún</p>
            <p className="text-xs mt-1">Envía el primer mensaje para comenzar</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Footer - Barra de envío */}
      <div className="p-4 border-t border-border-light">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value)
              adjustTextareaHeight()
            }}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={isSending}
            rows={1}
            className="flex-1 rounded-full border border-border-light px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none overflow-hidden max-h-[120px]"
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Enviar mensaje"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

