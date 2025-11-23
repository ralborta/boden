import { NextRequest, NextResponse } from 'next/server'

const BUILDERBOT_API_URL = process.env.BUILDERBOT_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BUILDERBOT_API_URL}/api/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error fetching files')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/builderbot/files:', error)
    // Retornar datos mock si la API no está disponible
    return NextResponse.json({
      files: [
        {
          id: '1',
          name: 'documento-ejemplo.pdf',
          size: 245678,
          uploadedAt: new Date().toISOString(),
        },
      ],
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    const response = await fetch(`${BUILDERBOT_API_URL}/api/files`, {
      method: 'POST',
      body: uploadFormData,
    })

    if (!response.ok) {
      throw new Error('Error uploading file')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/builderbot/files:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    const response = await fetch(`${BUILDERBOT_API_URL}/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error deleting file')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/builderbot/files:', error)
    return NextResponse.json(
      { error: 'Error deleting file' },
      { status: 500 }
    )
  }
}

