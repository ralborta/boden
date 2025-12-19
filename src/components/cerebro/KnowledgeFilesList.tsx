'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Loader2, FileText, AlertCircle, FolderOpen, Sparkles } from 'lucide-react'
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
      await loadFiles()
      e.target.value = ''
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
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
          <FolderOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Base de Conocimiento</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona los archivos que alimentan tu asistente</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
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
          className={`group flex items-center justify-center gap-3 w-full border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 ${
            isUploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-primary-300 bg-gradient-to-br from-primary-50 to-purple-50 hover:border-primary-500 hover:from-primary-100 hover:to-purple-100 hover:shadow-lg'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
              <span className="text-gray-700 font-semibold">Subiendo archivo...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <span className="text-gray-700 font-semibold block">Subir Archivo</span>
                <span className="text-xs text-gray-500 mt-1">PDF, TXT, DOC, DOCX, MD (máx. 10MB)</span>
              </div>
            </>
          )}
        </label>
      </div>

      {/* Lista de Archivos */}
      <div className="space-y-3">
        {isLoadingFiles ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="ml-3 text-gray-600">Cargando archivos...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No hay archivos subidos</p>
            <p className="text-sm text-gray-500">Sube archivos para alimentar la base de conocimiento</p>
          </div>
        ) : (
          files.map((file) => {
            const isDeleting = deletingIds.has(file.id)
            return (
              <div
                key={file.id}
                className="group flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-purple-50/50 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate mb-1">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-lg font-medium">{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(file.id)}
                  disabled={isDeleting}
                  className="ml-4 p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
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
