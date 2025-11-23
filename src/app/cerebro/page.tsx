'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, User, Upload, Trash2 } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  size: number
  uploadedAt: string
}

export default function CerebroPage() {
  const [prompt, setPrompt] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPrompt()
    loadFiles()
  }, [])

  const loadPrompt = async () => {
    try {
      const response = await fetch('/api/builderbot/prompt')
      if (response.ok) {
        const data = await response.json()
        setPrompt(data.prompt || '')
      }
    } catch (error) {
      console.error('Error loading prompt:', error)
    }
  }

  const loadFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/builderbot/files')
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrompt = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/builderbot/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (response.ok) {
        alert('Prompt guardado exitosamente')
      } else {
        alert('Error al guardar el prompt')
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      alert('Error al guardar el prompt')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    try {
      const response = await fetch('/api/builderbot/files', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await loadFiles()
        e.target.value = '' // Reset input
      } else {
        alert('Error al subir el archivo')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir el archivo')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/builderbot/files?id=${fileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadFiles()
      } else {
        alert('Error al eliminar el archivo')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error al eliminar el archivo')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header Superior */}
      <header className="bg-white border-b border-border-light px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-subtext-light" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-subtext-light hover:text-text-light transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-text-light mb-8">Configuración del Asistente</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna 1: Prompt */}
          <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
            <h2 className="text-lg font-semibold text-text-light mb-4">Instrucciones del Bot</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Escribe aquí las instrucciones para el asistente de IA..."
              className="w-full h-64 p-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <button
              onClick={handleSavePrompt}
              disabled={saving}
              className="mt-4 w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

          {/* Columna 2: Base de Conocimiento */}
          <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
            <h2 className="text-lg font-semibold text-text-light mb-4">Base de Conocimiento</h2>
            
            {/* Botón de Subir Archivo */}
            <div className="mb-6">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.txt,.doc,.docx,.md"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 w-full bg-background-light border-2 border-dashed border-border-light rounded-lg p-6 cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="w-5 h-5 text-subtext-light" />
                <span className="text-subtext-light font-medium">Subir Archivo</span>
              </label>
            </div>

            {/* Lista de Archivos */}
            <div className="space-y-3">
              {loading && files.length === 0 ? (
                <p className="text-subtext-light text-center py-8">Cargando archivos...</p>
              ) : files.length === 0 ? (
                <p className="text-subtext-light text-center py-8">No hay archivos subidos</p>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 border border-border-light rounded-lg hover:bg-background-light transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-light truncate">{file.name}</p>
                      <p className="text-xs text-subtext-light">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

