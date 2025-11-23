'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Loader2, FileText, AlertCircle } from 'lucide-react'
import {
  fetchBuilderbotFiles,
  uploadBuilderbotFile,
  deleteBuilderbotFile,
} from '@/lib/api/builderbot'
import type { BuilderbotFile } from '@/types/builderbot'

export default function KnowledgeFilesList() {
  const [files, setFiles] = useState<BuilderbotFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setIsLoadingFiles(true)
    setError(null)
    try {
      const data = await fetchBuilderbotFiles()
      setFiles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los archivos')
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB')
      setTimeout(() => setError(null), 5000)
      e.target.value = ''
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      await uploadBuilderbotFile(file)
      await loadFiles() // Recargar lista
      e.target.value = '' // Reset input
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo')
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return

    setDeletingIds((prev) => new Set(prev).add(id))
    setError(null)

    try {
      await deleteBuilderbotFile(id)
      setFiles((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el archivo')
      setTimeout(() => setError(null), 5000)
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'Fecha desconocida'
    }
  }

  return (
    <div className="bg-card-light p-6 rounded-xl border border-border-light shadow-soft">
      <h2 className="text-lg font-semibold text-text-light mb-4">Base de Conocimiento</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Botón de Subir Archivo */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.txt,.doc,.docx,.md"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
            isUploading
              ? 'border-border-light bg-background-light cursor-not-allowed'
              : 'border-border-light bg-background-light hover:border-primary hover:bg-primary/5'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-subtext-light font-medium">Subiendo archivo...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-subtext-light" />
              <span className="text-subtext-light font-medium">Subir Archivo</span>
            </>
          )}
        </label>
      </div>

      {/* Lista de Archivos */}
      <div className="space-y-3">
        {isLoadingFiles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="ml-2 text-subtext-light">Cargando archivos...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-subtext-light">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay archivos subidos</p>
            <p className="text-xs mt-1">Sube archivos para alimentar la base de conocimiento</p>
          </div>
        ) : (
          files.map((file) => {
            const isDeleting = deletingIds.has(file.id)
            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-border-light rounded-lg hover:bg-background-light transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-subtext-light flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-light truncate">{file.name}</p>
                    <p className="text-xs text-subtext-light">
                      {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(file.id)}
                  disabled={isDeleting}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Eliminar archivo"
                >
                  {isDeleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

