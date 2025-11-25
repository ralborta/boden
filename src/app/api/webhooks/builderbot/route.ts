import { NextRequest, NextResponse } from 'next/server'
import { ingestBuilderbotEvent } from '@/lib/server/whatsappStore'

export async function POST(req: NextRequest) {
  const body = await req.json()

  console.log('📩 Webhook Builderbot recibido:', JSON.stringify(body, null, 2))

  try {
    ingestBuilderbotEvent(body)
  } catch (error) {
    console.error('Error procesando webhook de Builderbot:', error)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

