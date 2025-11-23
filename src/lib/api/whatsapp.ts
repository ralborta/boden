import type { WhatsAppConversation, WhatsAppMessage } from '@/types/whatsapp'

const BASE_URL = '/api/whatsapp'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
    throw new Error(errorData.message || errorData.error || `Error ${response.status}`)
  }
  return response.json()
}

export async function fetchWhatsAppConversations(): Promise<WhatsAppConversation[]> {
  try {
    const res = await fetch(`${BASE_URL}/conversations`)
    return handleResponse<WhatsAppConversation[]>(res)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'No se pudieron cargar las conversaciones'
    )
  }
}

export async function fetchWhatsAppMessages(conversationId: string): Promise<WhatsAppMessage[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/messages?conversationId=${encodeURIComponent(conversationId)}`
    )
    return handleResponse<WhatsAppMessage[]>(res)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'No se pudieron cargar los mensajes'
    )
  }
}

export async function sendWhatsAppMessage(
  conversationId: string,
  text: string
): Promise<WhatsAppMessage> {
  try {
    const res = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, text }),
    })
    return handleResponse<WhatsAppMessage>(res)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'No se pudo enviar el mensaje'
    )
  }
}

