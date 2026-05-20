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
  Globe,
  Brain,
  Activity,
  DollarSign,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import type { AgentConfig } from '@/lib/agents/types'

// ════════════════════════════════════════════════════════════
// Agent Card v2 — marketplace style
// Hero gradient + icon arriba · badge categoría · stats abajo
// ════════════════════════════════════════════════════════════

const iconMap: Record<string, LucideIcon> = {
  ClipboardCheck, MapPin, Search, Star, PenTool, Code,
  HelpCircle, Layers, FileText, Eye, BarChart3, Globe, Brain,
}

interface CategoryStyle {
  label: string
  badgeBg: string
  badgeText: string
  gradient: string
}

const categoryStyles: Record<string, CategoryStyle> = {
  map_pack: {
    label: 'Map Pack',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
  },
  geo_aeo: {
    label: 'GEO / AEO',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    gradient: 'from-purple-400 via-purple-500 to-fuchsia-600',
  },
  reporte: {
    label: 'Reporte',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    gradient: 'from-amber-400 via-orange-500 to-orange-600',
  },
  prospector: {
    label: 'Prospección',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
  },
  supervisor: {
    label: 'Supervisor',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
  },
}

function formatAgo(iso: string | null | undefined): string {
  if (!iso) return 'Nunca'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Hace ${days}d`
  const months = Math.floor(days / 30)
  return `Hace ${months}mes`
}

function formatCost(coste: number): string {
  if (coste === 0) return '$0'
  if (coste < 0.01) return '<$0.01'
  return `$${coste.toFixed(2)}`
}

interface AgentCardV2Props {
  agent: AgentConfig
  stats?: {
    total_llamadas: number
    coste_total: number
    ultima_ejecucion?: string | null
  } | null
  selected?: boolean
  onClick: () => void
}

export default function AgentCardV2({ agent, stats, selected, onClick }: AgentCardV2Props) {
  const Icon = iconMap[agent.icono] ?? FileText
  const style = categoryStyles[agent.categoria] ?? categoryStyles.map_pack

  const llamadas = stats?.total_llamadas ?? 0
  const coste = stats?.coste_total ?? 0
  const ultima = formatAgo(stats?.ultima_ejecucion)

  return (
    <button
      onClick={onClick}
      className={`group relative text-left bg-white rounded-2xl overflow-hidden border transition-all ${
        selected
          ? 'border-neutral-900 shadow-lg ring-2 ring-neutral-900/10'
          : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'
      }`}
    >
      {/* Hero con gradiente + icono grande */}
      <div className={`relative h-36 bg-gradient-to-br ${style.gradient} overflow-hidden`}>
        {/* Patrón decorativo sutil */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
        </div>
        {/* Icono grande centrado */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-16 h-16 text-white/90 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-4 space-y-3">
        {/* Badge categoría */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.badgeBg} ${style.badgeText}`}>
            {style.label}
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            {agent.packs.length} {agent.packs.length === 1 ? 'pack' : 'packs'}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-bold text-base text-neutral-900 leading-tight">
          {agent.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">
          {agent.descripcion}
        </p>

        {/* Tags packs */}
        <div className="flex flex-wrap gap-1.5">
          {agent.packs.map((pack) => (
            <span
              key={pack}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 text-neutral-600"
            >
              {pack === 'visibilidad_local' ? 'Visibilidad Local' : 'Maps + IA'}
            </span>
          ))}
        </div>

        {/* Stats row inferior */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1" title="Ejecuciones totales">
              <Activity className="w-3.5 h-3.5" />
              {llamadas}
            </span>
            <span className="flex items-center gap-1" title="Coste total acumulado">
              <DollarSign className="w-3.5 h-3.5" />
              {formatCost(coste)}
            </span>
            <span className="flex items-center gap-1" title="Última ejecución">
              <Clock className="w-3.5 h-3.5" />
              {ultima}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
