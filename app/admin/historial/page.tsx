'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Brain,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Zap,
  ListChecks,
  ChevronDown,
  RefreshCw,
  Loader2,
  Bot,
  Filter,
  FileText,
} from 'lucide-react'
import type { AgentResult } from '@/lib/agents/types'
import AgentReport from '@/components/admin/agent-report'

interface MemoryEntry {
  id: string
  cliente_id: string
  agente: string
  fecha: string
  score_gbp_al_ejecutar: number | null
  rating_al_ejecutar: number | null
  resenas_al_ejecutar: number | null
  fotos_al_ejecutar: number | null
  resumen: string
  decisiones_clave: string[]
  tareas_generadas: number
  tareas_auto: number
  tareas_revision: number
  tareas_manual: number
  impacto_score_delta: number | null
  impacto_evaluado: boolean
  resultado_completo: Record<string, unknown> | null
  tokens_input: number
  tokens_output: number
  coste_usd: number
}

interface Cliente {
  id: string
  nombre: string
  negocio: string
}

const AGENT_LABELS: Record<string, { nombre: string; icono: string; color: string }> = {
  auditor_gbp: { nombre: 'Auditor GBP', icono: '🔍', color: 'bg-blue-100 text-blue-800' },
  optimizador_nap: { nombre: 'Optimizador NAP', icono: '📍', color: 'bg-purple-100 text-purple-800' },
  keywords_locales: { nombre: 'Keywords Locales', icono: '🔑', color: 'bg-amber-100 text-amber-800' },
  gestor_resenas: { nombre: 'Gestor Reseñas', icono: '⭐', color: 'bg-yellow-100 text-yellow-800' },
  redactor_posts_gbp: { nombre: 'Redactor Posts', icono: '✍️', color: 'bg-green-100 text-green-800' },
  generador_schema: { nombre: 'Schema JSON-LD', icono: '🏗️', color: 'bg-indigo-100 text-indigo-800' },
  creador_faq_geo: { nombre: 'FAQ GEO', icono: '❓', color: 'bg-cyan-100 text-cyan-800' },
  generador_chunks: { nombre: 'Chunks Contenido', icono: '📦', color: 'bg-teal-100 text-teal-800' },
  tldr_entidad: { nombre: 'TL;DR Entidad', icono: '📋', color: 'bg-rose-100 text-rose-800' },
  monitor_ias: { nombre: 'Monitor IAs', icono: '🤖', color: 'bg-violet-100 text-violet-800' },
  generador_reporte: { nombre: 'Reporte', icono: '📊', color: 'bg-orange-100 text-orange-800' },
  supervisor: { nombre: 'Supervisor', icono: '🎯', color: 'bg-red-100 text-red-800' },
}

export default function HistorialPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState('')
  const [agenteFilter, setAgenteFilter] = useState('')
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Cargar clientes
  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data ?? []
        setClientes(list)
        if (list.length > 0 && !clienteId) {
          setClienteId(list[0].id)
        }
      })
      .catch(console.error)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadHistory = useCallback(async () => {
    if (!clienteId) return
    setLoading(true)
    try {
      const url = agenteFilter
        ? `/api/agents/memory?clienteId=${clienteId}&agente=${agenteFilter}&limit=50`
        : `/api/agents/memory/all?clienteId=${clienteId}&limit=50`
      const res = await fetch(url)
      const data = await res.json()
      // The response is a MemoryContext with ejecuciones_previas, or an array
      setEntries(data.ejecuciones_previas ?? data ?? [])
    } catch (e) {
      console.error('Error loading history:', e)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [clienteId, agenteFilter])

  useEffect(() => {
    if (clienteId) loadHistory()
  }, [clienteId, agenteFilter, loadHistory])

  // Stats
  const totalEjecuciones = entries.length
  const costoTotal = entries.reduce((s, e) => s + (e.coste_usd ?? 0), 0)
  const tareasTotal = entries.reduce((s, e) => s + e.tareas_generadas, 0)
  const conImpacto = entries.filter(e => e.impacto_evaluado && e.impacto_score_delta !== null)
  const impactoPromedio = conImpacto.length > 0
    ? Math.round((conImpacto.reduce((s, e) => s + (e.impacto_score_delta ?? 0), 0) / conImpacto.length) * 10) / 10
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-accent" />
            Historial de Agentes
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Memoria completa: qué hicieron, qué recomendaron y qué impacto tuvieron
          </p>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-medium text-neutral-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        {/* Cliente */}
        <div className="relative">
          <select
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.negocio}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>

        {/* Agente */}
        <div className="relative">
          <select
            value={agenteFilter}
            onChange={e => setAgenteFilter(e.target.value)}
            className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            <option value="">Todos los agentes</option>
            {Object.entries(AGENT_LABELS).map(([key, { nombre, icono }]) => (
              <option key={key} value={key}>{icono} {nombre}</option>
            ))}
          </select>
          <Filter className="absolute right-2.5 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="w-5 h-5 text-accent" />}
          label="Ejecuciones"
          value={totalEjecuciones}
        />
        <StatCard
          icon={<ListChecks className="w-5 h-5 text-blue-500" />}
          label="Tareas generadas"
          value={tareasTotal}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-green-500" />}
          label="Coste total"
          value={`$${costoTotal.toFixed(4)}`}
        />
        <StatCard
          icon={impactoPromedio !== null && impactoPromedio >= 0
            ? <TrendingUp className="w-5 h-5 text-emerald-500" />
            : <TrendingDown className="w-5 h-5 text-red-500" />}
          label="Impacto promedio"
          value={impactoPromedio !== null ? `${impactoPromedio >= 0 ? '+' : ''}${impactoPromedio} pts` : 'Sin datos'}
        />
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <Bot className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">
            {clienteId ? 'No hay ejecuciones registradas para este cliente.' : 'Selecciona un cliente.'}
          </p>
          <p className="text-neutral-400 text-xs mt-1">
            Ejecuta un agente desde la sección &quot;Agentes&quot; para empezar a ver el historial.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => {
            const agentInfo = AGENT_LABELS[entry.agente] ?? { nombre: entry.agente, icono: '🤖', color: 'bg-neutral-100 text-neutral-800' }
            const isExpanded = expandedId === entry.id
            const fecha = new Date(entry.fecha)
            const fechaStr = fecha.toLocaleDateString('es-ES', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  {/* Agente badge */}
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${agentInfo.color}`}>
                    {agentInfo.icono} {agentInfo.nombre}
                  </span>

                  {/* Resumen */}
                  <span className="flex-1 text-sm text-neutral-700 truncate">
                    {entry.resumen}
                  </span>

                  {/* Métricas rápidas */}
                  <div className="hidden md:flex items-center gap-3 shrink-0">
                    {/* Score */}
                    {entry.score_gbp_al_ejecutar !== null && (
                      <span className="text-xs bg-neutral-100 px-2 py-1 rounded-lg text-neutral-600">
                        Score: {entry.score_gbp_al_ejecutar}
                      </span>
                    )}

                    {/* Impacto */}
                    {entry.impacto_evaluado && entry.impacto_score_delta !== null && (
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${
                        entry.impacto_score_delta > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : entry.impacto_score_delta < 0
                            ? 'bg-red-50 text-red-700'
                            : 'bg-neutral-50 text-neutral-500'
                      }`}>
                        {entry.impacto_score_delta > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : entry.impacto_score_delta < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {entry.impacto_score_delta > 0 ? '+' : ''}{entry.impacto_score_delta}
                      </span>
                    )}

                    {/* Tareas */}
                    <span className="text-xs text-neutral-400">
                      {entry.tareas_generadas} tareas
                    </span>

                    {/* Coste */}
                    <span className="text-xs text-neutral-400">
                      ${entry.coste_usd.toFixed(4)}
                    </span>
                  </div>

                  {/* Fecha */}
                  <div className="flex items-center gap-1 text-xs text-neutral-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    {fechaStr}
                  </div>

                  <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 p-5 space-y-4 bg-neutral-50/50">
                    {/* Grid de métricas del momento */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <MiniStat label="Score GBP" value={entry.score_gbp_al_ejecutar !== null ? `${entry.score_gbp_al_ejecutar}/100` : 'N/A'} />
                      <MiniStat label="Rating" value={entry.rating_al_ejecutar !== null ? `${entry.rating_al_ejecutar}/5` : 'N/A'} />
                      <MiniStat label="Reseñas" value={entry.resenas_al_ejecutar?.toString() ?? 'N/A'} />
                      <MiniStat label="Fotos" value={entry.fotos_al_ejecutar?.toString() ?? 'N/A'} />
                    </div>

                    {/* Impacto */}
                    {entry.impacto_evaluado && (
                      <div className={`rounded-xl p-3 ${
                        (entry.impacto_score_delta ?? 0) > 0
                          ? 'bg-emerald-50 border border-emerald-200'
                          : (entry.impacto_score_delta ?? 0) < 0
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-neutral-100 border border-neutral-200'
                      }`}>
                        <h4 className="text-xs font-semibold uppercase tracking-wider mb-1 text-neutral-500">
                          Impacto medido
                        </h4>
                        <p className="text-sm font-medium">
                          Score: {(entry.impacto_score_delta ?? 0) >= 0 ? '+' : ''}{entry.impacto_score_delta ?? 0} puntos
                        </p>
                      </div>
                    )}

                    {!entry.impacto_evaluado && (
                      <p className="text-xs text-neutral-400 italic">
                        ⏳ Impacto pendiente de evaluar — se calculará con el próximo snapshot
                      </p>
                    )}

                    {/* ═══ INFORME COMPLETO DEL AGENTE ═══ */}
                    {entry.resultado_completo ? (
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" />
                          Informe completo del agente
                        </h4>
                        <div className="bg-white rounded-xl border border-neutral-200 p-4">
                          <AgentReport
                            result={{
                              agente: entry.agente as AgentResult['agente'],
                              estado: 'completada',
                              datos: entry.resultado_completo,
                              resumen: entry.resumen,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-neutral-100 rounded-xl p-4 text-center">
                        <p className="text-xs text-neutral-400">
                          Informe completo no disponible para esta ejecución (anterior al sistema de memoria).
                        </p>
                      </div>
                    )}

                    {/* Meta: decisiones + tareas + tokens */}
                    <details className="group">
                      <summary className="text-xs font-medium text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors flex items-center gap-1">
                        <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                        Metadatos de ejecución
                      </summary>
                      <div className="mt-3 space-y-3">
                        {/* Decisiones clave */}
                        {entry.decisiones_clave.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                              Decisiones clave
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {entry.decisiones_clave.map((d, i) => (
                                <span key={i} className="bg-white border border-neutral-200 px-3 py-1.5 rounded-lg text-xs text-neutral-700">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Desglose tareas */}
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1.5 text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-400" />
                            {entry.tareas_auto} auto
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <span className="w-2 h-2 rounded-full bg-yellow-400" />
                            {entry.tareas_revision} revisión
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            {entry.tareas_manual} manual
                          </span>
                        </div>

                        {/* Tokens y coste */}
                        <div className="flex gap-6 text-xs text-neutral-500">
                          <span>Tokens entrada: {entry.tokens_input.toLocaleString()}</span>
                          <span>Tokens salida: {entry.tokens_output.toLocaleString()}</span>
                          <span>Coste: ${entry.coste_usd.toFixed(6)}</span>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-neutral-800">{value}</p>
    </div>
  )
}
