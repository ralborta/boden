import { NextRequest, NextResponse } from 'next/server'
import { ingestBuilderbotEvent } from '@/lib/server/whatsappStore'

// URL de Vercel para reenviar webhooks desde Railway
const VERCEL_WEBHOOK_URL = process.env.VERCEL_WEBHOOK_URL || process.env.VERCEL_URL
const isRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || 
  process.env.RAILWAY_ENVIRONMENT_NAME ||
  process.env.RAILWAY_SERVICE_NAME ||
  process.env.RAILWAY_PROJECT_NAME
)
const isVercel = process.env.VERCEL === '1'

// Log de configuración al iniciar
console.log('[Webhook Config]', {
  isRailway,
  isVercel,
  hasVercelUrl: !!VERCEL_WEBHOOK_URL,
  vercelUrl: VERCEL_WEBHOOK_URL,
  railwayEnv: process.env.RAILWAY_ENVIRONMENT,
  railwayEnvName: process.env.RAILWAY_ENVIRONMENT_NAME,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('📩 Webhook Builderbot recibido:', JSON.stringify(body, null, 2))

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

    // Si tenemos URL de Vercel configurada Y no estamos en Vercel, reenviar
    // (Esto cubre el caso de Railway, pero también cualquier otro servidor)
    if (VERCEL_WEBHOOK_URL && !isVercel) {
      try {
        const vercelUrl = VERCEL_WEBHOOK_URL.endsWith('/api/webhooks/builderbot')
          ? VERCEL_WEBHOOK_URL
          : `${VERCEL_WEBHOOK_URL.replace(/\/$/, '')}/api/webhooks/builderbot`
        
        console.log('🔄 Reenviando webhook a Vercel:', vercelUrl)
        console.log('🔄 Payload:', JSON.stringify(body, null, 2))
        
        // Crear timeout manual para compatibilidad
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        try {
          const forwardResponse = await fetch(vercelUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Boden-Railway-Forwarder/1.0',
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)

          const responseText = await forwardResponse.text()
          
          if (forwardResponse.ok) {
            console.log('✅ Webhook reenviado exitosamente a Vercel')
            console.log('✅ Respuesta de Vercel:', responseText)
          } else {
            console.error('❌ Error al reenviar webhook a Vercel:', {
              status: forwardResponse.status,
              statusText: forwardResponse.statusText,
              response: responseText,
            })
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          throw fetchError
        }
      } catch (forwardError) {
        console.error('❌ Error al reenviar webhook a Vercel:', {
          error: forwardError instanceof Error ? forwardError.message : String(forwardError),
          stack: forwardError instanceof Error ? forwardError.stack : undefined,
        })
        // Continuar procesando localmente aunque falle el reenvío
      }
    } else {
      if (!VERCEL_WEBHOOK_URL) {
        console.log('ℹ️ No hay VERCEL_WEBHOOK_URL configurada, no se reenviará a Vercel')
      }
      if (isVercel) {
        console.log('ℹ️ Ya estamos en Vercel, no se reenviará')
      }
    }

    // Procesar y almacenar el evento localmente
    // (En Railway esto será en memoria, en Vercel será en Redis)
    try {
      await ingestBuilderbotEvent({ eventName, data })
      console.log('✅ Evento procesado y almacenado localmente:', eventName)
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
    console.error('❌ Error procesando webhook de Builderbot:', error)
    return NextResponse.json(
      { error: 'Error procesando el webhook', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

