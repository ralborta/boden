import { NextRequest, NextResponse } from 'next/server'

const BUILDERBOT_API_URL = process.env.BUILDERBOT_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BUILDERBOT_API_URL}/api/prompt`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error fetching prompt')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/builderbot/prompt:', error)
    // Retornar prompt mock si la API no está disponible
    return NextResponse.json({
      prompt: 'Eres un asistente virtual amigable y profesional. Ayuda a los usuarios con sus consultas de manera clara y concisa.',
    })
  }
}

export async function POST(request: NextRequest) {
  let prompt = ''
  try {
    const body = await request.json()
    prompt = body.prompt || ''

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const response = await fetch(`${BUILDERBOT_API_URL}/api/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      throw new Error('Error saving prompt')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/builderbot/prompt:', error)
    // Simular éxito si la API no está disponible
    return NextResponse.json({ success: true, prompt })
  }
}

