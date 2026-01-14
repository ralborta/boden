'use client'

import type { WhatsAppMessage } from '@/types/whatsapp'
import { Check, CheckCheck, Image as ImageIcon, Video, FileText, Music, Download } from 'lucide-react'
import { useState } from 'react'

interface MessageBubbleProps {
  message: WhatsAppMessage
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const isAgent = message.from === 'agent'
  
  // Validar que mediaUrl sea válido (string o objeto con propiedades)
  const hasMedia = !!message.mediaUrl && (
    typeof message.mediaUrl === 'string' || 
    (typeof message.mediaUrl === 'object' && message.mediaUrl !== null)
  )
  const mediaType = message.mediaType || 'image'

  const getMediaIcon = () => {
    switch (mediaType) {
      case 'video':
        return <Video className="w-5 h-5" />
      case 'document':
        return <FileText className="w-5 h-5" />
      case 'audio':
        return <Music className="w-5 h-5" />
      default:
        return <ImageIcon className="w-5 h-5" />
    }
  }

  // Construir URL de imagen - usar proxy si es necesario
  const getImageUrl = (): string | null => {
    // Asegurarse de que mediaUrl sea una cadena
    let mediaUrlStr: string | null = null
    
    if (!message.mediaUrl) {
      return null
    }
    
    // Si es un objeto, intentar extraer la URL
    if (typeof message.mediaUrl === 'object' && message.mediaUrl !== null) {
      console.warn('[MessageBubble] mediaUrl es un objeto, intentando extraer URL:', {
        keys: Object.keys(message.mediaUrl),
        hasUrl: !!(message.mediaUrl as any)?.url,
        hasMediaUrl: !!(message.mediaUrl as any)?.mediaUrl,
        hasDirectPath: !!(message.mediaUrl as any)?.directPath,
      })
      mediaUrlStr = (message.mediaUrl as any)?.url || 
                    (message.mediaUrl as any)?.mediaUrl || 
                    (message.mediaUrl as any)?.directPath || 
                    (message.mediaUrl as any)?.href ||
                    null
      
      // Si aún no tenemos una URL, intentar convertir el objeto a string
      if (!mediaUrlStr) {
        try {
          const stringified = JSON.stringify(message.mediaUrl)
          console.warn('[MessageBubble] No se pudo extraer URL del objeto, usando string completo:', stringified.substring(0, 100))
          // No usar el string completo como URL, retornar null
          return null
        } catch (err) {
          console.error('[MessageBubble] Error al convertir mediaUrl objeto a string:', err)
          return null
        }
      }
    } else if (typeof message.mediaUrl === 'string') {
      mediaUrlStr = message.mediaUrl
    } else {
      // Otro tipo, intentar convertir
      mediaUrlStr = String(message.mediaUrl)
    }
    
    if (!mediaUrlStr || mediaUrlStr.trim() === '') {
      return null
    }
    
    // Si la URL empieza con "builderbot:" o es un mediaKey, usar proxy
    if (mediaUrlStr.startsWith('builderbot:') || message.mediaKey) {
      const key = message.mediaKey || mediaUrlStr.replace('builderbot:', '')
      if (key) {
        return `/api/whatsapp/media?key=${encodeURIComponent(key)}&messageId=${encodeURIComponent(message.id)}&conversationId=${encodeURIComponent(message.conversationId)}`
      }
    }
    
    // Si la URL no es accesible directamente (no empieza con http), usar proxy
    if (!mediaUrlStr.startsWith('http://') && !mediaUrlStr.startsWith('https://')) {
      return `/api/whatsapp/media?url=${encodeURIComponent(mediaUrlStr)}&messageId=${encodeURIComponent(message.id)}`
    }
    
    // URL directa, usar tal cual
    return mediaUrlStr
  }

  const renderMedia = () => {
    if (!hasMedia) return null

    const imageUrl = getImageUrl()

    if (mediaType === 'image' && !imageError && imageUrl) {
      return (
        <div className="mb-2 rounded-xl overflow-hidden relative">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={message.caption || 'Imagen'}
            className={`w-full max-w-md h-auto object-cover rounded-xl ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            } transition-opacity duration-300`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              // Convertir mediaUrl a string para logging seguro
              let originalUrlStr = 'N/A'
              try {
                if (message.mediaUrl) {
                  if (typeof message.mediaUrl === 'string') {
                    originalUrlStr = message.mediaUrl
                  } else if (typeof message.mediaUrl === 'object') {
                    originalUrlStr = JSON.stringify(message.mediaUrl).substring(0, 200)
                  } else {
                    originalUrlStr = String(message.mediaUrl)
                  }
                }
              } catch (err) {
                originalUrlStr = '[Error serializando mediaUrl]'
              }
              
              console.error('[MessageBubble] Error cargando imagen:', {
                imageUrl,
                originalUrl: originalUrlStr,
                mediaKey: message.mediaKey,
                mediaType: message.mediaType,
                messageId: message.id,
                error: e,
              })
              setImageError(true)
              setImageLoading(false)
            }}
          />
        </div>
      )
    }

    // Para otros tipos de media, mostrar un placeholder con icono
    return (
      <div className={`mb-2 rounded-xl p-4 flex items-center gap-3 ${
        isAgent ? 'bg-white/10' : 'bg-gray-100'
      }`}>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          isAgent ? 'bg-white/20' : 'bg-gray-200'
        }`}>
          {getMediaIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${
            isAgent ? 'text-white' : 'text-gray-800'
          }`}>
            {mediaType === 'video' ? 'Video' : 
             mediaType === 'document' ? 'Documento' : 
             mediaType === 'audio' ? 'Audio' : 
             'Archivo'}
          </p>
          {message.caption && (
            <p className={`text-xs mt-1 ${
              isAgent ? 'text-white/80' : 'text-gray-600'
            }`}>
              {message.caption}
            </p>
          )}
        </div>
        <a
          href={getImageUrl() || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-lg transition-colors ${
            isAgent 
              ? 'bg-white/20 hover:bg-white/30 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          download
          onClick={(e) => {
            if (!getImageUrl()) {
              e.preventDefault()
              console.warn('[MessageBubble] No hay URL válida para descargar')
            }
          }}
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    )
  }

  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-3 group`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 relative ${
          isAgent
            ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md hover:shadow-md'
        }`}
      >
        {/* Media */}
        {renderMedia()}

        {/* Texto */}
        {message.text && (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        )}

        {/* Caption si hay imagen */}
        {hasMedia && mediaType === 'image' && message.caption && (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words mt-2">
            {message.caption}
          </p>
        )}

        {/* Timestamp y estado */}
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
