import { NextResponse } from 'next/server'
import { getConversations } from '@/lib/server/whatsappStore'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || process.env.BUILDERBOT_WHATSAPP_API_URL

export async function GET() {
  try {
    if (!WHATSAPP_API_URL) {
      return NextResponse.json(await getConversations())
    }

    const response = await fetch(`${WHATSAPP_API_URL}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error fetching conversations')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/whatsapp/conversations:', error)
    return NextResponse.json(await getConversations())
  }
}

