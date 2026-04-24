'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield, RefreshCw, CheckCircle2, XCircle, Clock, AlertTriangle,
  Info, ChevronDown, ChevronUp, ExternalLink, Play, Loader2,
} from 'lucide-react'
import Header from '@/components/ui/header'
import type { CambioDetectado, EstadoCambio, ImpactoVigilante } from '@/types'

// ── Helpers de display ──────────────────────────────────────

const IMPACTO_CONFIG: Record<ImpactoVigilante, { label: string; dot: string; border: string; bg: string; text: string }> = {
  critico:    { label: 'Crítico',    dot: 'bg-red-500',    border: 'border-red-200',    bg: 'bg-red-50',    text: 'text-red-700'    },
  importante: { label: 'Importante', dot: 'bg-amber-500',  border: 'border-amber-200',  bg: 'bg-amber-50',  text: 'text-amber-700'  },
  info:       { label: 'Info',       dot: 'bg-green-500',  border: 'border-green-200',  bg: 'bg-green-50',  text: 'text-green-700'  },
}

const ESTADO_CONFIG: Record<EstadoCambio, { label: string; color: string }> = {
  pending:      { label: 'Pendiente',    color: 'text-neutral-500' },
  analysed:     { label: 'Analizado',    color: 'text-blue-600' },
  aprobado:     { label: 'Aprobado',     color: 'text-green-600' },
  descartado:   { label: 'Descartado',   color: 'text-neutral-400' },
  implementado: { label: 'Implementado', color: 'text-purple-600' },
  pospuesto:    { label: 'Pospuesto',    color: 'text-amber-600' },
}

const TIPO_LABEL: Record<string, string> = {
  knowledge: '📚 Knowledge',
  prompt:    '🤖 Prompt',
  code:      '💻 Código',
  config:    '⚙️ Config',
  manual:    '👤 Manual',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ── Tarjeta de cambio ───────────────────────────────────────

function CambioCard({
  cambio,
  onAction,
  loading,
}: {
  cambio: CambioDetectado
  onAction: (id: string, estado: EstadoCambio) => void
  loading: boolean
}) {
  const [expanded, setExpanded] = useState(cambio.impacto_estimado === 'critico')
  const imp = IMPACTO_CONFIG[cambio.impacto_estimado]
  const est = ESTADO_CONFIG[cambio.estado]
  const pendiente = cambio.estado === 'analysed' || cambio.estado === 'pending'

  return (
    <div className={`border rounded-xl overflow-hidden ${imp.border}`}>
      {/* Cabecera */}
      <div
        className={`flex items-start gap-3 p-4 cursor-pointer ${imp.bg}`}
        onClick={() => setExpanded((e) => !e)}
      >
        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${imp.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-neutral-900">{cambio.titulo}</h3>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/70 text-neutral-600 border border-neutral-200">
              {TIPO_LABEL[cambio.tipo_cambio] ?? cambio.tipo_cambio}
            </span>
            <span className={`text-[10px] font-medium ${est.color}`}>{est.label}</span>
          </div>
          <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{cambio.resumen}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-neutral-400">{cambio.fuente}</span>
            <span className="text-[10px] text-neutral-400">{formatDate(cambio.fecha_deteccion)}</span>
            {cambio.area_afectada && (
              <span className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500">
                {cambio.area_afectada}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-neutral-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="p-4 bg-white border-t border-neutral-100 space-y-4">
          {/* Propuesta */}
          {cambio.propuesta && (
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Propuesta de adaptación
              </p>
              <p className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3">
                {cambio.propuesta}
              </p>
            </div>
          )}

          {/* Diff para cambios de código */}
          {cambio.diff_propuesto && (
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Diff propuesto — <code className="text-blue-600">{cambio.diff_propuesto.file}</code>
              </p>
              <div className="rounded-lg overflow-hidden border border-neutral-200 text-[11px] font-mono">
                <div className="bg-neutral-800 px-3 py-1.5 text-neutral-400 text-[10px]">
                  {cambio.diff_propuesto.file}
                </div>
                {cambio.diff_propuesto.before && (
                  <div className="bg-red-950/30 px-3 py-2 text-red-300 whitespace-pre-wrap">
                    {cambio.diff_propuesto.before.split('\n').map((l, i) => (
                      <div key={i}>- {l}</div>
                    ))}
                  </div>
                )}
                {cambio.diff_propuesto.after && (
                  <div className="bg-green-950/30 px-3 py-2 text-green-300 whitespace-pre-wrap">
                    {cambio.diff_propuesto.after.split('\n').map((l, i) => (
                      <div key={i}>+ {l}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL fuente */}
          {cambio.url && (
            <a
              href={cambio.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-3 h-3" />
              Ver fuente original
            </a>
          )}

          {/* Notas del admin */}
          {cambio.notas_admin && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              {cambio.notas_admin}
            </div>
          )}

          {/* Botones HITL */}
          {pendiente && (
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => onAction(cambio.id, 'aprobado')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aprobar e implementar
              </button>
              <button
                onClick={() => onAction(cambio.id, 'pospuesto')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-200 disabled:opacity-50 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                Posponer
              </button>
              <button
                onClick={() => onAction(cambio.id, 'descartado')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-semibold hover:bg-neutral-200 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Descartar
              </button>
            </div>
          )}

          {cambio.estado === 'implementado' && cambio.fecha_implementacion && (
            <p className="text-xs text-purple-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Implementado el {formatDate(cambio.fecha_implementacion)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Página principal ────────────────────────────────────────

export default function VigilantePage() {
  const [cambios, setCambios] = useState<CambioDetectado[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string>('pending_analysed')
  const [loadingData, setLoadingData] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)
  const [runningCron, setRunningCron] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const fetchCambios = useCallback(async () => {
    setLoadingData(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (filtroEstado !== 'todos' && filtroEstado !== 'pending_analysed') {
        params.set('estado', filtroEstado)
      }
      const res = await fetch(`/api/vigilante/cambios?${params}`)
      const data = await res.json()
      let lista: CambioDetectado[] = Array.isArray(data) ? data : []
      if (filtroEstado === 'pending_analysed') {
        lista = lista.filter((c) => c.estado === 'pending' || c.estado === 'analysed')
      }
      setCambios(lista)
    } finally {
      setLoadingData(false)
    }
  }, [filtroEstado])

  useEffect(() => { fetchCambios() }, [fetchCambios])

  async function handleAction(id: string, estado: EstadoCambio) {
    setLoadingAction(true)
    try {
      const res = await fetch(`/api/vigilante/cambios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      const data = await res.json()
      if (data.notas_admin) setMensaje(data.notas_admin)
      await fetchCambios()
    } finally {
      setLoadingAction(false)
    }
  }

  async function handleRunNow() {
    setRunningCron(true)
    setMensaje(null)
    try {
      const res = await fetch('/api/cron/vigilante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: '' }), // sin secret en manual — el cron protege solo GET
      })
      const data = await res.json()
      setMensaje(data.mensaje ?? 'Vigilante ejecutado')
      await fetchCambios()
    } finally {
      setRunningCron(false)
    }
  }

  const porImpacto = (imp: ImpactoVigilante) => cambios.filter((c) => c.impacto_estimado === imp)
  const pendientes = cambios.filter((c) => c.estado === 'pending' || c.estado === 'analysed')

  return (
    <>
      <Header title="Agente Vigilante" />
      <main className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Pendientes', value: pendientes.length, color: 'text-blue-600', icon: Info },
            { label: 'Críticos', value: porImpacto('critico').length, color: 'text-red-600', icon: AlertTriangle },
            { label: 'Importantes', value: porImpacto('importante').length, color: 'text-amber-600', icon: AlertTriangle },
            { label: 'Implementados', value: cambios.filter((c) => c.estado === 'implementado').length, color: 'text-purple-600', icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4">
              <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="pending_analysed">Pendientes de revisión</option>
            <option value="todos">Todos</option>
            <option value="implementado">Implementados</option>
            <option value="descartado">Descartados</option>
            <option value="pospuesto">Pospuestos</option>
          </select>

          <button
            onClick={fetchCambios}
            disabled={loadingData}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          <button
            onClick={handleRunNow}
            disabled={runningCron}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-700 disabled:opacity-50 transition-colors ml-auto"
          >
            {runningCron ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Escaneando...</>
            ) : (
              <><Play className="w-4 h-4" /> Ejecutar ahora</>
            )}
          </button>
        </div>

        {/* Feedback */}
        {mensaje && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
            {mensaje}
          </div>
        )}

        {/* Lista de cambios */}
        {loadingData ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando...
          </div>
        ) : cambios.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sin cambios detectados</p>
            <p className="text-xs mt-1">Ejecuta el vigilante manualmente o espera al cron diario (7:00 AM)</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cambios.map((c) => (
              <CambioCard
                key={c.id}
                cambio={c}
                onAction={handleAction}
                loading={loadingAction}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
