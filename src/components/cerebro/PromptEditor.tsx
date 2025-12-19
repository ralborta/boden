'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, AlertCircle, Brain, Save, Sparkles } from 'lucide-react'
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
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Instrucciones del Asistente</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Instrucciones del Asistente (Prompt)</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configura cómo debe comportarse tu asistente de IA</p>
        </div>
      </div>
      
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm ${
            message.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe aquí las instrucciones para el asistente de IA..."
          className="w-full h-80 p-5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none text-sm bg-gray-50/50 transition-all font-mono"
          disabled={isSaving}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-gray-400">
          <Sparkles className="w-3 h-3" />
          <span>{prompt.length} caracteres</span>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
