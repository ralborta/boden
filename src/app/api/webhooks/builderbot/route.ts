import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  console.log('📩 Webhook Builderbot recibido:', JSON.stringify(body, null, 2))

  const eventName = body?.eventName
  const data = body?.data

  switch (eventName) {
    case 'message.incoming':
      // data.body, data.from, data.name, etc.
      break

    case 'message.outgoing':
      // data.answer, data.from, etc.
      break

    case 'message.calling':
      // llamadas
      break

    default:
      console.warn('Evento no manejado:', eventName)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

