'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign,
  TrendingUp,
  Zap,
  Users,
  Bot,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// ════════════════════════════════════════════════════════════
// Tipos
// ════════════════════════════════════════════════════════════

interface ResumenDiario {
  fecha: string
  total_llamadas: number
  total_input_tokens: number
  total_output_tokens: number
  coste_total_dia: number
  clientes_unicos: number
  agentes_usados: number
}

interface ResumenAgente {
  agente: string
  total_llamadas: number
  total_input_tokens: number
  total_output_tokens: number
  avg_input_tokens: number
  avg_output_tokens: number
  coste_total: number
  coste_promedio: number
}

interface DetalleRegistro {
  id: string
  fecha: string
  cliente_nombre: string | null
  agente: string
  modelo: string
  input_tokens: number
  output_tokens: number
  coste_total: number
  tipo: string
  created_at: string
}

interface GastoMes {
  total: number
  llamadas: number
}

// ════════════════════════════════════════════════════════════
// Nombres legibles de agentes
// ════════════════════════════════════════════════════════════

const AGENT_NAMES: Record<string, string> = {
  auditor_gbp: 'Auditor GBP',
  optimizador_nap: 'Optimizador NAP',
  keywords_locales: 'Keywords Locales',
  gestor_resenas: 'Gestor Reseñas',
  redactor_posts_gbp: 'Redactor Posts',
  generador_schema: 'Generador Schema',
  creador_faq_geo: 'Creador FAQ GEO',
  generador_chunks: 'Generador Chunks',
  tldr_entidad: 'TL;DR Entidad',
  monitor_ias: 'Monitor IAs',
  generador_reporte: 'Generador Reporte',
}

// ════════════════════════════════════════════════════════════
// Página principal
// ════════════════════════════════════════════════════════════

export default function GastosPage() {
  const [diario, setDiario] = useState<ResumenDiario[]>([])
  const [porAgente, setPorAgente] = useState<ResumenAgente[]>([])
  const [gastoMes, setGastoMes] = useState<GastoMes>({ total: 0, llamadas: 0 })
  const [detalle, setDetalle] = useState<DetalleRegistro[]>([])
  const [fechaDetalle, setFechaDetalle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'diario' | 'agentes'>('diario')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Una sola petición para todo el dashboard (antes eran 3)
      const res = await fetch('/api/gastos')
      const json = await res.json()
      setDiario(json.diario ?? [])
      setPorAgente(json.agente ?? [])
      setGastoMes(json.mes ?? { total: 0, llamadas: 0 })
    } catch (e) {
      console.error('Error cargando gastos:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const fetchDetalle = async (fecha: string) => {
    if (fechaDetalle === fecha) {
      setFechaDetalle(null)
      setDetalle([])
      return
    }
    setFechaDetalle(fecha)
    try {
      const res = await fetch(`/api/gastos?tipo=detalle&fecha=${fecha}`)
      const json = await res.json()
      setDetalle(json.data ?? [])
    } catch {
      setDetalle([])
    }
  }

  // Totales generales
  const totalGastado = diario.reduce((s, d) => s + Number(d.coste_total_dia), 0)
  const totalLlamadas = diario.reduce((s, d) => s + d.total_llamadas, 0)
  const totalTokensIn = diario.reduce((s, d) => s + d.total_input_tokens, 0)
  const totalTokensOut = diario.reduce((s, d) => s + d.total_output_tokens, 0)

  // Variación vs día anterior
  const hoy = diario[0]
  const ayer = diario[1]
  const variacion = hoy && ayer
    ? ((Number(hoy.coste_total_dia) - Number(ayer.coste_total_dia)) / Number(ayer.coste_total_dia)) * 100
    : 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Control de Gastos API</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Consumo de tokens y costes de los agentes de IA
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={DollarSign}
          label="Gasto Mes Actual"
          value={`$${Number(gastoMes.total).toFixed(4)}`}
          sub={`${gastoMes.llamadas} llamadas`}
          color="emerald"
        />
        <MetricCard
          icon={TrendingUp}
          label="Gasto Total (30d)"
          value={`$${totalGastado.toFixed(4)}`}
          sub={
            variacion !== 0
              ? `${variacion > 0 ? '+' : ''}${variacion.toFixed(1)}% vs ayer`
              : 'Sin variación'
          }
          trend={variacion}
          color="blue"
        />
        <MetricCard
          icon={Zap}
          label="Total Llamadas"
          value={totalLlamadas.toLocaleString()}
          sub={`${(totalTokensIn / 1000).toFixed(0)}K in / ${(totalTokensOut / 1000).toFixed(0)}K out`}
          color="amber"
        />
        <MetricCard
          icon={Users}
          label="Coste Promedio"
          value={totalLlamadas > 0 ? `$${(totalGastado / totalLlamadas).toFixed(4)}` : '$0'}
          sub="por llamada"
          color="violet"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('diario')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'diario' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-1.5" />
          Por día
        </button>
        <button
          onClick={() => setTab('agentes')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'agentes' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Bot className="w-4 h-4 inline mr-1.5" />
          Por agente
        </button>
      </div>

      {/* Contenido tabs */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : tab === 'diario' ? (
        <TablaDiaria diario={diario} detalle={detalle} fechaDetalle={fechaDetalle} onClickFecha={fetchDetalle} />
      ) : (
        <TablaAgentes agentes={porAgente} />
      )}

      {/* Info sobre Claude Code */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Nota:</strong> Estos gastos corresponden solo a las llamadas de los agentes (Claude Sonnet).
        Para ver el consumo de Claude Code (Opus), consulta tu{' '}
        <span className="font-semibold">dashboard de Anthropic</span> en console.anthropic.com → Usage.
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// Componentes auxiliares
// ════════════════════════════════════════════════════════════

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  trend?: number
  color: string
}) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-neutral-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {trend !== undefined && trend !== 0 && (
          trend > 0 ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
          )
        )}
        <span className="text-xs text-neutral-500">{sub}</span>
      </div>
    </div>
  )
}

function TablaDiaria({
  diario,
  detalle,
  fechaDetalle,
  onClickFecha,
}: {
  diario: ResumenDiario[]
  detalle: DetalleRegistro[]
  fechaDetalle: string | null
  onClickFecha: (fecha: string) => void
}) {
  if (diario.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <DollarSign className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-500 font-medium">Sin datos de consumo todavía</p>
        <p className="text-sm text-neutral-400 mt-1">
          Los gastos se registrarán automáticamente cuando ejecutes agentes
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th className="text-left px-4 py-3 text-neutral-500 font-medium">Fecha</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Llamadas</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Tokens IN</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Tokens OUT</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Clientes</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Agentes</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Coste</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {diario.map((d) => {
            const isOpen = fechaDetalle === d.fecha
            return (
              <Fragment key={d.fecha}>
                <tr
                  onClick={() => onClickFecha(d.fecha)}
                  className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {formatFecha(d.fecha)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-700">{d.total_llamadas}</td>
                  <td className="px-4 py-3 text-right text-neutral-500">
                    {(d.total_input_tokens / 1000).toFixed(1)}K
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-500">
                    {(d.total_output_tokens / 1000).toFixed(1)}K
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-500">{d.clientes_unicos}</td>
                  <td className="px-4 py-3 text-right text-neutral-500">{d.agentes_usados}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                    ${Number(d.coste_total_dia).toFixed(4)}
                  </td>
                  <td className="px-2">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={8} className="bg-neutral-50 px-6 py-3">
                      <DetalleTable registros={detalle} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function DetalleTable({ registros }: { registros: DetalleRegistro[] }) {
  if (registros.length === 0) {
    return <p className="text-sm text-neutral-400 py-2">Cargando detalle...</p>
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-neutral-500">
          <th className="text-left py-1.5 pr-3">Hora</th>
          <th className="text-left py-1.5 pr-3">Agente</th>
          <th className="text-left py-1.5 pr-3">Cliente</th>
          <th className="text-right py-1.5 pr-3">IN</th>
          <th className="text-right py-1.5 pr-3">OUT</th>
          <th className="text-right py-1.5">Coste</th>
        </tr>
      </thead>
      <tbody>
        {registros.map((r) => (
          <tr key={r.id} className="border-t border-neutral-200">
            <td className="py-1.5 pr-3 text-neutral-500">
              {new Date(r.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </td>
            <td className="py-1.5 pr-3 font-medium text-neutral-700">
              {AGENT_NAMES[r.agente] ?? r.agente}
            </td>
            <td className="py-1.5 pr-3 text-neutral-500">{r.cliente_nombre ?? '—'}</td>
            <td className="py-1.5 pr-3 text-right text-neutral-500">{r.input_tokens.toLocaleString()}</td>
            <td className="py-1.5 pr-3 text-right text-neutral-500">{r.output_tokens.toLocaleString()}</td>
            <td className="py-1.5 text-right font-medium text-emerald-700">
              ${Number(r.coste_total).toFixed(4)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function TablaAgentes({ agentes }: { agentes: ResumenAgente[] }) {
  if (agentes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <Bot className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-500 font-medium">Sin datos por agente todavía</p>
      </div>
    )
  }

  const maxCoste = Math.max(...agentes.map((a) => Number(a.coste_total)))

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th className="text-left px-4 py-3 text-neutral-500 font-medium">Agente</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Llamadas</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Avg IN</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Avg OUT</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Coste/llamada</th>
            <th className="text-right px-4 py-3 text-neutral-500 font-medium">Coste Total</th>
            <th className="px-4 py-3 w-40" />
          </tr>
        </thead>
        <tbody>
          {agentes.map((a) => {
            const pct = maxCoste > 0 ? (Number(a.coste_total) / maxCoste) * 100 : 0
            return (
              <tr key={a.agente} className="border-b border-neutral-100">
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {AGENT_NAMES[a.agente] ?? a.agente}
                </td>
                <td className="px-4 py-3 text-right text-neutral-700">{a.total_llamadas}</td>
                <td className="px-4 py-3 text-right text-neutral-500">
                  {Number(a.avg_input_tokens).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-neutral-500">
                  {Number(a.avg_output_tokens).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-neutral-500">
                  ${Number(a.coste_promedio).toFixed(4)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                  ${Number(a.coste_total).toFixed(4)}
                </td>
                <td className="px-4 py-3">
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════

function formatFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

// Necesitamos Fragment para la tabla expandible
import { Fragment } from 'react'
