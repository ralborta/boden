import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { decryptWhatsAppMedia } from '@/lib/whatsapp-decrypt'

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
    // BuilderBot envía archivos encriptados (.enc) que necesitan ser descargados
    if (mediaKey && !mediaUrl) {
      // Intentar múltiples endpoints posibles de BuilderBot para obtener media
      const possibleEndpoints = [
        `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/media/${mediaKey}`,
        `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/messages/${messageId}/media`,
        `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/download/${mediaKey}`,
      ]
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log('[Media Proxy] Intentando descargar desde:', endpoint)
          const response = await axios.get(endpoint, {
            headers: {
              'x-api-builderbot': API_KEY,
            },
            responseType: 'arraybuffer',
            timeout: 30000,
          })

          // Detectar tipo de contenido
          const contentType = response.headers['content-type'] || 
                            (response.headers['content-disposition']?.includes('image') ? 'image/jpeg' : 'application/octet-stream')
          
          console.log('[Media Proxy] ✅ Archivo descargado exitosamente, tamaño:', response.data.length, 'bytes, tipo:', contentType)

          // Retornar el archivo directamente (puede ser .enc o desencriptado)
          return new NextResponse(response.data, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
              'Content-Disposition': `inline; filename="media"`,
            },
          })
        } catch (error: any) {
          console.log('[Media Proxy] Endpoint falló:', endpoint, error.response?.status || error.message)
          // Continuar con el siguiente endpoint
        }
      }
      
      console.error('[Media Proxy] ❌ Todos los endpoints fallaron para mediaKey:', mediaKey)
    }
    
    // Si la URL contiene "builderbot:mediaKey:", extraer el mediaKey
    if (mediaUrl && mediaUrl.startsWith('builderbot:mediaKey:')) {
      const extractedKey = mediaUrl.replace('builderbot:mediaKey:', '')
      console.log('[Media Proxy] URL contiene mediaKey, extrayendo:', extractedKey.substring(0, 50))
      
      // Intentar descargar usando el mediaKey extraído
      const possibleEndpoints = [
        `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/media/${extractedKey}`,
        `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/messages/${messageId}/media`,
        `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/download/${extractedKey}`,
      ]
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log('[Media Proxy] Intentando descargar desde URL con mediaKey:', endpoint)
          const response = await axios.get(endpoint, {
            headers: {
              'x-api-builderbot': API_KEY,
            },
            responseType: 'arraybuffer',
            timeout: 30000,
          })

          const contentType = response.headers['content-type'] || 'application/octet-stream'
          console.log('[Media Proxy] ✅ Archivo descargado desde URL con mediaKey, tamaño:', response.data.length, 'bytes')

          return new NextResponse(response.data, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
            },
          })
        } catch (error: any) {
          console.log('[Media Proxy] Endpoint falló:', endpoint, error.response?.status || error.message)
        }
      }
    }

    // Si tenemos una URL directa, intentar obtenerla
    if (finalUrl) {
      // Si la URL es de WhatsApp (mmg.whatsapp.net), necesita mediaKey para desencriptar
      if (finalUrl.includes('mmg.whatsapp.net') || finalUrl.includes('whatsapp.net')) {
        console.log('[Media Proxy] URL de WhatsApp detectada, usando mediaKey para desencriptar')
        
        // Si tenemos mediaKey y messageId, intentar obtener el archivo desencriptado desde BuilderBot
        // BuilderBot puede tener endpoints específicos para obtener media desencriptado
        if (mediaKey && messageId) {
          // Intentar endpoints posibles de BuilderBot para obtener media desencriptado
          // Basado en la estructura de la API: /api/v2/{BOT_ID}/messages/{messageId}/media
          const possibleEndpoints = [
            `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/messages/${messageId}/media`,
            `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/media/${mediaKey}`,
            `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/download/${mediaKey}`,
            `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/messages/${messageId}/download`,
          ]
          
          for (const endpoint of possibleEndpoints) {
            try {
              console.log('[Media Proxy] Intentando descargar archivo desencriptado desde:', endpoint)
              const response = await axios.get(endpoint, {
                headers: {
                  'x-api-builderbot': API_KEY,
                },
                responseType: 'arraybuffer',
                timeout: 30000,
              })

              const contentType = response.headers['content-type'] || 'image/jpeg'
              console.log('[Media Proxy] ✅ Archivo desencriptado descargado desde BuilderBot, tamaño:', response.data.length, 'bytes, tipo:', contentType)

              return new NextResponse(response.data, {
                headers: {
                  'Content-Type': contentType,
                  'Cache-Control': 'public, max-age=3600',
                },
              })
            } catch (error: any) {
              const status = error.response?.status
              const statusText = error.response?.statusText
              console.log('[Media Proxy] Endpoint falló:', endpoint, status || statusText || error.message)
              if (error.response?.data) {
                console.log('[Media Proxy] Respuesta de error:', JSON.stringify(error.response.data).substring(0, 200))
              }
            }
          }
          
          console.warn('[Media Proxy] ⚠️ Todos los endpoints de BuilderBot fallaron, intentando descargar directamente desde WhatsApp')
        }
        
        // Si no tenemos mediaKey/messageId o los endpoints fallaron, intentar descargar directamente
        // Esto descargará el archivo encriptado (.enc) que necesitará ser desencriptado
        try {
          console.log('[Media Proxy] Descargando directamente desde URL de WhatsApp (será .enc si no se desencripta)')
          const response = await axios.get(finalUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            validateStatus: (status) => status < 500,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
          })

          if (response.status === 200) {
            const contentType = response.headers['content-type'] || 'application/octet-stream'
            const encryptedData = Buffer.from(response.data)
            console.log('[Media Proxy] Archivo descargado desde WhatsApp, tamaño:', encryptedData.length, 'bytes')
            
            // Si tenemos mediaKey, intentar desencriptar
            if (mediaKey) {
              try {
                console.log('[Media Proxy] Intentando desencriptar archivo usando mediaKey...')
                
                // Usar el mediaType del parámetro o determinar basado en content-type
                let decryptMediaType: 'image' | 'video' | 'document' | 'audio' | 'sticker' = mediaType || 'image'
                if (!mediaType) {
                  if (contentType.includes('video')) decryptMediaType = 'video'
                  else if (contentType.includes('audio')) decryptMediaType = 'audio'
                  else if (contentType.includes('pdf') || contentType.includes('document')) decryptMediaType = 'document'
                  else if (contentType.includes('webp') && finalUrl.includes('sticker')) decryptMediaType = 'sticker'
                }
                
                const decryptedData = decryptWhatsAppMedia(encryptedData, mediaKey, decryptMediaType)
                console.log('[Media Proxy] ✅ Archivo desencriptado exitosamente, tamaño original:', encryptedData.length, 'bytes, tamaño desencriptado:', decryptedData.length, 'bytes')
                
                // Determinar content-type correcto del archivo desencriptado
                const finalContentType = contentType.includes('octet-stream') 
                  ? (decryptMediaType === 'image' ? 'image/jpeg' : decryptMediaType === 'video' ? 'video/mp4' : contentType)
                  : contentType
                
                return new NextResponse(decryptedData, {
                  headers: {
                    'Content-Type': finalContentType,
                    'Cache-Control': 'public, max-age=3600',
                  },
                })
              } catch (decryptError: any) {
                console.error('[Media Proxy] ❌ Error desencriptando archivo:', decryptError.message)
                // Si falla la desencriptación, retornar el archivo encriptado
                // (el navegador mostrará error pero al menos tenemos el archivo)
                return new NextResponse(encryptedData, {
                  headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=3600',
                  },
                })
              }
            } else {
              // No tenemos mediaKey, retornar archivo encriptado
              console.warn('[Media Proxy] ⚠️ No hay mediaKey, retornando archivo encriptado')
              return new NextResponse(encryptedData, {
                headers: {
                  'Content-Type': contentType,
                  'Cache-Control': 'public, max-age=3600',
                },
              })
            }
          }
        } catch (error: any) {
          console.error('[Media Proxy] Error descargando desde URL de WhatsApp:', error.message)
        }
      }
      // Si la URL es de BuilderBot, usar autenticación
      else if (finalUrl.includes('builderbot.cloud') || finalUrl.includes('builderbot')) {
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
