import { WhatsAppConversation, WhatsAppMessage, WhatsAppConversationStatus } from '@/types/whatsapp'

type ConversationRecord = WhatsAppConversation & { messages: WhatsAppMessage[] }

type RecordMessageInput = {
  conversationId: string
  from: 'agent' | 'customer'
  text: string
  sentAt?: string | number
  delivered?: boolean
  read?: boolean
  id?: string
  contactName?: string
  contactPhone?: string
  status?: WhatsAppConversationStatus
}

const conversations = new Map<string, ConversationRecord>()
let isSeeded = false

const mockSeedConversations: WhatsAppConversation[] = [
  {
    id: '1',
    contactName: 'María González',
    contactPhone: '+54 11 1234-5678',
    lastMessagePreview: 'Hola, necesito información sobre sus productos',
    lastMessageAt: new Date(Date.now() - 5 * 60000).toISOString(),
    unreadCount: 2,
    status: 'open',
    channel: 'whatsapp',
  },
  {
    id: '2',
    contactName: 'Juan Pérez',
    contactPhone: '+54 11 2345-6789',
    lastMessagePreview: 'Perfecto, gracias por la ayuda',
    lastMessageAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    unreadCount: 0,
    status: 'closed',
    channel: 'whatsapp',
  },
  {
    id: '3',
    contactName: 'Ana Martínez',
    contactPhone: '+54 11 3456-7890',
    lastMessagePreview: '¿Cuál es el precio del plan premium?',
    lastMessageAt: new Date(Date.now() - 30 * 60000).toISOString(),
    unreadCount: 1,
    status: 'pending',
    channel: 'whatsapp',
  },
  {
    id: '4',
    contactName: 'Carlos Rodríguez',
    contactPhone: '+54 11 4567-8901',
    lastMessagePreview: 'Necesito hablar con un agente',
    lastMessageAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    unreadCount: 0,
    status: 'open',
    channel: 'whatsapp',
  },
  {
    id: '5',
    contactName: 'Laura Fernández',
    contactPhone: '+54 11 5678-9012',
    lastMessagePreview: 'Excelente servicio, muchas gracias',
    lastMessageAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    unreadCount: 0,
    status: 'closed',
    channel: 'whatsapp',
  },
]

const mockSeedMessages: Record<string, WhatsAppMessage[]> = {
  '1': [
    {
      id: 'm1',
      conversationId: '1',
      from: 'customer',
      text: 'Hola, necesito información sobre sus productos',
      sentAt: new Date(Date.now() - 10 * 60000).toISOString(),
      delivered: true,
      read: true,
    },
    {
      id: 'm2',
      conversationId: '1',
      from: 'agent',
      text: '¡Hola María! Claro, con gusto te ayudo. ¿Qué producto te interesa?',
      sentAt: new Date(Date.now() - 8 * 60000).toISOString(),
      delivered: true,
      read: true,
    },
    {
      id: 'm3',
      conversationId: '1',
      from: 'customer',
      text: 'Me interesa el plan premium',
      sentAt: new Date(Date.now() - 5 * 60000).toISOString(),
      delivered: true,
      read: false,
    },
  ],
  '2': [
    {
      id: 'm4',
      conversationId: '2',
      from: 'customer',
      text: 'Buenos días',
      sentAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      delivered: true,
      read: true,
    },
    {
      id: 'm5',
      conversationId: '2',
      from: 'agent',
      text: 'Buenos días Juan, ¿en qué puedo ayudarte?',
      sentAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      delivered: true,
      read: true,
    },
    {
      id: 'm6',
      conversationId: '2',
      from: 'customer',
      text: 'Perfecto, gracias por la ayuda',
      sentAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      delivered: true,
      read: true,
    },
  ],
  '3': [
    {
      id: 'm7',
      conversationId: '3',
      from: 'customer',
      text: '¿Cuál es el precio del plan premium?',
      sentAt: new Date(Date.now() - 30 * 60000).toISOString(),
      delivered: true,
      read: false,
    },
  ],
  '4': [
    {
      id: 'm8',
      conversationId: '4',
      from: 'customer',
      text: 'Necesito hablar con un agente',
      sentAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      delivered: true,
      read: true,
    },
    {
      id: 'm9',
      conversationId: '4',
      from: 'agent',
      text: 'Hola Carlos, soy un agente. ¿En qué puedo ayudarte?',
      sentAt: new Date(Date.now() - 50 * 60000).toISOString(),
      delivered: true,
      read: true,
    },
  ],
  '5': [
    {
      id: 'm10',
      conversationId: '5',
      from: 'customer',
      text: 'Excelente servicio, muchas gracias',
      sentAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      delivered: true,
      read: true,
    },
  ],
}

function seedStore() {
  if (isSeeded) return
  mockSeedConversations.forEach((conversation) => {
    conversations.set(conversation.id, {
      ...conversation,
      messages: [],
    })
  })

  Object.entries(mockSeedMessages).forEach(([conversationId, messages]) => {
    messages.forEach((message) => {
      storeMessage({
        ...message,
        conversationId,
        from: message.from,
        text: message.text,
        sentAt: message.sentAt,
        delivered: message.delivered,
        read: message.read,
        id: message.id,
      })
    })
  })

  isSeeded = true
}

function ensureSeeded() {
  if (!isSeeded) {
    seedStore()
  }
}

function buildMessageId(explicitId?: string) {
  if (explicitId) return explicitId
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function toIsoString(date?: string | number) {
  if (!date) return new Date().toISOString()
  if (typeof date === 'number') return new Date(date).toISOString()
  const numeric = Number(date)
  if (!Number.isNaN(numeric) && date.trim() !== '') {
    const timestamp = numeric > 1e12 ? numeric : numeric * 1000
    return new Date(timestamp).toISOString()
  }
  const parsed = new Date(date)
  if (Number.isNaN(parsed.valueOf())) {
    return new Date().toISOString()
  }
  return parsed.toISOString()
}

export function storeMessage({
  conversationId,
  from,
  text,
  sentAt,
  delivered = true,
  read,
  id,
  contactName,
  contactPhone,
  status,
}: RecordMessageInput): WhatsAppMessage | null {
  ensureSeeded()

  const cleanText = text?.trim()
  if (!cleanText) return null
  const timestamp = toIsoString(sentAt)

  let conversation = conversations.get(conversationId)

  if (!conversation) {
    const fallbackPhone = contactPhone || normalizePhone(conversationId)
    conversation = {
      id: conversationId,
      contactName: contactName || fallbackPhone,
      contactPhone: fallbackPhone,
      lastMessagePreview: cleanText,
      lastMessageAt: timestamp,
      unreadCount: from === 'customer' ? 1 : 0,
      status: status || 'open',
      channel: 'whatsapp',
      messages: [],
    }
  } else {
    if (contactName) conversation.contactName = contactName
    if (contactPhone) conversation.contactPhone = contactPhone
    if (status) conversation.status = status
  }

  const message: WhatsAppMessage = {
    id: buildMessageId(id),
    conversationId,
    from,
    text: cleanText,
    sentAt: timestamp,
    delivered,
    read: typeof read === 'boolean' ? read : from === 'agent',
  }

  conversation.messages = [...conversation.messages, message]
  conversation.lastMessagePreview = cleanText
  conversation.lastMessageAt = timestamp
  conversation.unreadCount = from === 'customer' ? conversation.unreadCount + 1 : 0

  conversations.set(conversationId, conversation)
  return message
}

export function getConversations(): WhatsAppConversation[] {
  ensureSeeded()
  return Array.from(conversations.values())
    .sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )
    .map(({ messages, ...conversation }) => conversation)
}

export function getMessages(conversationId: string): WhatsAppMessage[] {
  ensureSeeded()
  const conversation = conversations.get(conversationId)
  return conversation ? conversation.messages : []
}

export function normalizePhone(value?: string) {
  if (!value) return 'Desconocido'
  const plain = value.replace(/@.*/, '')
  if (plain.startsWith('+')) return plain
  if (plain.startsWith('00')) return `+${plain.slice(2)}`
  if (plain.startsWith('0')) return `+${plain.slice(1)}`
  if (plain.startsWith('54') || plain.startsWith('1')) return `+${plain}`
  return `+${plain}`
}

type BuilderbotEvent = {
  eventName?: string
  data?: Record<string, any>
}

function extractText(data: Record<string, any>): string | undefined {
  return (
    data.message?.extendedTextMessage?.text ||
    data.message?.conversation ||
    data.answer ||
    data.body ||
    data.text ||
    data.message?.extendedTextMessage?.caption
  )
}

function extractConversationId(data: Record<string, any>): string | null {
  const remote = data.key?.remoteJid || data.remoteJid || data.from || data.to
  if (remote) return remote
  if (data.contact?.id) return data.contact.id
  if (data.projectId && data.ref?.id) {
    return `${data.projectId}:${data.ref.id}`
  }
  return null
}

export function ingestBuilderbotEvent(event: BuilderbotEvent) {
  const { eventName, data } = event
  if (!eventName || !data) return
  if (!['message.incoming', 'message.outgoing'].includes(eventName)) {
    return
  }

  const text = extractText(data)
  const conversationId = extractConversationId(data)

  if (!text || !conversationId) {
    console.warn('Builderbot webhook sin texto o conversationId', { eventName, data })
    return
  }

  const from =
    eventName === 'message.incoming' || data.fromMe === false ? 'customer' : 'agent'
  const phone = normalizePhone(data.key?.remoteJid || data.remoteJid || data.from)
  const name = data.name || data.contactName || phone
  const timestamp = data.messageTimestamp
    ? toIsoString(Number(data.messageTimestamp))
    : undefined

  storeMessage({
    conversationId,
    from,
    text,
    sentAt: timestamp,
    delivered: true,
    read: from === 'agent',
    id: data.key?.id,
    contactName: name,
    contactPhone: phone,
  })
}

export function resetWhatsAppStore() {
  conversations.clear()
  isSeeded = false
}


