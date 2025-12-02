import { NextRequest, NextResponse } from 'next/server'
import { ingestBuilderbotEvent } from '@/lib/server/whatsappStore'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('📩 Webhook Builderbot recibido:', JSON.stringify(body, null, 2))

    if (!body?.eventName || !body?.data) {
      return NextResponse.json(
        { ok: false, message: 'eventName y data son requeridos' },
        { status: 400 }
      )
    }

    await ingestBuilderbotEvent(body)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error procesando webhook de Builderbot:', error)
    return NextResponse.json(
      { ok: false, message: 'Error procesando webhook' },
      { status: 500 }
    )
  }
}

