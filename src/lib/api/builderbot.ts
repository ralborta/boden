import type { BuilderbotFile, BuilderbotPrompt, ApiResponse } from '@/types/builderbot'

const API_BASE = '/api/builderbot'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
    throw new Error(errorData.message || errorData.error || `Error ${response.status}`)
  }
  return response.json()
}

export async function fetchBuilderbotPrompt(): Promise<BuilderbotPrompt> {
  try {
    const response = await fetch(`${API_BASE}/prompt`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return handleResponse<BuilderbotPrompt>(response)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'No se pudo cargar el prompt'
    )
  }
}

export async function updateBuilderbotPrompt(content: string): Promise<BuilderbotPrompt> {
  try {
    const response = await fetch(`${API_BASE}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })
    return handleResponse<BuilderbotPrompt>(response)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'No se pudo guardar el prompt'
    )
  }
}

export async function fetchBuilderbotFiles(): Promise<BuilderbotFile[]> {
  try {
    const response = await fetch(`${API_BASE}/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await handleResponse<{ files: BuilderbotFile[] }>(response)
    return data.files || []
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'No se pudieron cargar los archivos'
    )
  }
}

export async function uploadBuilderbotFile(file: File): Promise<BuilderbotFile> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE}/files`, {
      method: 'POST',
      body: formData,
    })
    return handleResponse<BuilderbotFile>(response)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'No se pudo subir el archivo'
    )
  }
}

export async function deleteBuilderbotFile(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/files?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('No se pudo eliminar el archivo')
    }
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'No se pudo eliminar el archivo'
    )
  }
}

