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

// Validar que las credenciales estén completas
const hasValidRedisConfig = !!(redisUrl && redisToken)
const redisUrlValid = redisUrl && redisUrl.startsWith('https://')
const redisTokenValid = redisToken && redisToken.length > 10

console.log(
  '[whatsappStore] Redis config ->',
  {
    hasUrl: !!redisUrl,
    urlValid: redisUrlValid,
    hasToken: !!redisToken,
    tokenValid: redisTokenValid,
    hasValidConfig: hasValidRedisConfig,
    NODE_ENV: process.env.NODE_ENV,
    isVercel: process.env.VERCEL === '1',
    isRailway: Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME),
  }
)

if (!hasValidRedisConfig) {
  console.error('❌ [whatsappStore] Redis no configurado correctamente:', {
    hasUrl: !!redisUrl,
    urlValid: redisUrlValid,
    hasToken: !!redisToken,
    tokenValid: redisTokenValid,
  })
}

const redis = hasValidRedisConfig ? new Redis({ url: redisUrl!, token: redisToken! }) : null

const isHostedProduction =
  process.env.VERCEL === '1' ||
  Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME)

if (!redis && isHostedProduction) {
  throw new Error(
    'Redis no está configurado en producción. Configura UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.'
  )
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
  // Solo usar datos mock en desarrollo local, NO en producción
  const isProduction = process.env.VERCEL === '1' || Boolean(process.env.RAILWAY_ENVIRONMENT)
  
  if (redis) {
    // En producción con Redis, no usar mocks
    return
  }
  
  // Solo en desarrollo local sin Redis
  if (!isProduction) {
    ensureMemorySeeded()
  }
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
  
  // Normalizar conversationId para que sea consistente (siempre con +)
  const normalizedConversationId = normalizePhone(conversationId)
  console.log('[storeMessageRedis] conversationId original:', conversationId, 'normalizado:', normalizedConversationId)
  
  const timestamp = toIsoString(sentAt)
  const storedConversation = await redis.hget(CONVERSATIONS_KEY, normalizedConversationId)
  const parsedConversation = storedConversation
    ? (typeof storedConversation === 'string' 
        ? (JSON.parse(storedConversation) as WhatsAppConversation)
        : (storedConversation as WhatsAppConversation))
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
        id: normalizedConversationId,
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
    conversationId: normalizedConversationId,
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

  await redis.hset(CONVERSATIONS_KEY, { [normalizedConversationId]: JSON.stringify(conversation) })
  
  // Verificar si el mensaje ya existe antes de agregarlo (evitar duplicados)
  const messagesKey = getMessagesKey(normalizedConversationId)
  const existingMessages = await redis.lrange(messagesKey, 0, -1)
  const messageExists = existingMessages.some((msg: string | unknown) => {
    try {
      const parsed = typeof msg === 'string' ? JSON.parse(msg) : msg
      return parsed.id === message.id
    } catch {
      return false
    }
  })
  
  if (!messageExists) {
    await redis.rpush(messagesKey, JSON.stringify(message))
    console.log('[storeMessageRedis] Mensaje nuevo almacenado:', message.id)
  } else {
    console.log('[storeMessageRedis] Mensaje ya existe, omitiendo duplicado:', message.id)
  }
  
  await redis.sadd(MESSAGE_INDEX_KEY, normalizedConversationId)

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
  
  // Normalizar conversationId para que sea consistente
  const normalizedConversationId = normalizePhone(conversationId)
  const timestamp = toIsoString(sentAt)

  let conversation = memoryConversations.get(normalizedConversationId)

  if (!conversation) {
    const fallbackPhone = contactPhone || normalizedConversationId
    conversation = {
      id: normalizedConversationId,
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
    conversationId: normalizedConversationId,
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

  memoryConversations.set(normalizedConversationId, conversation)
  return message
}

export async function getConversations(): Promise<WhatsAppConversation[]> {
  const isProduction = process.env.VERCEL === '1' || Boolean(process.env.RAILWAY_ENVIRONMENT)
  
  // En producción, solo usar Redis, no mocks
  if (isProduction && !redis) {
    console.warn('[getConversations] Producción sin Redis - retornando array vacío')
    return []
  }
  
  await ensureSeeded()
  
  console.log('[getConversations] Redis configurado:', !!redis, 'isVercel:', process.env.VERCEL === '1', 'isRailway:', Boolean(process.env.RAILWAY_ENVIRONMENT))
  
  const conversationsList = redis
    ? await getRedisConversations()
    : getMemoryConversations()

  console.log('[getConversations] Total conversaciones encontradas:', conversationsList.length)
  if (conversationsList.length > 0) {
    console.log('[getConversations] IDs de conversaciones:', conversationsList.map(c => c.id))
  }
  
  return conversationsList.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  )
}

async function getRedisConversations(): Promise<WhatsAppConversation[]> {
  if (!redis) {
    console.warn('[getRedisConversations] Redis no está configurado')
    return []
  }
  
  try {
    console.log('[getRedisConversations] Leyendo desde Redis, key:', CONVERSATIONS_KEY)
    const raw = await redis.hvals(CONVERSATIONS_KEY)
    console.log('[getRedisConversations] Valores encontrados en Redis:', raw?.length || 0)
    
    const conversations = raw.map((value: string | unknown) => {
      const parsed = typeof value === 'string' 
        ? (JSON.parse(value) as WhatsAppConversation)
        : (value as WhatsAppConversation)
      // Normalizar el ID de la conversación para evitar duplicados
      parsed.id = normalizePhone(parsed.id)
      return parsed
    })
    
    // Eliminar duplicados por ID (por si hay conversaciones con y sin +)
    const uniqueConversations = new Map<string, WhatsAppConversation>()
    conversations.forEach((conv: WhatsAppConversation) => {
      const normalizedId = normalizePhone(conv.id)
      // Si ya existe, mantener la más reciente
      const existing = uniqueConversations.get(normalizedId)
      if (!existing || new Date(conv.lastMessageAt) > new Date(existing.lastMessageAt)) {
        uniqueConversations.set(normalizedId, { ...conv, id: normalizedId })
      }
    })
    
    const deduplicated = Array.from(uniqueConversations.values())
    console.log('[getRedisConversations] Conversaciones parseadas:', conversations.length, 'después de deduplicar:', deduplicated.length)
    return deduplicated
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [getRedisConversations] Error leyendo desde Redis:', {
      error: errorMessage,
      isUpstashError: errorMessage.includes('UpstashError'),
      isWrongPass: errorMessage.includes('WRONGPASS'),
      suggestion: errorMessage.includes('WRONGPASS') 
        ? 'Verifica que UPSTASH_REDIS_REST_TOKEN esté correctamente configurado en Vercel'
        : 'Verifica la configuración de Redis'
    })
    return []
  }
}

function getMemoryConversations(): WhatsAppConversation[] {
  return Array.from(memoryConversations.values()).map(({ messages, ...conversation }) => conversation)
}

export async function getMessages(conversationId: string): Promise<WhatsAppMessage[]> {
  const isProduction = process.env.VERCEL === '1' || Boolean(process.env.RAILWAY_ENVIRONMENT)
  
  // En producción, solo usar Redis, no mocks
  if (isProduction && !redis) {
    console.warn('[getMessages] Producción sin Redis - retornando array vacío')
    return []
  }
  
  await ensureSeeded()
  
  // Normalizar conversationId para que sea consistente
  const normalizedConversationId = normalizePhone(conversationId)
  console.log('[getMessages] conversationId original:', conversationId, 'normalizado:', normalizedConversationId, 'Redis configurado:', !!redis)
  
  const messages = redis ? await getRedisMessages(normalizedConversationId) : getMemoryMessages(normalizedConversationId)
  
  console.log('[getMessages] Total mensajes encontrados:', messages.length)
  
  return messages
}

async function getRedisMessages(conversationId: string): Promise<WhatsAppMessage[]> {
  if (!redis) {
    console.warn('[getRedisMessages] Redis no está configurado')
    return []
  }
  
  try {
    const messagesKey = getMessagesKey(conversationId)
    console.log('[getRedisMessages] Leyendo desde Redis, key:', messagesKey)
    const raw = await redis.lrange(messagesKey, 0, -1)
    console.log('[getRedisMessages] Valores encontrados en Redis:', raw?.length || 0)
    
    const messages = raw.map((value: string | unknown) => 
      typeof value === 'string' 
        ? (JSON.parse(value) as WhatsAppMessage)
        : (value as WhatsAppMessage)
    )
    
    // Eliminar duplicados por ID
    const uniqueMessages = new Map<string, WhatsAppMessage>()
    messages.forEach(msg => {
      if (!uniqueMessages.has(msg.id)) {
        uniqueMessages.set(msg.id, msg)
      }
    })
    
    const deduplicated = Array.from(uniqueMessages.values())
    // Ordenar por fecha (más antiguos primero)
    deduplicated.sort((a, b) => {
      const timeA = new Date(a.sentAt).getTime()
      const timeB = new Date(b.sentAt).getTime()
      // Si tienen el mismo timestamp, ordenar por ID para mantener consistencia
      if (timeA === timeB) {
        return a.id.localeCompare(b.id)
      }
      return timeA - timeB
    })
    
    console.log('[getRedisMessages] Mensajes parseados:', messages.length, 'después de deduplicar:', deduplicated.length)
    if (deduplicated.length > 0) {
      console.log('[getRedisMessages] Primer mensaje:', {
        id: deduplicated[0].id,
        from: deduplicated[0].from,
        sentAt: deduplicated[0].sentAt,
        text: deduplicated[0].text.substring(0, 30)
      })
      console.log('[getRedisMessages] Último mensaje:', {
        id: deduplicated[deduplicated.length - 1].id,
        from: deduplicated[deduplicated.length - 1].from,
        sentAt: deduplicated[deduplicated.length - 1].sentAt,
        text: deduplicated[deduplicated.length - 1].text.substring(0, 30)
      })
    }
    return deduplicated
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [getRedisMessages] Error leyendo desde Redis:', {
      error: errorMessage,
      isUpstashError: errorMessage.includes('UpstashError'),
      isWrongPass: errorMessage.includes('WRONGPASS'),
      suggestion: errorMessage.includes('WRONGPASS') 
        ? 'Verifica que UPSTASH_REDIS_REST_TOKEN esté correctamente configurado en Vercel'
        : 'Verifica la configuración de Redis'
    })
    return []
  }
}

function getMemoryMessages(conversationId: string): WhatsAppMessage[] {
  const messages = memoryConversations.get(conversationId)?.messages ?? []
  // Ordenar por fecha (más antiguos primero)
  return messages.sort((a, b) => {
    const timeA = new Date(a.sentAt).getTime()
    const timeB = new Date(b.sentAt).getTime()
    // Si tienen el mismo timestamp, ordenar por ID para mantener consistencia
    if (timeA === timeB) {
      return a.id.localeCompare(b.id)
    }
    return timeA - timeB
  })
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
  // Primero verificar si viene directamente en el payload
  if (data.conversationId) {
    // Normalizar el conversationId para que sea consistente
    return normalizePhone(data.conversationId)
  }
  
  // Luego buscar en las estructuras anidadas
  const remote = data.key?.remoteJid || data.remoteJid || data.from || data.to
  if (remote) {
    // Normalizar para que siempre tenga el mismo formato
    return normalizePhone(remote)
  }
  if (data.contact?.id) {
    return normalizePhone(data.contact.id)
  }
  if (data.projectId && data.ref?.id) {
    return `${data.projectId}:${normalizePhone(data.ref.id)}`
  }
  // Si no hay nada, usar el 'from' como fallback
  if (data.from) {
    return normalizePhone(data.from)
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

  console.log('[ingestBuilderbotEvent] extracción:', {
    text: text || 'NO ENCONTRADO',
    conversationId: conversationId || 'NO ENCONTRADO',
    dataKeys: Object.keys(data),
    hasBody: !!data.body,
    hasFrom: !!data.from,
    hasConversationId: !!data.conversationId,
  })

  if (!text || !conversationId) {
    console.warn('❌ Builderbot webhook sin texto o conversationId', { 
      eventName, 
      text: text || 'FALTA TEXTO',
      conversationId: conversationId || 'FALTA CONVERSATION_ID',
      dataKeys: Object.keys(data),
      dataSample: JSON.stringify(data).substring(0, 200)
    })
    return
  }

  const from =
    eventName === 'message.incoming' || data.fromMe === false ? 'customer' : 'agent'
  const phone = normalizePhone(data.key?.remoteJid || data.remoteJid || data.from)
  const name = data.name || data.contactName || phone
  // Usar messageTimestamp si está disponible, sino usar el timestamp actual
  // messageTimestamp viene en segundos desde epoch, necesitamos convertirlo a milisegundos
  const timestamp = data.messageTimestamp
    ? toIsoString(Number(data.messageTimestamp) * 1000)
    : Date.now()

  console.log('[ingestBuilderbotEvent] almacenando mensaje', {
    conversationId,
    from,
    text,
    name,
    phone,
    normalizedPhone: normalizePhone(conversationId),
    conversationIdMatchesPhone: conversationId === phone,
  })

  const storedMessage = await storeMessage({
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

  if (storedMessage) {
    console.log('✅ Mensaje almacenado exitosamente:', storedMessage.id)
  } else {
    console.error('❌ Error: storeMessage retornó null')
  }
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

