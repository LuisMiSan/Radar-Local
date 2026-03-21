'use client'

// ─────────────────────────────────────────────────────────
// PORTAL DEL CLIENTE — Dashboard de solo lectura
// ─────────────────────────────────────────────────────────
// Esta es la página que ve el cliente cuando abre su link
// personalizado. Muestra métricas, tareas y reportes.
// No puede modificar nada — solo visualizar.

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  MapPin,
  TrendingUp,
  Phone,
  Eye,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  ChevronUp,
  ChevronDown,
  Minus,
  BarChart3,
  Activity,
  Shield,
} from 'lucide-react'

// ── Tipos para los datos del portal ──
interface PortalData {
  negocio: string
  pack: string | null
  estado: string
  miembro_desde: string
  tareas: {
    agente: string
    tipo: string
    estado: string
    resultado: Record<string, unknown> | null
    fecha: string
    completada: string | null
  }[]
  metricas: {
    tipo: string
    valor: number | null
    fecha: string
  }[]
  reportes: {
    mes: string
    contenido: Record<string, unknown> | null
    fecha: string
  }[]
}

// ── Labels para agentes en español ──
const AGENTE_LABELS: Record<string, string> = {
  auditor_gbp: 'Auditor de Perfil',
  optimizador_nap: 'Optimización NAP',
  keywords_locales: 'Keywords Locales',
  gestor_resenas: 'Gestión de Reseñas',
  redactor_posts_gbp: 'Redacción de Posts',
  generador_schema: 'Schema Markup',
  creador_faq_geo: 'FAQ Optimizadas',
  generador_chunks: 'Contenido IA',
  tldr_entidad: 'Entidad Digital',
  monitor_ias: 'Monitor de IAs',
  generador_reporte: 'Informe Mensual',
}

const PACK_LABELS: Record<string, string> = {
  visibilidad_local: 'Visibilidad Local',
  autoridad_maps_ia: 'Autoridad Maps + IA',
}

const METRIC_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  visitas_gbp: { label: 'Visitas al perfil', icon: Eye, color: 'text-blue-600' },
  llamadas_gbp: { label: 'Llamadas recibidas', icon: Phone, color: 'text-green-600' },
  resenas_total: { label: 'Reseñas totales', icon: Star, color: 'text-amber-500' },
  puntuacion_gbp: { label: 'Puntuación GBP', icon: BarChart3, color: 'text-purple-600' },
}

// ── Calcular tendencia entre dos valores ──
function getTrend(current: number, previous: number): { direction: 'up' | 'down' | 'same'; percent: number } {
  if (previous === 0) return { direction: 'same', percent: 0 }
  const diff = ((current - previous) / previous) * 100
  if (diff > 1) return { direction: 'up', percent: Math.round(diff) }
  if (diff < -1) return { direction: 'down', percent: Math.round(Math.abs(diff)) }
  return { direction: 'same', percent: 0 }
}

export default function PortalPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/portal/${token}`)
        if (res.status === 404) {
          setError('Portal no encontrado. Verifica tu enlace.')
          return
        }
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch {
        setError('Error al cargar los datos. Inténtalo de nuevo.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  // ── Estado: Cargando ──
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  // ── Estado: Error ──
  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-neutral-800 mb-2">Acceso no disponible</h1>
          <p className="text-neutral-500 text-sm">{error || 'No se pudieron cargar los datos.'}</p>
          <p className="text-neutral-400 text-xs mt-4">Si crees que es un error, contacta con tu gestor en Radar Local.</p>
        </div>
      </div>
    )
  }

  // ── Procesar métricas para las tarjetas ──
  const metricTypes = ['visitas_gbp', 'llamadas_gbp', 'resenas_total', 'puntuacion_gbp']
  const metricCards = metricTypes.map(tipo => {
    const values = data.metricas
      .filter(m => m.tipo === tipo)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))

    const current = values[0]?.valor ?? 0
    const previous = values[1]?.valor ?? 0
    const trend = getTrend(current, previous)
    const config = METRIC_LABELS[tipo] || { label: tipo, icon: Activity, color: 'text-neutral-600' }

    return { tipo, current, trend, ...config }
  })

  // ── Procesar tareas ──
  const tareasCompletadas = data.tareas.filter(t => t.estado === 'completada').length
  const tareasTotal = data.tareas.length
  const tareasPendientes = data.tareas.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso')

  // ── Formatear fecha ──
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }

  const miembroDesde = new Date(data.miembro_desde).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-800">{data.negocio}</h1>
                <p className="text-xs text-neutral-400">
                  {data.pack ? PACK_LABELS[data.pack] || data.pack : 'Plan básico'}
                  {' · '}Cliente desde {miembroDesde}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Radar Local
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Métricas principales ── */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            Rendimiento actual
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map(({ tipo, current, trend, label, icon: Icon, color }) => (
              <div key={tipo} className="bg-white rounded-xl p-5 border border-neutral-100 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  {trend.direction === 'up' && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      <ChevronUp className="w-3 h-3" />
                      {trend.percent}%
                    </span>
                  )}
                  {trend.direction === 'down' && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                      <ChevronDown className="w-3 h-3" />
                      {trend.percent}%
                    </span>
                  )}
                  {trend.direction === 'same' && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded-full">
                      <Minus className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-neutral-800">{current}</p>
                <p className="text-xs text-neutral-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Progreso de tareas ── */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            Trabajo realizado
          </h2>
          <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
            {/* Barra de progreso */}
            <div className="p-5 border-b border-neutral-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">
                  {tareasCompletadas} de {tareasTotal} tareas completadas
                </span>
                <span className="text-sm font-bold text-primary">
                  {tareasTotal > 0 ? Math.round((tareasCompletadas / tareasTotal) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${tareasTotal > 0 ? (tareasCompletadas / tareasTotal) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Lista de tareas */}
            <div className="divide-y divide-neutral-50">
              {data.tareas.map((tarea, i) => {
                const StatusIcon = tarea.estado === 'completada' ? CheckCircle2
                  : tarea.estado === 'en_progreso' ? Clock
                  : AlertCircle
                const statusColor = tarea.estado === 'completada' ? 'text-green-500'
                  : tarea.estado === 'en_progreso' ? 'text-amber-500'
                  : 'text-neutral-400'
                const statusBg = tarea.estado === 'completada' ? 'bg-green-50'
                  : tarea.estado === 'en_progreso' ? 'bg-amber-50'
                  : 'bg-neutral-50'
                const statusLabel = tarea.estado === 'completada' ? 'Completada'
                  : tarea.estado === 'en_progreso' ? 'En progreso'
                  : 'Pendiente'

                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <div className={`w-8 h-8 rounded-lg ${statusBg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-700 truncate">
                        {AGENTE_LABELS[tarea.agente] || tarea.agente}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {formatDate(tarea.fecha)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBg} ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                )
              })}
              {data.tareas.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-neutral-400">
                  Aún no hay tareas registradas
                </div>
              )}
            </div>

            {/* Tareas en progreso destacadas */}
            {tareasPendientes.length > 0 && (
              <div className="bg-amber-50/50 px-5 py-3 border-t border-amber-100">
                <p className="text-xs text-amber-700">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {tareasPendientes.length} tarea{tareasPendientes.length > 1 ? 's' : ''} en curso
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Informes mensuales ── */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            Informes mensuales
          </h2>
          {data.reportes.length > 0 ? (
            <div className="space-y-4">
              {data.reportes.map((reporte, i) => {
                const contenido = reporte.contenido as Record<string, unknown> | null
                const resumen = contenido?.resumen as string || ''
                const puntuacion = contenido?.puntuacion as number | undefined
                const mejoras = (contenido?.mejoras_realizadas as string[]) || []
                const proximos = (contenido?.proximos_pasos as string[]) || []

                return (
                  <div key={i} className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-800 capitalize">
                            {formatMonth(reporte.mes)}
                          </h3>
                          <p className="text-xs text-neutral-400">
                            Enviado el {formatDate(reporte.fecha)}
                          </p>
                        </div>
                      </div>
                      {puntuacion !== undefined && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{puntuacion}</p>
                          <p className="text-[10px] text-neutral-400 uppercase">Puntuación</p>
                        </div>
                      )}
                    </div>
                    <div className="px-5 py-4 space-y-4">
                      {resumen && (
                        <p className="text-sm text-neutral-600 leading-relaxed">{resumen}</p>
                      )}
                      {mejoras.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Mejoras realizadas
                          </p>
                          <ul className="space-y-1">
                            {mejoras.map((m, j) => (
                              <li key={j} className="text-sm text-neutral-600 flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {proximos.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Próximos pasos
                          </p>
                          <ul className="space-y-1">
                            {proximos.map((p, j) => (
                              <li key={j} className="text-sm text-neutral-600 flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-100 px-5 py-12 text-center">
              <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-400">Aún no hay informes disponibles</p>
              <p className="text-xs text-neutral-300 mt-1">Se generan al final de cada mes</p>
            </div>
          )}
        </section>

        {/* ── Footer ── */}
        <footer className="text-center py-8 border-t border-neutral-100">
          <div className="flex items-center justify-center gap-2 text-neutral-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Radar Local</span>
          </div>
          <p className="text-xs text-neutral-300">
            Optimización de presencia local con Inteligencia Artificial
          </p>
        </footer>
      </main>
    </div>
  )
}
