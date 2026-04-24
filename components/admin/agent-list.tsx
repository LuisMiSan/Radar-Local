'use client'

import {
  ClipboardCheck, MapPin, Search, Star, PenTool, Code,
  HelpCircle, Layers, FileText, Eye, BarChart3, Globe, type LucideIcon,
} from 'lucide-react'
import type { AgentConfig } from '@/lib/agents/types'
import { getAgentsByCategory } from '@/lib/agents/config'

const iconMap: Record<string, LucideIcon> = {
  ClipboardCheck, MapPin, Search, Star, PenTool, Code,
  HelpCircle, Layers, FileText, Eye, BarChart3, Globe,
}

const categoryConfig: Record<string, { label: string; accent: string; dot: string }> = {
  map_pack:  { label: 'Map Pack',    accent: 'text-blue-600',   dot: 'bg-blue-500'   },
  geo_aeo:   { label: 'GEO / AEO',   accent: 'text-purple-600', dot: 'bg-purple-500' },
  reporte:   { label: 'Reporte',     accent: 'text-amber-600',  dot: 'bg-amber-500'  },
  prospector:{ label: 'Prospección', accent: 'text-teal-600',   dot: 'bg-teal-500'   },
}

interface AgentListProps {
  selectedId: string | null
  onSelect: (agent: AgentConfig) => void
}

export default function AgentList({ selectedId, onSelect }: AgentListProps) {
  const groups = getAgentsByCategory()

  return (
    <nav className="h-full overflow-y-auto py-2">
      {Object.entries(groups).map(([cat, agents]) => {
        const cfg = categoryConfig[cat]
        return (
          <div key={cat} className="mb-1">
            {/* Cabecera de categoría */}
            <div className="px-4 py-2 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot ?? 'bg-neutral-400'}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-widest ${cfg?.accent ?? 'text-neutral-500'}`}>
                {cfg?.label ?? cat}
              </span>
            </div>

            {/* Agentes */}
            {agents.map((agent) => {
              const Icon = iconMap[agent.icono] ?? FileText
              const isSelected = selectedId === agent.id
              return (
                <button
                  key={agent.id}
                  onClick={() => onSelect(agent)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <div className={`p-1.5 rounded-md shrink-0 ${
                    isSelected ? 'bg-white/10' : 'bg-neutral-100'
                  }`}>
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                  </div>
                  <span className={`text-sm font-medium truncate ${isSelected ? 'text-white' : ''}`}>
                    {agent.nombre}
                  </span>
                </button>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}
