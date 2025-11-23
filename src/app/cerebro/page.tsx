'use client'

import PromptEditor from '@/components/cerebro/PromptEditor'
import KnowledgeFilesList from '@/components/cerebro/KnowledgeFilesList'

export default function CerebroPage() {
  return (
    <div className="min-h-screen bg-background-light">
      {/* Título y subtítulo */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-light mb-2">Configuración del Asistente</h1>
        <p className="text-subtext-light">Define el comportamiento del bot y su base de conocimiento.</p>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Columna 1 – Prompt Editor */}
        <PromptEditor />

        {/* Columna 2 – Base de Conocimiento */}
        <KnowledgeFilesList />
      </div>
    </div>
  )
}
