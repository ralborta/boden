import { Redis } from '@upstash/redis'
import {
  type WhatsAppConversation,
  type WhatsAppMessage,
  type WhatsAppConversationStatus,
} from '@/types/whatsapp'

type ConversationRecord = WhatsAppConversation & { messages: WhatsAppMessage[] }

export type RecordMessageInput = {
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

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
console.log(
  '[whatsappStore] Redis config -> hasUrl:',
  !!redisUrl,
  'hasToken:',
  !!redisToken,
  'NODE_ENV:',
  process.env.NODE_ENV
)
const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

const isHostedProduction =
  process.env.VERCEL === '1' ||
  Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME)

if (!redis) {
  const warning =
    'Redis no está configurado. Configura UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.'
  if (isHostedProduction) {
    console.warn(`${warning} Se usará almacenamiento en memoria (datos no persistentes).`)
  } else {
    console.log(`${warning} Usando almacenamiento en memoria local.`)
  }
}

const CONVERSATIONS_KEY = 'boden:whatsapp:conversations'
const MESSAGES_KEY_PREFIX = 'boden:whatsapp:messages:'
const MESSAGE_INDEX_KEY = 'boden:whatsapp:message-index'

const memoryConversations = new Map<string, ConversationRecord>()
let memorySeeded = false

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

function getMessagesKey(conversationId: string) {
  return `${MESSAGES_KEY_PREFIX}${conversationId}`
}

async function ensureSeeded() {
  if (redis) {
    return
  }
  ensureMemorySeeded()
}

function ensureMemorySeeded() {
  if (memorySeeded) return
  mockSeedConversations.forEach((conversation) => {
    memoryConversations.set(conversation.id, {
      ...conversation,
      messages: [],
    })
  })

  memorySeeded = true

  Object.entries(mockSeedMessages).forEach(([conversationId, messages]) => {
    messages.forEach((message) => {
      storeMessageMemory({
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

export async function storeMessage(input: RecordMessageInput): Promise<WhatsAppMessage | null> {
  await ensureSeeded()
  const storageLayer = redis ? 'REDIS' : 'MEMORY'
  console.log('[whatsappStore] storeMessage', {
    storageLayer,
    conversationId: input.conversationId,
    from: input.from,
  })
  return redis ? storeMessageRedis(input) : storeMessageMemory(input)
}

async function storeMessageRedis({
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
}: RecordMessageInput): Promise<WhatsAppMessage | null> {
  if (!redis) return null

  const cleanText = text?.trim()
  if (!cleanText) return null
  const timestamp = toIsoString(sentAt)
  const storedConversation = await redis.hget(CONVERSATIONS_KEY, conversationId)
  const parsedConversation = storedConversation
    ? (JSON.parse(storedConversation as string) as WhatsAppConversation)
    : null

  const fallbackPhone = contactPhone || normalizePhone(conversationId)

  const conversation: WhatsAppConversation = parsedConversation
    ? {
        ...parsedConversation,
        contactName: contactName || parsedConversation.contactName || fallbackPhone,
        contactPhone: contactPhone || parsedConversation.contactPhone || fallbackPhone,
        status: status || parsedConversation.status,
      }
    : {
        id: conversationId,
        contactName: contactName || fallbackPhone,
        contactPhone: fallbackPhone,
        lastMessagePreview: cleanText,
        lastMessageAt: timestamp,
        unreadCount: from === 'customer' ? 1 : 0,
        status: status || 'open',
        channel: 'whatsapp',
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

  conversation.lastMessagePreview = cleanText
  conversation.lastMessageAt = timestamp
  conversation.unreadCount =
    from === 'customer'
      ? (parsedConversation?.unreadCount ?? 0) + 1
      : parsedConversation?.unreadCount ?? 0
  if (from === 'agent') {
    conversation.unreadCount = 0
  }

  await redis.hset(CONVERSATIONS_KEY, { [conversationId]: JSON.stringify(conversation) })
  await redis.rpush(getMessagesKey(conversationId), JSON.stringify(message))
  await redis.sadd(MESSAGE_INDEX_KEY, conversationId)

  return message
}

function storeMessageMemory({
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
  const cleanText = text?.trim()
  if (!cleanText) return null
  const timestamp = toIsoString(sentAt)

  let conversation = memoryConversations.get(conversationId)

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

  memoryConversations.set(conversationId, conversation)
  return message
}

export async function getConversations(): Promise<WhatsAppConversation[]> {
  await ensureSeeded()
  const conversationsList = redis
    ? await getRedisConversations()
    : getMemoryConversations()

  return conversationsList.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  )
}

async function getRedisConversations(): Promise<WhatsAppConversation[]> {
  if (!redis) return []
  const raw = (await redis.hvals(CONVERSATIONS_KEY)) as string[]
  return raw.map((value) => JSON.parse(value) as WhatsAppConversation)
}

function getMemoryConversations(): WhatsAppConversation[] {
  return Array.from(memoryConversations.values()).map(({ messages, ...conversation }) => conversation)
}

export async function getMessages(conversationId: string): Promise<WhatsAppMessage[]> {
  await ensureSeeded()
  return redis ? getRedisMessages(conversationId) : getMemoryMessages(conversationId)
}

async function getRedisMessages(conversationId: string): Promise<WhatsAppMessage[]> {
  if (!redis) return []
  const raw = (await redis.lrange(getMessagesKey(conversationId), 0, -1)) as string[]
  return raw.map((value) => JSON.parse(value) as WhatsAppMessage)
}

function getMemoryMessages(conversationId: string): WhatsAppMessage[] {
  return memoryConversations.get(conversationId)?.messages ?? []
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

export async function ingestBuilderbotEvent(event: BuilderbotEvent) {
  const { eventName, data } = event
  if (!eventName || !data) return
  if (!['message.incoming', 'message.outgoing'].includes(eventName)) {
    return
  }

  console.log(
    '[ingestBuilderbotEvent] procesando evento',
    eventName,
    'payload keys:',
    Object.keys(data ?? {})
  )

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

  console.log('[ingestBuilderbotEvent] almacenando mensaje', {
    conversationId,
    from,
    text,
  })

  await storeMessage({
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

export async function resetWhatsAppStore() {
  memoryConversations.clear()
  memorySeeded = false

  if (redis) {
    const messageIds = (await redis.smembers(MESSAGE_INDEX_KEY)) as string[]
    const messageKeys = messageIds?.length
      ? messageIds.map((id) => getMessagesKey(id))
      : []
    if (messageKeys.length) {
      await redis.del(...messageKeys)
    }
    await redis.del(CONVERSATIONS_KEY, MESSAGE_INDEX_KEY)
  }
}

