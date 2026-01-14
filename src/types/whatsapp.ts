export type WhatsAppConversationStatus = "open" | "closed" | "pending"

export type WhatsAppConversation = {
  id: string
  contactName: string
  contactPhone: string
  lastMessagePreview: string
  lastMessageAt: string // ISO string
  unreadCount: number
  status: WhatsAppConversationStatus
  channel: "whatsapp" // extendible a futuro
}

export type WhatsAppMessage = {
  id: string
  conversationId: string
  from: "agent" | "customer"
  text: string
  sentAt: string // ISO string
  delivered?: boolean
  read?: boolean
  mediaUrl?: string // URL de la imagen/video/documento
  mediaType?: 'image' | 'video' | 'document' | 'audio' | 'sticker'
  mediaMimeType?: string // ej: 'image/jpeg', 'video/mp4'
  caption?: string // Texto que acompaña a la imagen
  mediaKey?: string // Clave de media para descargar desde WhatsApp API
}

