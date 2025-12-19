'use client'

import { Brain } from 'lucide-react'
import PromptEditor from '@/components/cerebro/PromptEditor'
import KnowledgeFilesList from '@/components/cerebro/KnowledgeFilesList'

export default function CerebroPage() {
  return (
    <div className="min-h-screen">
      {/* Título y subtítulo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Configuración del Asistente</h1>
            <p className="text-gray-500 mt-0.5">Define el comportamiento del bot y su base de conocimiento</p>
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna 1 – Prompt Editor */}
        <PromptEditor />

        {/* Columna 2 – Base de Conocimiento */}
        <KnowledgeFilesList />
      </div>
    </div>
  )
}
