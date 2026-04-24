'use client'

import { useState } from 'react'
import { Bot } from 'lucide-react'
import type { AgentConfig } from '@/lib/agents/types'
import type { Cliente } from '@/types'
import AgentList from './agent-list'
import AgentDetail from './agent-detail'

interface AgentesPanelProps {
  clients: Cliente[]
}

export default function AgentesPanel({ clients }: AgentesPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null)

  return (
    <div className="flex h-full overflow-hidden border border-neutral-200 rounded-2xl bg-white">
      {/* Panel izquierdo — lista de agentes */}
      <div className="w-64 shrink-0 border-r border-neutral-100 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-neutral-100">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Agentes</p>
        </div>
        <AgentList
          selectedId={selectedAgent?.id ?? null}
          onSelect={setSelectedAgent}
        />
      </div>

      {/* Panel derecho — detalle del agente seleccionado */}
      <div className="flex-1 overflow-hidden">
        {selectedAgent ? (
          <AgentDetail agent={selectedAgent} clients={clients} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Bot className="w-10 h-10 text-neutral-200" />
            <p className="text-sm font-medium">Selecciona un agente</p>
            <p className="text-xs text-neutral-300">Elige un agente de la lista para ejecutarlo</p>
          </div>
        )}
      </div>
    </div>
  )
}
