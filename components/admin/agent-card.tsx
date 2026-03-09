'use client'

import {
  ClipboardCheck,
  MapPin,
  Search,
  Star,
  PenTool,
  Code,
  HelpCircle,
  Layers,
  FileText,
  Eye,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import Badge from '@/components/ui/badge'
import type { AgentConfig } from '@/lib/agents/types'

// Mapa de iconos por nombre
const iconMap: Record<string, LucideIcon> = {
  ClipboardCheck,
  MapPin,
  Search,
  Star,
  PenTool,
  Code,
  HelpCircle,
  Layers,
  FileText,
  Eye,
  BarChart3,
}

// Colores por categoría
const categoryColors: Record<string, string> = {
  map_pack: 'bg-blue-500',
  geo_aeo: 'bg-purple-500',
  reporte: 'bg-amber-500',
}

interface AgentCardProps {
  agent: AgentConfig
  selected: boolean
  onClick: () => void
}

export default function AgentCard({ agent, selected, onClick }: AgentCardProps) {
  const Icon = iconMap[agent.icono] ?? FileText
  const dotColor = categoryColors[agent.categoria] ?? 'bg-neutral-400'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected
          ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${selected ? 'bg-accent/10 text-accent' : 'bg-neutral-100 text-neutral-600'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <h3 className="font-medium text-sm text-neutral-900 truncate">{agent.nombre}</h3>
          </div>
          <p className="text-xs text-neutral-500 line-clamp-2 mb-2">{agent.descripcion}</p>
          <div className="flex flex-wrap gap-1">
            {agent.packs.map((pack) => (
              <Badge
                key={pack}
                variant={pack === 'autoridad_maps_ia' ? 'accent' : 'info'}
                className="text-[10px] px-1.5 py-0"
              >
                {pack === 'visibilidad_local' ? 'Local' : 'Maps+IA'}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}
