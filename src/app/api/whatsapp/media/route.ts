import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

/**
 * Endpoint proxy para obtener media desde BuilderBot
 * Las imágenes de WhatsApp no tienen URLs directas, necesitamos obtenerlas desde BuilderBot API
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mediaUrl = searchParams.get('url')
  const mediaKey = searchParams.get('key')
  const messageId = searchParams.get('messageId')
  const conversationId = searchParams.get('conversationId')

  if (!mediaUrl && !mediaKey) {
    return NextResponse.json(
      { error: 'Se requiere url o key' },
      { status: 400 }
    )
  }

  const BOT_ID = process.env.BUILDERBOT_BOT_ID || process.env.BOT_ID
  const API_KEY = process.env.BUILDERBOT_API_KEY || process.env.BB_API_KEY
  const BUILDERBOT_BASE_URL = process.env.BUILDERBOT_BASE_URL || 'https://app.builderbot.cloud'

  if (!BOT_ID || !API_KEY) {
    return NextResponse.json(
      { error: 'BuilderBot no está configurado' },
      { status: 500 }
    )
  }

  try {
    let finalUrl = mediaUrl

    // Si tenemos mediaKey pero no URL, intentar obtenerla desde BuilderBot API
    if (mediaKey && !mediaUrl) {
      // BuilderBot Cloud API v2 endpoint para obtener media
      const mediaEndpoint = `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/media/${mediaKey}`
      
      try {
        const response = await axios.get(mediaEndpoint, {
          headers: {
            'x-api-builderbot': API_KEY,
          },
          responseType: 'arraybuffer',
          timeout: 30000,
        })

        // Retornar la imagen directamente
        return new NextResponse(response.data, {
          headers: {
            'Content-Type': response.headers['content-type'] || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      } catch (error: any) {
        console.error('[Media Proxy] Error obteniendo media desde BuilderBot:', error.message)
        // Continuar con el intento de usar la URL directa si está disponible
      }
    }

    // Si tenemos una URL directa, intentar obtenerla
    if (finalUrl) {
      // Si la URL es de BuilderBot, usar autenticación
      if (finalUrl.includes('builderbot.cloud') || finalUrl.includes('builderbot')) {
        try {
          const response = await axios.get(finalUrl, {
            headers: {
              'x-api-builderbot': API_KEY,
            },
            responseType: 'arraybuffer',
            timeout: 30000,
          })

          return new NextResponse(response.data, {
            headers: {
              'Content-Type': response.headers['content-type'] || 'image/jpeg',
              'Cache-Control': 'public, max-age=3600',
            },
          })
        } catch (error: any) {
          console.error('[Media Proxy] Error obteniendo media desde URL BuilderBot:', error.message)
        }
      } else {
        // URL externa, intentar obtenerla directamente
        try {
          const response = await axios.get(finalUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            validateStatus: (status) => status < 500, // Aceptar 404, etc.
          })

          if (response.status === 200) {
            return new NextResponse(response.data, {
              headers: {
                'Content-Type': response.headers['content-type'] || 'image/jpeg',
                'Cache-Control': 'public, max-age=3600',
              },
            })
          }
        } catch (error: any) {
          console.error('[Media Proxy] Error obteniendo media desde URL externa:', error.message)
        }
      }
    }

    // Si todo falla, retornar error
    return NextResponse.json(
      { 
        error: 'No se pudo obtener la imagen',
        details: {
          hasUrl: !!mediaUrl,
          hasKey: !!mediaKey,
          url: mediaUrl?.substring(0, 100),
        }
      },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('[Media Proxy] Error general:', error)
    return NextResponse.json(
      { error: 'Error al obtener la imagen', message: error.message },
      { status: 500 }
    )
  }
}
