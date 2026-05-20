'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { getAgentsByCategory } from '@/lib/agents/config'
import type { AgentConfig } from '@/lib/agents/types'
import type { Cliente } from '@/types'
import AgentCardV2 from './agent-card-v2'
import AgentDetail from './agent-detail'

interface AgentStats {
  total_llamadas: number
  coste_total: number
  ultima_ejecucion?: string | null
}

interface AgentesPanelProps {
  clients: Cliente[]
  statsByAgent?: Record<string, AgentStats>
}

const categoryOrder: Array<keyof ReturnType<typeof getAgentsByCategory>> = [
  'supervisor',
  'map_pack',
  'geo_aeo',
  'reporte',
  'prospector',
]

const categoryTitles: Record<string, { title: string; subtitle: string }> = {
  supervisor: {
    title: 'Supervisor',
    subtitle: 'Orquestador automático del pipeline completo',
  },
  map_pack: {
    title: 'Map Pack',
    subtitle: 'Posicionamiento en Google Maps + 3 resultados locales',
  },
  geo_aeo: {
    title: 'GEO / AEO',
    subtitle: 'Visibilidad en LLMs (ChatGPT, Gemini, Perplexity) y búsqueda por voz',
  },
  reporte: {
    title: 'Reporte',
    subtitle: 'Informes consolidados mensuales para el cliente',
  },
  prospector: {
    title: 'Prospección',
    subtitle: 'Captación automatizada de nuevos clientes',
  },
}

export default function AgentesPanel({ clients, statsByAgent = {} }: AgentesPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null)
  const categorized = getAgentsByCategory()

  return (
    <>
      <div className="h-full overflow-y-auto pr-2">
        <div className="space-y-10 pb-8">
          {categoryOrder.map((cat) => {
            const agents = categorized[cat]
            if (!agents || agents.length === 0) return null
            const meta = categoryTitles[cat]

            return (
              <section key={cat}>
                {/* Header de sección */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900">{meta.title}</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">{meta.subtitle}</p>
                </div>

                {/* Grid responsivo: 1 col móvil, 2 tablet, 3 desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <AgentCardV2
                      key={agent.id}
                      agent={agent}
                      stats={statsByAgent[agent.id]}
                      selected={selectedAgent?.id === agent.id}
                      onClick={() => setSelectedAgent(agent)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {/* Modal de detalle al seleccionar agente */}
      {selectedAgent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedAgent(null)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAgent(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-neutral-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
            <div className="overflow-y-auto flex-1">
              <AgentDetail agent={selectedAgent} clients={clients} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
