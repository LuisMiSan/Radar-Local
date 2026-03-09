'use client'

import { useState } from 'react'
import type { AgentConfig, AgentResult } from '@/lib/agents/types'
import type { Cliente } from '@/types'
import AgentGrid from './agent-grid'
import ExecutionPanel from './execution-panel'
import ResultViewer from './result-viewer'

interface AgentesPanelProps {
  clients: Cliente[]
}

export default function AgentesPanel({ clients }: AgentesPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null)
  const [result, setResult] = useState<AgentResult | null>(null)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Grid de agentes (2/3) */}
      <div className="xl:col-span-2">
        <AgentGrid
          selectedAgent={selectedAgent}
          onSelectAgent={(agent) => {
            setSelectedAgent(agent)
            setResult(null)
          }}
        />
      </div>

      {/* Panel lateral (1/3) */}
      <div className="space-y-4">
        {selectedAgent ? (
          <>
            <ExecutionPanel
              agent={selectedAgent}
              clients={clients}
              onResult={setResult}
            />
            {result && (
              <ResultViewer
                result={result}
                onClose={() => setResult(null)}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <p className="text-neutral-500 text-sm">
              Selecciona un agente para ejecutarlo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
