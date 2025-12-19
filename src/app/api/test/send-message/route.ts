import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/builderbot'

/**
 * Endpoint de prueba para enviar un mensaje directamente a BuilderBot
 * GET /api/test/send-message?number=+5491133788190&message=Hola
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const number = searchParams.get('number')
    const message = searchParams.get('message') || 'Mensaje de prueba desde Boden'

    if (!number) {
      return NextResponse.json(
        { error: 'Parámetro "number" es requerido. Ejemplo: /api/test/send-message?number=+5491133788190&message=Hola' },
        { status: 400 }
      )
    }

    // Verificar configuración
    const hasBOT_ID = !!process.env.BUILDERBOT_BOT_ID
    const hasAPI_KEY = !!process.env.BUILDERBOT_API_KEY

    if (!hasBOT_ID || !hasAPI_KEY) {
      return NextResponse.json(
        {
          error: 'BuilderBot no configurado',
          missing: {
            BUILDERBOT_BOT_ID: !hasBOT_ID,
            BUILDERBOT_API_KEY: !hasAPI_KEY,
          },
          environment: process.env.VERCEL ? 'Vercel' : process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local',
          suggestion: 'Configura las variables de entorno en Vercel: Settings → Environment Variables',
        },
        { status: 500 }
      )
    }

    console.log('[TEST] Enviando mensaje de prueba:', { number, message })

    try {
      const result = await sendWhatsAppMessage({
        number: number.replace(/\s|-/g, '').startsWith('+') ? number.replace(/\s|-/g, '') : `+${number.replace(/\s|-/g, '')}`,
        message,
        checkIfExists: false,
      })

      return NextResponse.json({
        success: true,
        message: 'Mensaje enviado exitosamente',
        result,
        config: {
          botId: `${process.env.BUILDERBOT_BOT_ID?.substring(0, 8)}...${process.env.BUILDERBOT_BOT_ID?.substring((process.env.BUILDERBOT_BOT_ID?.length || 0) - 4)}`,
          apiKeyLength: process.env.BUILDERBOT_API_KEY?.length || 0,
          baseUrl: process.env.BUILDERBOT_BASE_URL || 'https://app.builderbot.cloud',
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const axiosError = (error as any)?.response

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: axiosError
            ? {
                status: axiosError.status,
                statusText: axiosError.statusText,
                data: axiosError.data,
              }
            : undefined,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error inesperado',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

