'use client'

// ─────────────────────────────────────────────────────────
// Panel de Tareas de Ejecución
// ─────────────────────────────────────────────────────────
// Muestra las tareas que generan los agentes, permite aprobar/rechazar,
// y visualiza el progreso de cada cliente.

import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Bot,
  Shield,
  Hand,
  Zap,
  Loader2,
  Brain,
} from 'lucide-react'
import type {
  TareaEjecucion,
  Cliente,
  Agente,
  EstadoEjecucion,
  TipoEjecucion,
  PrioridadTarea,
} from '@/types'
import {
  PRIORIDAD_COLORS,
  PRIORIDAD_LABELS,
  ESTADO_EJECUCION_LABELS,
  ESTADO_EJECUCION_COLORS,
  TIPO_EJECUCION_LABELS,
  AGENTE_LABELS,
} from '@/types'

// ── Tipos ──────────────────────────────────────────────────

interface TareasPanelProps {
  clients: Cliente[]
}

interface Resumen {
  total: number
  completadas: number
  pendientes: number
  esperando_aprobacion: number
  en_ejecucion: number
  fallidas: number
  porcentaje: number
}

// ── Iconos por tipo ────────────────────────────────────────

const TIPO_ICONS: Record<TipoEjecucion, typeof Bot> = {
  auto: Zap,
  revision: Shield,
  manual: Hand,
}

const TIPO_COLORS: Record<TipoEjecucion, string> = {
  auto: 'text-green-600 bg-green-50',
  revision: 'text-amber-600 bg-amber-50',
  manual: 'text-purple-600 bg-purple-50',
}

// ── Componente principal ───────────────────────────────────

export default function TareasPanel({ clients }: TareasPanelProps) {
  const [selectedClient, setSelectedClient] = useState('')
  const [tareas, setTareas] = useState<TareaEjecucion[]>([])
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<EstadoEjecucion | ''>('')
  const [filtroTipo, setFiltroTipo] = useState<TipoEjecucion | ''>('')
  const [filtroAgente, setFiltroAgente] = useState<Agente | ''>('')

  // Clientes activos (solo los que tienen pack)
  const activeClients = clients.filter((c) => c.estado === 'activo' && c.pack)

  // Tareas listas para ejecutar (aprobadas + auto pendientes)
  const tareasEjecutables = tareas.filter(
    (t) => t.estado === 'aprobada' || (t.estado === 'pendiente' && t.tipo === 'auto')
  ).length

  // ── Cargar tareas ─────────────────────────────────────────

  const loadTareas = useCallback(async () => {
    if (!selectedClient) return
    setLoading(true)

    try {
      const params = new URLSearchParams({ cliente_id: selectedClient })
      if (filtroEstado) params.set('estado', filtroEstado)
      if (filtroTipo) params.set('tipo', filtroTipo)
      if (filtroAgente) params.set('agente', filtroAgente)

      const [tareasRes, resumenRes] = await Promise.all([
        fetch(`/api/tareas?${params}`),
        fetch(`/api/tareas?cliente_id=${selectedClient}&resumen=true`),
      ])

      const tareasData = await tareasRes.json()
      const resumenData = await resumenRes.json()

      setTareas(tareasData.tareas ?? [])
      setResumen(resumenData)
    } catch (err) {
      console.error('Error cargando tareas:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedClient, filtroEstado, filtroTipo, filtroAgente])

  useEffect(() => {
    loadTareas()
  }, [loadTareas])

  // ── Acciones HITL ─────────────────────────────────────────

  async function handleAction(tareaId: string, accion: 'aprobar' | 'rechazar') {
    setActionLoading(tareaId)
    try {
      const res = await fetch('/api/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarea_id: tareaId, accion }),
      })

      if (res.ok) {
        await loadTareas()
      }
    } catch (err) {
      console.error(`Error al ${accion}:`, err)
    } finally {
      setActionLoading(null)
    }
  }

  // ── Ejecutar tarea ─────────────────────────────────────────

  const [ejecutandoId, setEjecutandoId] = useState<string | null>(null)
  const [ejecutandoTodas, setEjecutandoTodas] = useState(false)

  // Supervisor state
  const [supervisorRunning, setSupervisorRunning] = useState(false)
  const [supervisorResult, setSupervisorResult] = useState<{
    estado: string
    completados: number
    errores: number
    total: number
    coste_total: number
    tareas_generadas: number
    resumen: string
  } | null>(null)

  async function handleEjecutar(tareaId: string) {
    setEjecutandoId(tareaId)
    try {
      const res = await fetch('/api/tareas/ejecutar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarea_id: tareaId }),
      })

      if (res.ok) {
        await loadTareas()
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      console.error('Error ejecutando tarea:', err)
    } finally {
      setEjecutandoId(null)
    }
  }

  async function handleEjecutarTodas() {
    if (!selectedClient) return
    setEjecutandoTodas(true)
    try {
      const res = await fetch('/api/tareas/ejecutar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: selectedClient }),
      })

      const data = await res.json()
      if (res.ok) {
        alert(`${data.completadas}/${data.ejecutadas} tareas completadas. Coste: $${data.coste_total.toFixed(4)}`)
        await loadTareas()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      console.error('Error ejecutando todas:', err)
    } finally {
      setEjecutandoTodas(false)
    }
  }

  // ── Supervisor: análisis completo ─────────────────────────

  async function handleSupervisor() {
    if (!selectedClient) return
    setSupervisorRunning(true)
    setSupervisorResult(null)
    try {
      const res = await fetch('/api/agents/supervisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: selectedClient }),
      })

      const data = await res.json()
      if (res.ok) {
        setSupervisorResult({
          estado: data.estado,
          completados: data.completados,
          errores: data.errores,
          total: data.total,
          coste_total: data.coste_total,
          tareas_generadas: data.tareas_generadas,
          resumen: data.resumen,
        })
        await loadTareas()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      console.error('Error ejecutando supervisor:', err)
      alert('Error al ejecutar el análisis completo')
    } finally {
      setSupervisorRunning(false)
    }
  }

  // ── Barra de progreso ────────────────────────────────────

  function ProgressBar({ resumen }: { resumen: Resumen }) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-neutral-900">Progreso general</h3>
          <span className="text-2xl font-bold text-primary">{resumen.porcentaje}%</span>
        </div>

        {/* Barra visual */}
        <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
            style={{ width: `${resumen.porcentaje}%` }}
          />
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat label="Total" value={resumen.total} color="text-neutral-900" />
          <Stat label="Completadas" value={resumen.completadas} color="text-green-600" />
          <Stat label="Pendientes" value={resumen.pendientes} color="text-amber-600" />
          <Stat label="Esperan OK" value={resumen.esperando_aprobacion} color="text-blue-600" />
          <Stat label="Ejecutando" value={resumen.en_ejecucion} color="text-cyan-600" />
          <Stat label="Fallidas" value={resumen.fallidas} color="text-red-600" />
        </div>
      </div>
    )
  }

  function Stat({ label, value, color }: { label: string; value: number; color: string }) {
    return (
      <div className="text-center p-2 bg-neutral-50 rounded-lg">
        <div className={`text-lg font-bold ${color}`}>{value}</div>
        <div className="text-xs text-neutral-500">{label}</div>
      </div>
    )
  }

  // ── Tarjeta de tarea ──────────────────────────────────────

  function TareaCard({ tarea }: { tarea: TareaEjecucion }) {
    const isExpanded = expandedTask === tarea.id
    const TipoIcon = TIPO_ICONS[tarea.tipo]
    const prioColors = PRIORIDAD_COLORS[tarea.prioridad]
    const estadoColors = ESTADO_EJECUCION_COLORS[tarea.estado]
    const needsApproval = tarea.tipo === 'revision' && tarea.estado === 'pendiente'
    const canExecute = tarea.estado === 'aprobada' || (tarea.estado === 'pendiente' && tarea.tipo === 'auto')
    const isExecuting = ejecutandoId === tarea.id || tarea.estado === 'ejecutando'
    const isLoadingAction = actionLoading === tarea.id

    return (
      <div
        className={`bg-white rounded-xl border transition-all ${
          needsApproval
            ? 'border-amber-300 shadow-sm shadow-amber-100'
            : 'border-neutral-200'
        }`}
      >
        {/* Header */}
        <div
          className="flex items-start gap-3 p-4 cursor-pointer"
          onClick={() => setExpandedTask(isExpanded ? null : tarea.id)}
        >
          {/* Icono tipo */}
          <div className={`p-2 rounded-lg shrink-0 ${TIPO_COLORS[tarea.tipo]}`}>
            <TipoIcon className="w-4 h-4" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-neutral-900 text-sm">{tarea.titulo}</h4>
              {needsApproval && (
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium animate-pulse">
                  NECESITA TU OK
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {/* Prioridad */}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${prioColors.bg} ${prioColors.text}`}>
                {PRIORIDAD_LABELS[tarea.prioridad]}
              </span>

              {/* Tipo */}
              <span className="text-[10px] text-neutral-400">
                {TIPO_EJECUCION_LABELS[tarea.tipo]}
              </span>

              {/* Estado */}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${estadoColors.bg} ${estadoColors.text}`}>
                {ESTADO_EJECUCION_LABELS[tarea.estado]}
              </span>

              {/* Agente */}
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                {AGENTE_LABELS[tarea.agente]}
              </span>
            </div>
          </div>

          {/* Botones rápidos */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Aprobar/Rechazar */}
            {needsApproval && !isLoadingAction && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(tarea.id, 'aprobar')
                  }}
                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                  title="Aprobar"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(tarea.id, 'rechazar')
                  }}
                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Rechazar"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Ejecutar */}
            {canExecute && !isExecuting && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEjecutar(tarea.id)
                }}
                className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-colors"
                title="Ejecutar ahora"
              >
                <Play className="w-4 h-4" />
              </button>
            )}

            {/* Loading states */}
            {(isLoadingAction || isExecuting) && (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            )}
          </div>

          {/* Chevron */}
          <div className="shrink-0 text-neutral-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* Detalle expandido */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-neutral-100 pt-3 space-y-3">
            <p className="text-sm text-neutral-600">{tarea.descripcion}</p>

            {tarea.campo_gbp && (
              <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
                <div className="text-xs font-medium text-neutral-500">Campo GBP: {tarea.campo_gbp}</div>
                {tarea.valor_actual && (
                  <div className="text-xs">
                    <span className="text-red-500 font-medium">Actual: </span>
                    <span className="text-neutral-600">{tarea.valor_actual}</span>
                  </div>
                )}
                {tarea.valor_propuesto && (
                  <div className="text-xs">
                    <span className="text-green-600 font-medium">Propuesto: </span>
                    <span className="text-neutral-700">{tarea.valor_propuesto}</span>
                  </div>
                )}
              </div>
            )}

            {tarea.resultado && (
              <div className="text-xs bg-green-50 p-3 rounded-lg text-green-700">
                <strong>Resultado:</strong> {tarea.resultado}
              </div>
            )}

            {tarea.error && (
              <div className="text-xs bg-red-50 p-3 rounded-lg text-red-700">
                <strong>Error:</strong> {tarea.error}
              </div>
            )}

            {/* Botones de acción expandidos */}
            {needsApproval && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleAction(tarea.id, 'aprobar')}
                  disabled={isLoadingAction}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobar esta tarea
                </button>
                <button
                  onClick={() => handleAction(tarea.id, 'rechazar')}
                  disabled={isLoadingAction}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </button>
              </div>
            )}

            {canExecute && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleEjecutar(tarea.id)}
                  disabled={isExecuting}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Ejecutando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Ejecutar esta tarea
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Info de tiempos */}
            <div className="text-[10px] text-neutral-400 flex gap-4 pt-1">
              <span>Creada: {new Date(tarea.created_at).toLocaleString('es-ES')}</span>
              {tarea.aprobado_en && (
                <span>Aprobada: {new Date(tarea.aprobado_en).toLocaleString('es-ES')}</span>
              )}
              {tarea.ejecutado_en && (
                <span>Ejecutada: {new Date(tarea.ejecutado_en).toLocaleString('es-ES')}</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Render principal ──────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Selector de cliente */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Cliente
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="">Seleccionar cliente...</option>
              {activeClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.negocio} — {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {selectedClient && (
            <button
              onClick={loadTareas}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors mt-5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          )}
        </div>
      </div>

      {/* Botón Supervisor — Análisis completo */}
      {selectedClient && !loading && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200 p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-100 rounded-xl">
                <Brain className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm">Supervisor — Análisis Completo</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Ejecuta los 11 agentes en secuencia. Genera diagnóstico + tareas para todo el perfil.
                </p>
              </div>
            </div>
            <button
              onClick={handleSupervisor}
              disabled={supervisorRunning}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
            >
              {supervisorRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ejecutando análisis...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Lanzar análisis completo
                </>
              )}
            </button>
          </div>

          {/* Resultado del supervisor */}
          {supervisorResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              supervisorResult.estado === 'completada'
                ? 'bg-green-50 border border-green-200'
                : supervisorResult.estado === 'parcial'
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className={`w-4 h-4 ${
                  supervisorResult.estado === 'completada' ? 'text-green-600' : 'text-amber-600'
                }`} />
                <span className="font-medium text-sm">
                  {supervisorResult.estado === 'completada' ? 'Análisis completado' : 'Análisis parcial'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500">Agentes:</span>{' '}
                  <span className="font-medium">{supervisorResult.completados}/{supervisorResult.total}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Tareas generadas:</span>{' '}
                  <span className="font-medium">{supervisorResult.tareas_generadas}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Errores:</span>{' '}
                  <span className="font-medium">{supervisorResult.errores}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Coste total:</span>{' '}
                  <span className="font-medium">${supervisorResult.coste_total.toFixed(4)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Indicador de progreso mientras ejecuta */}
          {supervisorRunning && (
            <div className="mt-4 p-4 bg-white/60 rounded-lg border border-violet-100">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Ejecutando los 11 agentes en secuencia...
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Esto puede tardar 1-3 minutos. No cierres la página.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sin cliente seleccionado */}
      {!selectedClient && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Bot className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">
            Selecciona un cliente para ver sus tareas de ejecución
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Cargando tareas...</p>
        </div>
      )}

      {/* Contenido */}
      {selectedClient && !loading && (
        <>
          {/* Barra de progreso */}
          {resumen && resumen.total > 0 && (
            <div className="space-y-3">
              <ProgressBar resumen={resumen} />

              {/* Botón ejecutar todas */}
              {(tareasEjecutables > 0) && (
                <div className="bg-gradient-to-r from-cyan-50 to-primary/5 rounded-xl border border-cyan-200 p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-900 text-sm">
                      {tareasEjecutables} tarea{tareasEjecutables !== 1 ? 's' : ''} lista{tareasEjecutables !== 1 ? 's' : ''} para ejecutar
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Tareas aprobadas + automáticas pendientes
                    </p>
                  </div>
                  <button
                    onClick={handleEjecutarTodas}
                    disabled={ejecutandoTodas}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {ejecutandoTodas ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Ejecutando...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Ejecutar todas
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-medium text-neutral-700">Filtros</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as EstadoEjecucion | '')}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">⏳ Pendiente</option>
                <option value="aprobada">✅ Aprobada</option>
                <option value="ejecutando">⚡ Ejecutando</option>
                <option value="completada">✅ Completada</option>
                <option value="fallo">❌ Fallo</option>
                <option value="rechazada">🚫 Rechazada</option>
              </select>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as TipoEjecucion | '')}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs"
              >
                <option value="">Todos los tipos</option>
                <option value="auto">⚡ Automático</option>
                <option value="revision">👁️ Requiere aprobación</option>
                <option value="manual">🖐️ Manual</option>
              </select>

              <select
                value={filtroAgente}
                onChange={(e) => setFiltroAgente(e.target.value as Agente | '')}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs"
              >
                <option value="">Todos los agentes</option>
                <option value="auditor_gbp">Auditor GBP</option>
                <option value="optimizador_nap">Optimizador NAP</option>
                <option value="keywords_locales">Keywords Locales</option>
                <option value="gestor_resenas">Gestor Reseñas</option>
                <option value="redactor_posts_gbp">Redactor Posts</option>
                <option value="generador_schema">Generador Schema</option>
                <option value="creador_faq_geo">Creador FAQ GEO</option>
                <option value="generador_chunks">Generador Chunks</option>
                <option value="tldr_entidad">TL;DR Entidad</option>
                <option value="monitor_ias">Monitor IAs</option>
                <option value="generador_reporte">Generador Reporte</option>
              </select>

              {(filtroEstado || filtroTipo || filtroAgente) && (
                <button
                  onClick={() => {
                    setFiltroEstado('')
                    setFiltroTipo('')
                    setFiltroAgente('')
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Lista de tareas */}
          {tareas.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">
                No hay tareas{filtroEstado || filtroTipo || filtroAgente ? ' con estos filtros' : ''}. Ejecuta un agente primero.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header conteo */}
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-neutral-500">
                  {tareas.length} tarea{tareas.length !== 1 ? 's' : ''}
                </span>
                {tareas.filter((t) => t.tipo === 'revision' && t.estado === 'pendiente').length > 0 && (
                  <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {tareas.filter((t) => t.tipo === 'revision' && t.estado === 'pendiente').length} esperan tu aprobación
                  </span>
                )}
              </div>

              {/* Tareas que necesitan aprobación primero */}
              {tareas
                .sort((a, b) => {
                  // Primero las que necesitan aprobación
                  const aNeedsApproval = a.tipo === 'revision' && a.estado === 'pendiente' ? 0 : 1
                  const bNeedsApproval = b.tipo === 'revision' && b.estado === 'pendiente' ? 0 : 1
                  if (aNeedsApproval !== bNeedsApproval) return aNeedsApproval - bNeedsApproval
                  // Luego por prioridad
                  const priOrder: Record<PrioridadTarea, number> = { critica: 0, alta: 1, media: 2, baja: 3 }
                  return priOrder[a.prioridad] - priOrder[b.prioridad]
                })
                .map((tarea) => (
                  <TareaCard key={tarea.id} tarea={tarea} />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
