'use client'

import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'
import type { AgentConfig, AgentResult } from '@/lib/agents/types'
import type { Cliente } from '@/types'

interface ExecutionPanelProps {
  agent: AgentConfig
  clients: Cliente[]
  onResult: (result: AgentResult) => void
}

export default function ExecutionPanel({ agent, clients, onResult }: ExecutionPanelProps) {
  const [clienteId, setClienteId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtrar clientes compatibles con el pack del agente
  const compatibleClients = clients.filter(
    (c) => c.pack && agent.packs.includes(c.pack)
  )

  async function handleExecute() {
    if (!clienteId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId }),
      })
      const data = await res.json()

      if (!res.ok && !data.agente) {
        setError(data.error ?? 'Error desconocido')
        return
      }

      onResult(data as AgentResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <h3 className="font-semibold text-neutral-900 mb-1">Ejecutar: {agent.nombre}</h3>
      <p className="text-sm text-neutral-500 mb-4">{agent.descripcion}</p>

      <div className="space-y-3">
        <div>
          <label htmlFor="cliente-select" className="block text-sm font-medium text-neutral-700 mb-1">
            Cliente
          </label>
          <select
            id="cliente-select"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
            disabled={loading}
          >
            <option value="">Seleccionar cliente...</option>
            {compatibleClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.negocio} — {c.nombre}
              </option>
            ))}
          </select>
          {compatibleClients.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              No hay clientes con pack compatible ({agent.packs.join(', ')})
            </p>
          )}
        </div>

        <button
          onClick={handleExecute}
          disabled={!clienteId || loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Ejecutando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Ejecutar agente
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
      </div>
    </div>
  )
}
