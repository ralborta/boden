import { NextRequest, NextResponse } from 'next/server'
import { ingestBuilderbotEvent } from '@/lib/server/whatsappStore'

export async function POST(req: NextRequest) {
  console.log('--- INICIO WEBHOOK BUILDERBOT ---')

  try {
    const body = await req.json()
    console.log('📦 Payload recibido:', JSON.stringify(body, null, 2))

    if (!body?.eventName || !body?.data) {
      console.error('❌ Formato incorrecto: falta eventName o data')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await ingestBuilderbotEvent(body)
    console.log('✅ Webhook Builderbot procesado correctamente')
  } catch (error) {
    console.error('🔥 Error procesando webhook de Builderbot:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

