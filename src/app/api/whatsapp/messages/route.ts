import { NextRequest, NextResponse } from 'next/server'
import { getMessages, storeMessage } from '@/lib/server/whatsappStore'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || process.env.BUILDERBOT_WHATSAPP_API_URL

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

    if (!WHATSAPP_API_URL) {
      return NextResponse.json(getMessages(conversationId))
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
    if (conversationId) {
      return NextResponse.json(getMessages(conversationId))
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
      const newMessage = storeMessage({
        conversationId,
        from: 'agent',
        text,
        sentAt: new Date().toISOString(),
        delivered: true,
        read: true,
      })

      if (!newMessage) {
        return NextResponse.json(
          { message: 'No se pudo registrar el mensaje' },
          { status: 500 }
        )
      }

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

