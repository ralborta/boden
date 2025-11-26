import { NextResponse } from 'next/server'
import { getConversations } from '@/lib/server/whatsappStore'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || process.env.BUILDERBOT_WHATSAPP_API_URL

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const usingInternalStore = !WHATSAPP_API_URL
    console.log('[GET /api/whatsapp/conversations] usando store interno?', usingInternalStore)

    if (usingInternalStore) {
      const conversations = await getConversations()
      console.log(
        '[GET /api/whatsapp/conversations] conversaciones:',
        Array.isArray(conversations) ? conversations.length : 'no-array'
      )
      return NextResponse.json(conversations)
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
    const fallback = await getConversations()
    console.log(
      '[GET /api/whatsapp/conversations] fallback conversaciones:',
      Array.isArray(fallback) ? fallback.length : 'no-array'
    )
    return NextResponse.json(fallback)
  }
}

