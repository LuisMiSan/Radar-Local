'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  Camera,
  Star,
  MessageSquare,
  Clock,
  Globe,
  FileText,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Minus,
  CalendarDays,
  Target,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts'

// ════════════════════════════════════════════════════════════
// Tipos
// ════════════════════════════════════════════════════════════

interface Snapshot {
  id: string
  fecha: string
  nombre: string | null
  rating: number
  resenas_count: number
  fotos_count: number
  horarios_completos: boolean
  tiene_web: boolean
  tiene_descripcion: boolean
  score_gbp: number
  score_rating: number
  score_resenas: number
  score_fotos: number
  score_horarios: number
  score_web: number
  score_descripcion: number
  delta_score: number
  delta_resenas: number
  delta_fotos: number
  delta_rating: number
  tareas_creadas: number
  tareas_completadas: number
  agentes_ejecutados: number
  notas: string | null
}

interface Resumen {
  dias_tracking: number
  primer_snapshot: Snapshot | null
  ultimo_snapshot: Snapshot | null
  delta_total_score: number
  delta_total_resenas: number
  delta_total_fotos: number
  delta_total_rating: number
  mejora_promedio_diaria: number
}

interface Cliente {
  id: string
  nombre: string
  negocio: string
  pack: string | null
  estado: string
}

// ════════════════════════════════════════════════════════════
// Componentes auxiliares
// ════════════════════════════════════════════════════════════

function DeltaBadge({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) return <span className="text-neutral-400 text-xs flex items-center gap-0.5"><Minus className="w-3 h-3" /> sin cambios</span>
  const isPositive = value > 0
  return (
    <span className={`text-xs font-medium flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
      {isPositive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}{value}{suffix}
    </span>
  )
}

function MetricCard({ icon: Icon, label, value, delta, suffix = '', color }: {
  icon: React.ElementType; label: string; value: string | number; delta?: number; suffix?: string; color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs text-neutral-500 font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-neutral-900">{value}{suffix}</span>
        {delta !== undefined && <DeltaBadge value={delta} />}
      </div>
    </div>
  )
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-500 w-24 text-right">{label}</span>
      <div className="flex-1 h-4 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-neutral-700 w-12">{value}/{max}</span>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// Página principal
// ════════════════════════════════════════════════════════════

export default function EvolucionPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState<string>('')
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [loading, setLoading] = useState(false)
  const [tomandoSnapshot, setTomandoSnapshot] = useState(false)
  const [dias, setDias] = useState(90)
  const [mensaje, setMensaje] = useState('')

  // Cargar clientes
  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(data => {
        const activos = (data as Cliente[]).filter(c => c.estado === 'activo' || c.pack)
        setClientes(activos)
        if (activos.length > 0 && !clienteId) {
          setClienteId(activos[0].id)
        }
      })
      .catch(console.error)
  }, [])

  // Cargar snapshots cuando cambia el cliente
  const cargarDatos = useCallback(async () => {
    if (!clienteId) return
    setLoading(true)
    try {
      const [snapsRes, resumenRes] = await Promise.all([
        fetch(`/api/snapshots?clienteId=${clienteId}&dias=${dias}`),
        fetch(`/api/snapshots?clienteId=${clienteId}&resumen=true`),
      ])
      const snapsData = await snapsRes.json()
      const resumenData = await resumenRes.json()
      setSnapshots(Array.isArray(snapsData) ? snapsData : [])
      setResumen(resumenData)
    } catch (e) {
      console.error('Error cargando datos:', e)
    } finally {
      setLoading(false)
    }
  }, [clienteId, dias])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // Tomar snapshot
  const tomarSnapshot = async () => {
    if (!clienteId) return
    setTomandoSnapshot(true)
    setMensaje('')
    try {
      const res = await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId }),
      })
      const data = await res.json()
      if (res.ok) {
        setMensaje(`Snapshot tomado: ${data.score_gbp}/100 (Δ${data.delta_score >= 0 ? '+' : ''}${data.delta_score})`)
        cargarDatos()
      } else {
        setMensaje(`Error: ${data.error}`)
      }
    } catch (e) {
      setMensaje(`Error: ${e}`)
    } finally {
      setTomandoSnapshot(false)
    }
  }

  const ultimo = resumen?.ultimo_snapshot
  const primero = resumen?.primer_snapshot

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Evolución GBP
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Seguimiento diario del perfil en Google Maps</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de cliente */}
          <select
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            className="text-sm border border-neutral-300 rounded-lg px-3 py-2 bg-white"
          >
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.negocio}</option>
            ))}
          </select>

          {/* Rango temporal */}
          <select
            value={dias}
            onChange={e => setDias(Number(e.target.value))}
            className="text-sm border border-neutral-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
            <option value={90}>90 días</option>
            <option value={365}>1 año</option>
          </select>

          {/* Tomar snapshot */}
          <button
            onClick={tomarSnapshot}
            disabled={tomandoSnapshot || !clienteId}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${tomandoSnapshot ? 'animate-spin' : ''}`} />
            {tomandoSnapshot ? 'Tomando...' : 'Snapshot de hoy'}
          </button>
        </div>
      </div>

      {/* Mensaje feedback */}
      {mensaje && (
        <div className={`text-sm px-4 py-2 rounded-lg ${mensaje.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {mensaje}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
          <span className="ml-2 text-neutral-500">Cargando datos de evolución...</span>
        </div>
      ) : snapshots.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
          <Target className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700">Sin datos de seguimiento</h3>
          <p className="text-sm text-neutral-500 mt-2">
            Toma tu primer snapshot para empezar a documentar la evolución del perfil GBP.
          </p>
          <button
            onClick={tomarSnapshot}
            disabled={tomandoSnapshot}
            className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
          >
            Tomar primer snapshot
          </button>
        </div>
      ) : (
        <>
          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              icon={Target} label="Score GBP" color="bg-emerald-500"
              value={ultimo?.score_gbp ?? 0} suffix="/100"
              delta={resumen?.delta_total_score}
            />
            <MetricCard
              icon={Star} label="Rating" color="bg-amber-500"
              value={ultimo?.rating ?? 0} suffix="/5"
              delta={resumen ? Math.round(resumen.delta_total_rating * 10) / 10 : undefined}
            />
            <MetricCard
              icon={MessageSquare} label="Reseñas" color="bg-blue-500"
              value={ultimo?.resenas_count ?? 0}
              delta={resumen?.delta_total_resenas}
            />
            <MetricCard
              icon={Camera} label="Fotos" color="bg-purple-500"
              value={ultimo?.fotos_count ?? 0}
              delta={resumen?.delta_total_fotos}
            />
            <MetricCard
              icon={CalendarDays} label="Días tracking" color="bg-neutral-500"
              value={resumen?.dias_tracking ?? 0}
            />
            <MetricCard
              icon={TrendingUp} label="Mejora/día" color="bg-indigo-500"
              value={resumen?.mejora_promedio_diaria ?? 0} suffix=" pts"
            />
          </div>

          {/* Gráfico de evolución del score */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Evolución del Score GBP</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={snapshots}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} tickFormatter={f => f.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(v) => [`${v}/100`, 'Score']}
                />
                <Area type="monotone" dataKey="score_gbp" stroke="#10b981" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r: 4, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Desglose del score + Evolución de métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Desglose actual */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-700 mb-4">Desglose del Score Actual</h3>
              <div className="space-y-3">
                <ScoreBar label="Rating" value={ultimo?.score_rating ?? 0} max={25} color="bg-amber-500" />
                <ScoreBar label="Reseñas" value={ultimo?.score_resenas ?? 0} max={25} color="bg-blue-500" />
                <ScoreBar label="Fotos" value={ultimo?.score_fotos ?? 0} max={20} color="bg-purple-500" />
                <ScoreBar label="Horarios" value={ultimo?.score_horarios ?? 0} max={10} color="bg-teal-500" />
                <ScoreBar label="Web" value={ultimo?.score_web ?? 0} max={10} color="bg-indigo-500" />
                <ScoreBar label="Descripción" value={ultimo?.score_descripcion ?? 0} max={10} color="bg-rose-500" />
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs text-neutral-500">Total</span>
                <span className="text-lg font-bold text-neutral-900">{ultimo?.score_gbp ?? 0}/100</span>
              </div>
            </div>

            {/* Gráfico de métricas clave */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-700 mb-4">Evolución de Métricas</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={snapshots}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} tickFormatter={f => f.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="resenas_count" name="Reseñas" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="fotos_count" name="Fotos" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="rating" name="Rating (×10)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparación primer vs último snapshot */}
          {primero && ultimo && primero.fecha !== ultimo.fecha && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-700 mb-4">
                Comparación: {primero.fecha} vs {ultimo.fecha}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { area: 'Rating', primero: primero.score_rating, ultimo: ultimo.score_rating },
                  { area: 'Reseñas', primero: primero.score_resenas, ultimo: ultimo.score_resenas },
                  { area: 'Fotos', primero: primero.score_fotos, ultimo: ultimo.score_fotos },
                  { area: 'Horarios', primero: primero.score_horarios, ultimo: ultimo.score_horarios },
                  { area: 'Web', primero: primero.score_web, ultimo: ultimo.score_web },
                  { area: 'Descripción', primero: primero.score_descripcion, ultimo: ultimo.score_descripcion },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="primero" name={`Día 1 (${primero.fecha.slice(5)})`} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ultimo" name={`Hoy (${ultimo.fecha.slice(5)})`} fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Timeline diario */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-700">Historial de Snapshots</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Fecha</th>
                    <th className="px-4 py-3 text-center font-medium">Score</th>
                    <th className="px-4 py-3 text-center font-medium">Rating</th>
                    <th className="px-4 py-3 text-center font-medium">Reseñas</th>
                    <th className="px-4 py-3 text-center font-medium">Fotos</th>
                    <th className="px-4 py-3 text-center font-medium">Horarios</th>
                    <th className="px-4 py-3 text-center font-medium">Web</th>
                    <th className="px-4 py-3 text-center font-medium">Desc.</th>
                    <th className="px-4 py-3 text-center font-medium">Tareas</th>
                    <th className="px-4 py-3 text-left font-medium">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {[...snapshots].reverse().map(s => (
                    <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-neutral-700">{s.fecha}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-neutral-900">{s.score_gbp}</span>
                        {s.delta_score !== 0 && (
                          <span className={`ml-1 text-xs ${s.delta_score > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {s.delta_score > 0 ? '+' : ''}{s.delta_score}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-amber-600">{s.rating}★</td>
                      <td className="px-4 py-3 text-center">
                        {s.resenas_count}
                        {s.delta_resenas !== 0 && (
                          <span className={`ml-1 text-xs ${s.delta_resenas > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {s.delta_resenas > 0 ? '+' : ''}{s.delta_resenas}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {s.fotos_count}
                        {s.delta_fotos !== 0 && (
                          <span className={`ml-1 text-xs ${s.delta_fotos > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {s.delta_fotos > 0 ? '+' : ''}{s.delta_fotos}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{s.horarios_completos ? '✅' : '❌'}</td>
                      <td className="px-4 py-3 text-center">{s.tiene_web ? '✅' : '❌'}</td>
                      <td className="px-4 py-3 text-center">{s.tiene_descripcion ? '✅' : '❌'}</td>
                      <td className="px-4 py-3 text-center text-neutral-500">
                        {s.tareas_completadas > 0 && <span className="text-emerald-600">{s.tareas_completadas}✓</span>}
                        {s.tareas_creadas > 0 && <span className="ml-1 text-blue-500">{s.tareas_creadas}+</span>}
                        {s.tareas_creadas === 0 && s.tareas_completadas === 0 && '—'}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs max-w-[200px] truncate">{s.notas ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Checklist de estado */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Estado Actual del Perfil</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Horarios completos', ok: ultimo?.horarios_completos, icon: Clock },
                { label: 'Website vinculado', ok: ultimo?.tiene_web, icon: Globe },
                { label: 'Descripción editorial', ok: ultimo?.tiene_descripcion, icon: FileText },
                { label: 'Rating ≥ 4.0', ok: (ultimo?.rating ?? 0) >= 4.0, icon: Star },
                { label: '20+ reseñas', ok: (ultimo?.resenas_count ?? 0) >= 20, icon: MessageSquare },
                { label: '20+ fotos', ok: (ultimo?.fotos_count ?? 0) >= 20, icon: Camera },
              ].map(item => (
                <div key={item.label} className={`flex items-center gap-3 p-3 rounded-lg border ${item.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-neutral-50 border-neutral-200'}`}>
                  <item.icon className={`w-4 h-4 ${item.ok ? 'text-emerald-600' : 'text-neutral-400'}`} />
                  <span className={`text-sm ${item.ok ? 'text-emerald-700 font-medium' : 'text-neutral-500'}`}>{item.label}</span>
                  <span className="ml-auto text-sm">{item.ok ? '✅' : '⬜'}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
