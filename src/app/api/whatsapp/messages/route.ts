import { NextRequest, NextResponse } from 'next/server'
import type { WhatsAppMessage } from '@/types/whatsapp'
import { getMessages, storeMessage, normalizePhone } from '@/lib/server/whatsappStore'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || process.env.BUILDERBOT_WHATSAPP_API_URL

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

    if (!WHATSAPP_API_URL) {
      // Retornar datos mock si no hay API configurada
      const messages = mockMessages[conversationId] || []
      return NextResponse.json(messages)
    }

    const response = await fetch(
      `${WHATSAPP_API_URL}/conversations/${conversationId}/messages`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
      hasApiUrl: !!WHATSAPP_API_URL
    })

    // Intentar enviar a BuilderBot/WhatsApp API si está configurado
    if (WHATSAPP_API_URL) {
      try {
        // BuilderBot puede usar diferentes endpoints:
        // - /sendMessage (más común)
        // - /messages
        // - /api/sendMessage
        const baseUrl = WHATSAPP_API_URL.replace(/\/$/, '')
        const endpoints = [
          `${baseUrl}/sendMessage`,
          `${baseUrl}/messages`,
          `${baseUrl}/api/sendMessage`,
        ]
        
        let lastError: Error | null = null
        
        for (const endpoint of endpoints) {
          try {
            console.log('[POST /api/whatsapp/messages] Intentando enviar a:', endpoint)
            
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phone: normalizedConversationId,
                message: text,
                // También intentar con otros formatos comunes
                to: normalizedConversationId,
                text: text,
                body: text,
              }),
            })

            if (response.ok) {
              const data = await response.json()
              console.log('[POST /api/whatsapp/messages] ✅ Mensaje enviado a BuilderBot exitosamente en:', endpoint)
              
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
                id: `msg_${Date.now()}`,
                conversationId: normalizedConversationId,
                from: 'agent',
                text,
                sentAt: new Date().toISOString(),
                delivered: true,
                read: true,
              })
            } else {
              const errorText = await response.text()
              lastError = new Error(`HTTP ${response.status}: ${errorText}`)
              console.log('[POST /api/whatsapp/messages] Endpoint falló:', endpoint, response.status)
              // Continuar con el siguiente endpoint
            }
          } catch (endpointError) {
            lastError = endpointError instanceof Error ? endpointError : new Error(String(endpointError))
            console.log('[POST /api/whatsapp/messages] Error en endpoint:', endpoint, lastError.message)
            // Continuar con el siguiente endpoint
          }
        }
        
        // Si todos los endpoints fallaron, loguear el error pero continuar
        if (lastError) {
          console.error('[POST /api/whatsapp/messages] ❌ Todos los endpoints de BuilderBot fallaron:', lastError.message)
          console.log('[POST /api/whatsapp/messages] 💡 Verifica que WHATSAPP_API_URL esté correctamente configurado')
        }
      } catch (apiError) {
        console.error('[POST /api/whatsapp/messages] ❌ Error general al enviar a BuilderBot:', apiError)
        // Continuar para almacenar localmente aunque falle el envío
      }
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
    const newMessage: WhatsAppMessage = {
      id: `m${Date.now()}`,
      conversationId: normalizedConversationId,
      from: 'agent',
      text,
      sentAt: new Date().toISOString(),
      delivered: WHATSAPP_API_URL ? false : true, // Si no hay API, marcamos como entregado
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

