'use client'

import { useEffect } from 'react'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log al servidor
    console.error('[PublicError Boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-red-100">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-3">
          Oops, algo salió mal
        </h1>

        <p className="text-neutral-600 text-sm mb-2 font-mono bg-red-50 p-4 rounded-lg border border-red-200 break-words">
          {error.message || 'Error desconocido'}
        </p>

        <p className="text-neutral-500 text-sm mb-8">
          Nuestro equipo ha sido notificado. Por favor intenta de nuevo.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir al inicio
          </button>

          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            Intentar de nuevo
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-xs text-neutral-400">
            ID del error: {error.digest || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
