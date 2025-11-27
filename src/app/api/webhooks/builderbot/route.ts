import { NextRequest, NextResponse } from 'next/server'
import { ingestBuilderbotEvent } from '@/lib/server/whatsappStore'

function normalizePayload(rawBody: any) {
  if (!rawBody || typeof rawBody !== 'object') return null

  if (rawBody.eventName && rawBody.data) {
    return rawBody
  }

  // Builderbot puede enviar directamente el evento en "body"
  if (rawBody.eventName && !rawBody.data && rawBody.body) {
    return { eventName: rawBody.eventName, data: rawBody.body }
  }

  // Si no hay eventName, intentamos inferirlo según campos conocidos
  if (!rawBody.eventName) {
    const inferredEvent =
      rawBody.message?.fromMe === false || rawBody.fromMe === false
        ? 'message.incoming'
        : rawBody.message || rawBody.answer
          ? 'message.outgoing'
          : undefined

    if (inferredEvent) {
      return { eventName: inferredEvent, data: rawBody }
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  console.log('--- INICIO WEBHOOK BUILDERBOT ---')

  try {
    const body = await req.json()
    console.log('📦 Payload recibido:', JSON.stringify(body, null, 2))

    const normalized = normalizePayload(body)
    if (!normalized) {
      console.error('❌ Formato incorrecto: no se pudo inferir eventName/data')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await ingestBuilderbotEvent(normalized)
    console.log('✅ Webhook Builderbot procesado correctamente')
  } catch (error) {
    console.error('🔥 Error procesando webhook de Builderbot:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

