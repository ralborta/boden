import { NextRequest, NextResponse } from 'next/server'
import type { WhatsAppConversation } from '@/types/whatsapp'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || process.env.BUILDERBOT_WHATSAPP_API_URL

// Datos mock para desarrollo
const mockConversations: WhatsAppConversation[] = [
  {
    id: '1',
    contactName: 'María González',
    contactPhone: '+54 11 1234-5678',
    lastMessagePreview: 'Hola, necesito información sobre sus productos',
    lastMessageAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutos atrás
    unreadCount: 2,
    status: 'open',
    channel: 'whatsapp',
  },
  {
    id: '2',
    contactName: 'Juan Pérez',
    contactPhone: '+54 11 2345-6789',
    lastMessagePreview: 'Perfecto, gracias por la ayuda',
    lastMessageAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 horas atrás
    unreadCount: 0,
    status: 'closed',
    channel: 'whatsapp',
  },
  {
    id: '3',
    contactName: 'Ana Martínez',
    contactPhone: '+54 11 3456-7890',
    lastMessagePreview: '¿Cuál es el precio del plan premium?',
    lastMessageAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutos atrás
    unreadCount: 1,
    status: 'pending',
    channel: 'whatsapp',
  },
  {
    id: '4',
    contactName: 'Carlos Rodríguez',
    contactPhone: '+54 11 4567-8901',
    lastMessagePreview: 'Necesito hablar con un agente',
    lastMessageAt: new Date(Date.now() - 1 * 3600000).toISOString(), // 1 hora atrás
    unreadCount: 0,
    status: 'open',
    channel: 'whatsapp',
  },
  {
    id: '5',
    contactName: 'Laura Fernández',
    contactPhone: '+54 11 5678-9012',
    lastMessagePreview: 'Excelente servicio, muchas gracias',
    lastMessageAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 día atrás
    unreadCount: 0,
    status: 'closed',
    channel: 'whatsapp',
  },
]

export async function GET(request: NextRequest) {
  try {
    if (!WHATSAPP_API_URL) {
      // Retornar datos mock si no hay API configurada
      return NextResponse.json(mockConversations)
    }

    const response = await fetch(`${WHATSAPP_API_URL}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Error fetching conversations')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/whatsapp/conversations:', error)
    
    // Si hay error con la API real, devolver mock como fallback
    if (WHATSAPP_API_URL) {
      return NextResponse.json(
        { message: 'Error al conectar con el servicio de WhatsApp' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(mockConversations)
  }
}

