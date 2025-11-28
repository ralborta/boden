import { NextRequest, NextResponse } from 'next/server'
import type { WhatsAppConversation } from '@/types/whatsapp'
import { getConversations } from '@/lib/server/whatsappStore'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || process.env.BUILDERBOT_WHATSAPP_API_URL
const REMOTE_WHATSAPP_API_URL =
  process.env.REMOTE_WHATSAPP_API_URL ||
  (process.env.VERCEL === '1' ? 'https://boden-production.up.railway.app/api/whatsapp' : '')
const ALLOW_MOCKS = process.env.NODE_ENV !== 'production'

// Datos mock para desarrollo como último fallback
const mockConversations: WhatsAppConversation[] = [
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

async function fetchRemoteConversations() {
  if (!REMOTE_WHATSAPP_API_URL) return null
  try {
    const response = await fetch(`${REMOTE_WHATSAPP_API_URL}/conversations`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) {
      console.error('Error fetching remote conversations:', response.status)
      return null
    }
    return (await response.json()) as WhatsAppConversation[]
  } catch (error) {
    console.error('Remote conversations fetch failed:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    if (process.env.VERCEL === '1' && REMOTE_WHATSAPP_API_URL) {
      const remoteData = await fetchRemoteConversations()
      if (remoteData) {
        return NextResponse.json(remoteData)
      }
      console.warn('[whatsapp/conversations] Remote fetch returned empty in Vercel.')
    }

    const storedConversations = await getConversations()
    if (storedConversations.length > 0) {
      return NextResponse.json(storedConversations)
    }

    if (REMOTE_WHATSAPP_API_URL) {
      const remoteData = await fetchRemoteConversations()
      if (remoteData) {
        return NextResponse.json(remoteData)
      }
    }

    if (!WHATSAPP_API_URL) {
      return NextResponse.json(ALLOW_MOCKS ? mockConversations : [])
    }

    const response = await fetch(`${WHATSAPP_API_URL}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Error fetching conversations')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/whatsapp/conversations:', error)

    if (WHATSAPP_API_URL) {
      return NextResponse.json(
        { message: 'Error al conectar con el servicio de WhatsApp' },
        { status: 500 }
      )
    }

    return NextResponse.json(ALLOW_MOCKS ? mockConversations : [])
  }
}

