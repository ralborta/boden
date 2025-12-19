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

    // NOTA: Reenvío a Vercel desactivado porque Vercel tiene Deployment Protection activada
    // Railway procesa los mensajes localmente (en memoria o Redis si está configurado)
    // Si necesitas que Vercel también reciba los webhooks, configura BuilderBot para
    // enviar directamente a Vercel también (además de Railway)
    // 
    // Para activar el reenvío, descomenta el código de abajo y asegúrate de:
    // 1. Desactivar Deployment Protection en Vercel, O
    // 2. Usar la URL de producción (no preview) de Vercel
    /*
    if (VERCEL_WEBHOOK_URL && !isVercel) {
      try {
        let baseUrl = VERCEL_WEBHOOK_URL.trim()
        if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
          baseUrl = `https://${baseUrl}`
        }
        
        const vercelUrl = baseUrl.endsWith('/api/webhooks/builderbot')
          ? baseUrl
          : `${baseUrl.replace(/\/$/, '')}/api/webhooks/builderbot`
        
        console.log('🔄 Reenviando webhook a Vercel:', vercelUrl)
        
        const forwardResponse = await fetch(vercelUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Boden-Railway-Forwarder/1.0',
          },
          body: JSON.stringify(body),
        })

        if (forwardResponse.ok) {
          console.log('✅ Webhook reenviado exitosamente a Vercel')
        } else {
          const errorText = await forwardResponse.text()
          console.error('❌ Error al reenviar webhook a Vercel:', forwardResponse.status, errorText)
        }
      } catch (forwardError) {
        console.error('❌ Error al reenviar webhook a Vercel:', forwardError)
      }
    }
    */

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

