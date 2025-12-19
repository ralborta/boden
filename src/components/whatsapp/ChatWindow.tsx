'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, AlertCircle, Phone, Video, MoreVertical } from 'lucide-react'
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
      loadMessages(true)
      
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
      await loadMessages(false)
    } catch (error) {
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
      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl shadow-soft h-full flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Selecciona una conversación</h3>
          <p className="text-sm text-gray-500">Elige un chat de la lista para comenzar a conversar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-soft h-full flex flex-col overflow-hidden">
      {/* Header */}
      {conversation && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 border-b border-primary-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 border-2 border-white/30">
                {conversation.contactName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{conversation.contactName}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  <span className="text-sm text-white/90">{conversation.contactPhone}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cuerpo de mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-gray-50/50 to-white">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="ml-3 text-gray-600">Cargando mensajes...</span>
          </div>
        ) : errorMessages ? (
          <div className="flex items-center gap-3 text-red-600 p-6 bg-red-50 rounded-xl border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{errorMessages}</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-1">No hay mensajes aún</p>
            <p className="text-sm text-gray-500">Envía el primer mensaje para comenzar</p>
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
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
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
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none overflow-hidden max-h-[120px] bg-gray-50 transition-all"
              style={{ minHeight: '44px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 rounded-full hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
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
