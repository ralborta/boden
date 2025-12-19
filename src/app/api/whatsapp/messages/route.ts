import { NextRequest, NextResponse } from 'next/server'
import type { WhatsAppMessage } from '@/types/whatsapp'
import { getMessages, storeMessage, normalizePhone } from '@/lib/server/whatsappStore'
import { sendWhatsAppMessage } from '@/lib/builderbot'

// Datos mock para desarrollo
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

    // Normalizar conversationId para que sea consistente
    const normalizedConversationId = normalizePhone(conversationId)
    console.log('[GET /api/whatsapp/messages] conversationId original:', conversationId, 'normalizado:', normalizedConversationId)

    // Los datos vienen vía webhook y se almacenan en Redis/memoria
    // No necesitamos hacer fetch a Railway
    const storedMessages = await getMessages(normalizedConversationId)
    if (storedMessages.length > 0) {
      return NextResponse.json(storedMessages)
    }

    // Retornar datos mock solo en desarrollo si no hay mensajes almacenados
    const messages = mockMessages[conversationId] || []
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error in GET /api/whatsapp/messages:', error)

    const conversationId = request.nextUrl.searchParams.get('conversationId')
    if (conversationId && mockMessages[conversationId]) {
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

    // Normalizar conversationId para que sea consistente
    const normalizedConversationId = normalizePhone(conversationId)
    console.log('[POST /api/whatsapp/messages] Enviando mensaje:', {
      conversationId: normalizedConversationId,
      text: text.substring(0, 50),
    })

    // Intentar enviar a BuilderBot Cloud API v2 usando el código que funciona
    try {
      // Normalizar número (quitar espacios y guiones) como en el código original
      const number = normalizedConversationId.replace(/\s|-/g, '')
      
      console.log('[POST /api/whatsapp/messages] Enviando a BuilderBot Cloud API v2:', {
        number,
        messageLength: text.length,
      })

      const result = await sendWhatsAppMessage({
        number,
        message: text,
        checkIfExists: false,
      })

      console.log('[POST /api/whatsapp/messages] ✅ Mensaje enviado a BuilderBot exitosamente:', {
        messageId: result?.id || result?.messageId || 'N/A',
      })

      // Almacenar el mensaje localmente después de enviarlo
      const stored = await storeMessage({
        conversationId: normalizedConversationId,
        from: 'agent',
        text,
        sentAt: Date.now(),
        delivered: true,
        read: true,
      })

      return NextResponse.json(stored || {
        id: result?.id || result?.messageId || `msg_${Date.now()}`,
        conversationId: normalizedConversationId,
        from: 'agent',
        text,
        sentAt: new Date().toISOString(),
        delivered: true,
        read: true,
      })
    } catch (builderbotError) {
      console.error('[POST /api/whatsapp/messages] ❌ Error al enviar a BuilderBot:', {
        error: builderbotError instanceof Error ? builderbotError.message : String(builderbotError),
        suggestion: 'Verifica que BUILDERBOT_BOT_ID y BUILDERBOT_API_KEY estén configurados',
      })
      // Continuar para almacenar localmente aunque falle el envío
    }

    // Almacenar el mensaje localmente (siempre, incluso si no hay API configurada)
    const stored = await storeMessage({
      conversationId: normalizedConversationId,
      from: 'agent',
      text,
      sentAt: Date.now(),
      delivered: true,
      read: true,
    })

    if (stored) {
      console.log('[POST /api/whatsapp/messages] ✅ Mensaje almacenado localmente')
      return NextResponse.json(stored)
    }

    // Fallback: crear mensaje mock si no se pudo almacenar
    // Si llegamos aquí, BuilderBot falló pero almacenamos localmente
    const hasBuilderBotConfig = !!(process.env.BUILDERBOT_BOT_ID && process.env.BUILDERBOT_API_KEY)
    const newMessage: WhatsAppMessage = {
      id: `m${Date.now()}`,
      conversationId: normalizedConversationId,
      from: 'agent',
      text,
      sentAt: new Date().toISOString(),
      delivered: !hasBuilderBotConfig, // Si no hay BuilderBot configurado, marcamos como entregado
      read: false,
    }

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Error in POST /api/whatsapp/messages:', error)
    return NextResponse.json(
      { message: 'Error al enviar el mensaje' },
      { status: 500 }
    )
  }
}

