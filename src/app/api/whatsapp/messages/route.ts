import { NextRequest, NextResponse } from 'next/server'
import type { WhatsAppMessage } from '@/types/whatsapp'
import { getMessages } from '@/lib/server/whatsappStore'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || process.env.BUILDERBOT_WHATSAPP_API_URL
const ALLOW_MOCKS = process.env.NODE_ENV !== 'production'

// Datos mock para desarrollo como último recurso
const mockMessages: Record<string, WhatsAppMessage[]> = {
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { message: 'conversationId is required' },
        { status: 400 }
      )
    }

    const storedMessages = await getMessages(conversationId)
    if (storedMessages.length > 0) {
      return NextResponse.json(storedMessages)
    }

    if (!WHATSAPP_API_URL) {
      return NextResponse.json(ALLOW_MOCKS ? mockMessages[conversationId] || [] : [])
    }

    const response = await fetch(
      `${WHATSAPP_API_URL}/conversations/${conversationId}/messages`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error('Error fetching messages')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/whatsapp/messages:', error)

    const conversationId = request.nextUrl.searchParams.get('conversationId')
    if (conversationId && ALLOW_MOCKS && mockMessages[conversationId]) {
      return NextResponse.json(mockMessages[conversationId])
    }

    return NextResponse.json(
      { message: 'Error al cargar los mensajes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, text } = body

    if (!conversationId || !text) {
      return NextResponse.json(
        { message: 'conversationId and text are required' },
        { status: 400 }
      )
    }

    if (!WHATSAPP_API_URL) {
      // Crear mensaje mock
      const newMessage: WhatsAppMessage = {
        id: `m${Date.now()}`,
        conversationId,
        from: 'agent',
        text,
        sentAt: new Date().toISOString(),
        delivered: true,
        read: false,
      }
      
      // Agregar a mockMessages
      if (!mockMessages[conversationId]) {
        mockMessages[conversationId] = []
      }
      mockMessages[conversationId].push(newMessage)
      
      return NextResponse.json(newMessage)
    }

    const response = await fetch(`${WHATSAPP_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversationId, text }),
    })

    if (!response.ok) {
      throw new Error('Error sending message')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/whatsapp/messages:', error)
    return NextResponse.json(
      { message: 'Error al enviar el mensaje' },
      { status: 500 }
    )
  }
}

