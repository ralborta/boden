import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('📩 Webhook Builderbot recibido:', JSON.stringify(body, null, 2))

    const eventName = body?.eventName
    const data = body?.data

    // Aquí luego podés guardar en BD, crear conversación, etc.
    switch (eventName) {
      case 'message.incoming':
        // data.body, data.from, data.name, etc.
        console.log('📥 Mensaje entrante:', {
          from: data?.from,
          name: data?.name,
          body: data?.body,
        })
        // TODO: Guardar en BD, crear conversación si no existe, etc.
        break

      case 'message.outgoing':
        // data.answer, data.from, etc.
        console.log('📤 Mensaje saliente:', {
          to: data?.to,
          answer: data?.answer,
        })
        // TODO: Actualizar estado del mensaje en BD
        break

      case 'message.calling':
        // llamadas
        console.log('📞 Llamada:', {
          from: data?.from,
          type: data?.type,
        })
        // TODO: Manejar llamadas
        break

      default:
        console.warn('⚠️ Evento no manejado:', eventName)
    }

    return NextResponse.json({ ok: true, eventName }, { status: 200 })
  } catch (error) {
    console.error('❌ Error procesando webhook:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

