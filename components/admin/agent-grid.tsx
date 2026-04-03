'use client'

// Importamos directamente de config.ts (no del barrel index.ts)
// porque index.ts importa clients/tasks que usan supabase-admin (server-only)
import { getAgentsByCategory } from '@/lib/agents/config'
import type { AgentConfig } from '@/lib/agents/types'
import AgentCard from './agent-card'

interface AgentGridProps {
  selectedAgent: AgentConfig | null
  onSelectAgent: (agent: AgentConfig) => void
}

const categoryLabels: Record<string, { title: string; subtitle: string }> = {
  map_pack: {
    title: 'Map Pack',
    subtitle: 'Posicionamiento en Google Maps P0',
  },
  geo_aeo: {
    title: 'GEO / AEO',
    subtitle: 'Presencia en LLMs y búsqueda por voz',
  },
  reporte: {
    title: 'Reporte',
    subtitle: 'Informes consolidados',
  },
  prospector: {
    title: 'Prospección',
    subtitle: 'Captación automatizada de nuevos clientes',
  },
}

export default function AgentGrid({ selectedAgent, onSelectAgent }: AgentGridProps) {
  const groups = getAgentsByCategory()

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([category, agents]) => {
        const label = categoryLabels[category]
        return (
          <div key={category}>
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-neutral-900">{label?.title ?? category}</h2>
              <p className="text-sm text-neutral-500">{label?.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  selected={selectedAgent?.id === agent.id}
                  onClick={() => onSelectAgent(agent)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
