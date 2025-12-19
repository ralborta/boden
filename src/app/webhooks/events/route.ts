import { NextRequest, NextResponse } from 'next/server'
import { ingestBuilderbotEvent } from '@/lib/server/whatsappStore'

// Este endpoint maneja webhooks de BuilderBot en la ruta /webhooks/events
// BuilderBot está configurado para enviar a esta ruta específica

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('📩 Webhook recibido en /webhooks/events:', JSON.stringify(body, null, 2))

    const eventName = body?.eventName || body?.event
    const data = body?.data || body?.payload || body

    if (!eventName) {
      console.warn('⚠️ Webhook sin eventName:', body)
      return NextResponse.json({ ok: false, error: 'eventName is required' }, { status: 400 })
    }

    if (!data) {
      console.warn('⚠️ Webhook sin data:', body)
      return NextResponse.json({ ok: false, error: 'data is required' }, { status: 400 })
    }

    // Procesar y almacenar el evento
    try {
      await ingestBuilderbotEvent({ eventName, data })
      console.log('✅ Evento procesado y almacenado:', eventName)
    } catch (ingestError) {
      console.error('❌ Error en ingestBuilderbotEvent:', {
        error: ingestError instanceof Error ? ingestError.message : String(ingestError),
        stack: ingestError instanceof Error ? ingestError.stack : undefined,
      })
      // Continuar aunque falle el ingest para no romper el webhook
    }

    switch (eventName) {
      case 'message.incoming':
        console.log('✅ Mensaje entrante procesado')
        break

      case 'message.outgoing':
        console.log('✅ Mensaje saliente procesado')
        break

      case 'message.calling':
        console.log('📞 Llamada recibida')
        break

      default:
        console.warn('⚠️ Evento no manejado:', eventName)
    }

    return NextResponse.json({ ok: true, eventName }, { status: 200 })
  } catch (error) {
    console.error('❌ Error procesando webhook:', error)
    return NextResponse.json(
      { error: 'Error procesando el webhook', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

