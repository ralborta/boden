'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { fetchBuilderbotPrompt, updateBuilderbotPrompt } from '@/lib/api/builderbot'

const DEFAULT_PROMPT = 'Eres un asistente virtual amigable y profesional. Ayuda a los usuarios con sus consultas de manera clara y concisa. Responde siempre de forma útil y respetuosa.'

export default function PromptEditor() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadPrompt()
  }, [])

  const loadPrompt = async () => {
    setIsLoading(true)
    try {
      const data = await fetchBuilderbotPrompt()
      if (data.content) {
        setPrompt(data.content)
      }
    } catch (error) {
      console.error('Error loading prompt:', error)
      // Mantener el prompt por defecto si hay error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!prompt.trim()) {
      setMessage({ type: 'error', text: 'El prompt no puede estar vacío' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      await updateBuilderbotPrompt(prompt)
      setMessage({ type: 'success', text: 'Prompt actualizado correctamente' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo guardar, intenta nuevamente',
      })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card-light p-6 rounded-xl border border-border-light shadow-soft">
        <h2 className="text-lg font-semibold text-text-light mb-4">Instrucciones del Asistente (Prompt)</h2>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card-light p-6 rounded-xl border border-border-light shadow-soft">
      <h2 className="text-lg font-semibold text-text-light mb-4">Instrucciones del Asistente (Prompt)</h2>
      
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Escribe aquí las instrucciones para el asistente de IA..."
        className="w-full h-64 p-4 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
        disabled={isSaving}
      />
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  )
}

