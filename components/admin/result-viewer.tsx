'use client'

import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import type { AgentResult } from '@/lib/agents/types'
import { AGENTE_LABELS } from '@/types'

interface ResultViewerProps {
  result: AgentResult
  onClose: () => void
}

export default function ResultViewer({ result, onClose }: ResultViewerProps) {
  const isError = result.estado === 'error'

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      {/* Cabecera */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
          <div>
            <h3 className="font-semibold text-neutral-900">
              {AGENTE_LABELS[result.agente] ?? result.agente}
            </h3>
            <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
              {isError ? 'Error' : 'Completada'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      {/* Resumen */}
      <div className="bg-neutral-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-neutral-700">{result.resumen}</p>
      </div>

      {/* Datos (JSON formateado) */}
      <details className="group">
        <summary className="text-sm font-medium text-neutral-600 cursor-pointer hover:text-neutral-900 transition-colors">
          Ver datos completos
        </summary>
        <pre className="mt-2 bg-neutral-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
          {JSON.stringify(result.datos, null, 2)}
        </pre>
      </details>
    </div>
  )
}
