'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  CheckCircle,
  Clock,
  Bot,
  ArrowRight,
  TrendingUp,
  Zap,
  Mic,
  FileText,
  Code,
  BookOpen,
  DollarSign,
  RefreshCw,
  Loader2,
  BarChart3,
  Globe,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface DashboardData {
  clientes: {
    total: number
    activos: number
    leads: number
    porPack: { autoridad_maps_ia: number; visibilidad_local: number }
  }
  tareas: { completadas: number; pendientes: number; errores: number }
  contenido: {
    total: number
    generados: number
    publicados: number
    descartados: number
    vozTotal: number
    porTipo: Record<string, number>
    porPlataforma: Record<string, number>
  }
  costes: { total: number; llamadas: number; diario: { fecha: string; coste: number }[] }
  timeline: { fecha: string; faq_voz: number; chunk: number; schema_jsonld: number; tldr: number; total: number }[]
  recentTasks: { agente: string; estado: string; fecha: string }[]
  sync: { lastPush: string | null; lastPull: string | null }
}

const AGENTE_LABELS: Record<string, string> = {
  auditor_gbp: 'Auditor GBP',
  optimizador_nap: 'NAP',
  keywords_locales: 'Keywords',
  gestor_resenas: 'Reseñas',
  redactor_posts_gbp: 'Posts GBP',
  generador_schema: 'Schema',
  creador_faq_geo: 'FAQ GEO',
  generador_chunks: 'Chunks',
  tldr_entidad: 'TL;DR',
  monitor_ias: 'Monitor IA',
  generador_reporte: 'Reporte',
  supervisor: 'Supervisor',
}

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#6366f1', '#f59e0b', '#10b981', '#ef4444']

const TIPO_LABELS: Record<string, string> = {
  faq_voz: 'FAQs voz',
  chunk: 'Chunks',
  schema_jsonld: 'Schemas',
  tldr: 'TL;DR',
  post_gbp: 'Posts',
  respuesta_resena: 'Respuestas',
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    )
  }

  if (!data) {
    return (
      <main className="p-6">
        <p className="text-neutral-500">Error cargando dashboard</p>
      </main>
    )
  }

  // Prepare pie data
  const pieData = Object.entries(data.contenido.porTipo)
    .filter(([, v]) => v > 0)
    .map(([tipo, count]) => ({ name: TIPO_LABELS[tipo] ?? tipo, value: count }))

  // Prepare platform data
  const platData = Object.entries(data.contenido.porPlataforma)
    .filter(([, v]) => v > 0)
    .map(([plat, count]) => ({ plataforma: plat, count }))
    .sort((a, b) => b.count - a.count)

  const vozPct = data.contenido.total > 0
    ? Math.round((data.contenido.vozTotal / data.contenido.total) * 100)
    : 0

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500">Radar Local — Visión general</p>
        </div>
        <button onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Row 1: Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={Users} label="Clientes activos" value={data.clientes.activos} color="text-accent" bg="bg-accent/10" />
        <KpiCard icon={BookOpen} label="Contenidos" value={data.contenido.total} color="text-blue-600" bg="bg-blue-50" />
        <KpiCard icon={Mic} label="Optimiz. voz" value={data.contenido.vozTotal}
          subtitle={`${vozPct}% del total`}
          color="text-purple-600" bg="bg-purple-50" />
        <KpiCard icon={CheckCircle} label="Tareas OK" value={data.tareas.completadas} color="text-green-600" bg="bg-green-50" />
        <KpiCard icon={DollarSign} label="Coste API" value={`$${data.costes.total.toFixed(2)}`}
          subtitle={`${data.costes.llamadas} llamadas`}
          color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Row 2: Voice metrics bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <VoiceMetric icon={Mic} label="FAQs de voz" value={data.contenido.porTipo['faq_voz'] ?? 0} color="bg-purple-500" />
        <VoiceMetric icon={FileText} label="Chunks citables" value={data.contenido.porTipo['chunk'] ?? 0} color="bg-cyan-500" />
        <VoiceMetric icon={Code} label="Schemas JSON-LD" value={data.contenido.porTipo['schema_jsonld'] ?? 0} color="bg-indigo-500" />
        <VoiceMetric icon={BookOpen} label="TL;DR entidad" value={data.contenido.porTipo['tldr'] ?? 0} color="bg-rose-500" />
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Contenido generado por día
          </h3>
          {data.timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} tickFormatter={f => f.split('-').slice(1).join('/')} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  labelFormatter={f => new Date(f).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                />
                <Area type="monotone" dataKey="faq_voz" stackId="1" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.6} name="FAQs voz" />
                <Area type="monotone" dataKey="chunk" stackId="1" fill="#06b6d4" stroke="#06b6d4" fillOpacity={0.6} name="Chunks" />
                <Area type="monotone" dataKey="schema_jsonld" stackId="1" fill="#6366f1" stroke="#6366f1" fillOpacity={0.6} name="Schemas" />
                <Area type="monotone" dataKey="tldr" stackId="1" fill="#f43f5e" stroke="#f43f5e" fillOpacity={0.6} name="TL;DR" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-neutral-400 text-sm">
              Sin datos de contenido aún
            </div>
          )}
        </div>

        {/* Pie chart: content distribution */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Distribución por tipo
          </h3>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-neutral-600">{d.name}</span>
                    <span className="font-bold text-neutral-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-neutral-400 text-sm">
              Sin datos
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Cost chart + Platforms + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost mini chart */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-600" />
            Coste API (14 días)
          </h3>
          {data.costes.diario.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data.costes.diario}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10 }} tickFormatter={f => f.split('-')[2]} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  formatter={(v) => [`$${Number(v).toFixed(4)}`, 'Coste']}
                />
                <Bar dataKey="coste" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[160px] text-neutral-400 text-sm">
              Sin datos de coste
            </div>
          )}
        </div>

        {/* Platform coverage */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-600" />
            Cobertura por plataforma
          </h3>
          <div className="space-y-3">
            {platData.map(p => {
              const max = platData[0]?.count ?? 1
              const pct = Math.round((p.count / max) * 100)
              const platLabels: Record<string, string> = {
                gemini: '🤖 Gemini', chatgpt: '💬 ChatGPT', google: '🔍 Google',
                siri: '🍎 Siri', web: '🌐 Web', google_maps: '📍 Maps',
              }
              return (
                <div key={p.plataforma}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">{platLabels[p.plataforma] ?? p.plataforma}</span>
                    <span className="font-bold text-neutral-800">{p.count}</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {platData.length === 0 && (
              <p className="text-xs text-neutral-400 text-center py-4">Sin datos</p>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Actividad reciente
          </h3>
          <div className="space-y-1">
            {data.recentTasks.map((task, i) => {
              const colors: Record<string, string> = {
                completada: 'bg-green-50 text-green-600',
                en_progreso: 'bg-blue-50 text-blue-600',
                pendiente: 'bg-yellow-50 text-yellow-600',
                error: 'bg-red-50 text-red-500',
              }
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${colors[task.estado] ?? 'bg-neutral-50'}`}>
                      <Bot className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-medium text-neutral-700">
                      {AGENTE_LABELS[task.agente] ?? task.agente}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(task.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              )
            })}
            {data.recentTasks.length === 0 && (
              <p className="text-xs text-neutral-400 text-center py-4">Sin actividad</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 5: Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction href="/admin/agentes" icon={Zap} label="Ejecutar agentes" sub="11 agentes" color="bg-accent/10 text-accent" />
        <QuickAction href="/admin/contenido" icon={BookOpen} label="Librería contenido" sub="FAQs, schemas, chunks" color="bg-blue-50 text-blue-600" />
        <QuickAction href="/admin/evolucion" icon={TrendingUp} label="Evolución GBP" sub="Snapshots" color="bg-green-50 text-green-600" />
        <QuickAction href="/admin/gastos" icon={DollarSign} label="Control gastos" sub={`$${data.costes.total.toFixed(2)} mes`} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Sync status footer */}
      {(data.sync.lastPush || data.sync.lastPull) && (
        <div className="text-xs text-neutral-400 text-center">
          NotebookLM —
          {data.sync.lastPush && ` Último push: ${new Date(data.sync.lastPush).toLocaleDateString('es-ES')}`}
          {data.sync.lastPull && ` · Último pull: ${new Date(data.sync.lastPull).toLocaleDateString('es-ES')}`}
        </div>
      )}
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, subtitle, color, bg }: {
  icon: typeof Users; label: string; value: string | number; subtitle?: string; color: string; bg: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500">{label}</p>
        {subtitle && <p className="text-[10px] text-neutral-400">{subtitle}</p>}
      </div>
    </div>
  )
}

function VoiceMetric({ icon: Icon, label, value, color }: {
  icon: typeof Mic; label: string; value: number; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color} text-white`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-lg font-bold text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
    </div>
  )
}

function QuickAction({ href, icon: Icon, label, sub, color }: {
  href: string; icon: typeof Zap; label: string; sub: string; color: string
}) {
  return (
    <Link href={href}
      className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-200 hover:border-accent hover:shadow-sm transition-all group">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 group-hover:text-accent transition-colors">{label}</p>
        <p className="text-xs text-neutral-400">{sub}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-accent transition-colors" />
    </Link>
  )
}
