import axios from 'axios'

const BUILDERBOT_BASE_URL =
  process.env.BUILDERBOT_BASE_URL || 'https://app.builderbot.cloud'

export interface SendWhatsAppOptions {
  number: string // número en formato internacional
  message: string // contenido del mensaje
  mediaUrl?: string // opcional
  checkIfExists?: boolean // default false
}

/**
 * Envía UN mensaje de WhatsApp vía BuilderBot Cloud (API v2).
 * - Unico destinatario por llamada (sin batch).
 */
export async function sendWhatsAppMessage(options: SendWhatsAppOptions) {
  const { number, message, mediaUrl, checkIfExists = false } = options

  // Leer SIEMPRE del entorno en tiempo de ejecución, no en import-time
  let BOT_ID =
    (process.env.BUILDERBOT_BOT_ID ||
      process.env.BUILDERBOT_BOTID ||
      process.env.BUILDERBOT_ID ||
      process.env.BOT_ID ||
      process.env.BUILDERBOT_TEST_BOT_ID ||
      '').trim()
  const API_KEY =
    (process.env.BUILDERBOT_API_KEY ||
      process.env.BUILDERBOT_KEY ||
      process.env.BB_API_KEY ||
      process.env.BUILDERBOT_TEST_API_KEY ||
      '').trim()

  // Fallback temporal para pruebas si el BOT_ID no llega por entorno
  if (!BOT_ID) {
    BOT_ID = '5e3f81b5-8f3f-4684-b22c-03567371b6c1'
  }

  if (!BOT_ID || !API_KEY) {
    throw new Error(
      'BuilderBot no configurado: define BUILDERBOT_BOT_ID y BUILDERBOT_API_KEY'
    )
  }

  const url = `${BUILDERBOT_BASE_URL}/api/v2/${BOT_ID}/messages`

  const body: Record<string, any> = {
    messages: {
      content: message,
    },
    number,
    checkIfExists,
  }

  if (mediaUrl) {
    body.messages.mediaUrl = mediaUrl
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-builderbot': API_KEY as string,
  }

  console.log('[sendWhatsAppMessage] Enviando a BuilderBot:', {
    url,
    number,
    messageLength: message.length,
    hasMediaUrl: !!mediaUrl,
    checkIfExists,
    botIdLength: BOT_ID.length,
    apiKeyLength: API_KEY.length,
  })

  try {
    const response = await axios.post(url, body, { headers, timeout: 30000 })
    console.log('[sendWhatsAppMessage] ✅ Respuesta exitosa de BuilderBot:', {
      status: response.status,
      data: JSON.stringify(response.data).substring(0, 200),
    })
    return response.data
  } catch (error: any) {
    // Verificar si es un error de axios
    if (error?.response || error?.request) {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url || url,
        method: error.config?.method || 'POST',
      }
      console.error('[sendWhatsAppMessage] ❌ Error de axios:', errorDetails)
      throw new Error(
        `Error al enviar mensaje a BuilderBot: ${error.message} (${error.response?.status || 'NO STATUS'}) - ${JSON.stringify(error.response?.data || {}).substring(0, 200)}`
      )
    }
    console.error('[sendWhatsAppMessage] ❌ Error desconocido:', error)
    throw error
  }
}



