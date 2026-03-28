'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen,
  Mic,
  Code,
  FileText,
  MessageSquare,
  Star,
  ChevronDown,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  Rocket,
  Zap,
  Filter,
  Search,
} from 'lucide-react'

interface Contenido {
  id: string
  agente: string
  tipo: string
  categoria: string
  titulo: string
  contenido: string
  contenido_json: Record<string, unknown> | null
  plataforma_target: string | null
  optimizado_para: string | null
  estado: 'generado' | 'publicado' | 'descartado'
  publicado_en: string | null
  created_at: string
}

interface Stats {
  total: number
  por_tipo: Record<string, number>
  por_categoria: Record<string, number>
  por_estado: Record<string, number>
  voz_total: number
}

interface Cliente {
  id: string
  nombre: string
  negocio: string
}

const TIPO_CONFIG: Record<string, { label: string; icon: typeof Mic; color: string }> = {
  faq_voz: { label: 'FAQ Voz', icon: Mic, color: 'bg-purple-100 text-purple-800' },
  chunk: { label: 'Chunk Citable', icon: FileText, color: 'bg-cyan-100 text-cyan-800' },
  tldr: { label: 'TL;DR Entidad', icon: BookOpen, color: 'bg-rose-100 text-rose-800' },
  schema_jsonld: { label: 'Schema JSON-LD', icon: Code, color: 'bg-indigo-100 text-indigo-800' },
  post_gbp: { label: 'Post GBP', icon: Star, color: 'bg-green-100 text-green-800' },
  respuesta_resena: { label: 'Respuesta Reseña', icon: MessageSquare, color: 'bg-amber-100 text-amber-800' },
}

const PLATAFORMA_EMOJI: Record<string, string> = {
  gemini: '🤖 Gemini',
  chatgpt: '💬 ChatGPT',
  siri: '🍎 Siri',
  alexa: '📢 Alexa',
  google: '🔍 Google',
  google_maps: '📍 Maps',
  web: '🌐 Web',
}

export default function ContenidoPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState('')
  const [contenidos, setContenidos] = useState<Contenido[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [pipelineLoading, setPipelineLoading] = useState(false)
  const [pipelineResult, setPipelineResult] = useState<string | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Cargar clientes
  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data ?? []
        setClientes(list)
        if (list.length > 0 && !clienteId) setClienteId(list[0].id)
      })
      .catch(console.error)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = useCallback(async () => {
    if (!clienteId) return
    setLoading(true)
    try {
      const catParam = filtroCategoria ? `&categoria=${filtroCategoria}` : ''
      const [contRes, statsRes] = await Promise.all([
        fetch(`/api/contenido?clienteId=${clienteId}${catParam}`),
        fetch(`/api/contenido?clienteId=${clienteId}&stats=true`),
      ])
      const contData = await contRes.json()
      const statsData = await statsRes.json()
      setContenidos(Array.isArray(contData) ? contData : [])
      setStats(statsData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [clienteId, filtroCategoria])

  useEffect(() => {
    if (clienteId) loadData()
  }, [clienteId, filtroCategoria, loadData])

  // Ejecutar pipeline de voz
  async function handlePipelineVoz() {
    if (!clienteId) return
    setPipelineLoading(true)
    setPipelineResult(null)
    try {
      const res = await fetch('/api/agents/pipeline-voz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId }),
      })
      const data = await res.json()
      setPipelineResult(
        `✅ Pipeline completado: ${data.agentes_exitosos}/${data.agentes_total} agentes OK, ${data.tareas_generadas} tareas, $${data.coste_total?.toFixed(4)}`
      )
      // Recargar contenido
      loadData()
    } catch (e) {
      setPipelineResult(`❌ Error: ${e instanceof Error ? e.message : 'Error desconocido'}`)
    } finally {
      setPipelineLoading(false)
    }
  }

  // Copiar contenido
  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Marcar como publicado
  async function handlePublicar(contenidoId: string, donde: string) {
    await fetch('/api/contenido', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenidoId, publicadoEn: donde }),
    })
    loadData()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-accent" />
            Librería de Contenido
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Todo el contenido generado por los agentes, listo para publicar
          </p>
        </div>
        <button onClick={loadData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-medium transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filtros + Pipeline */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <select value={clienteId} onChange={e => setClienteId(e.target.value)}
            className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20">
            {clientes.map(c => <option key={c.id} value={c.id}>{c.negocio}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
            className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20">
            <option value="">Todas las categorías</option>
            <option value="voz">🎤 Optimización de voz</option>
            <option value="geo_aeo">🌐 GEO/AEO</option>
            <option value="map_pack">📍 Map Pack</option>
          </select>
          <Filter className="absolute right-2.5 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>

        <div className="flex-1" />

        {/* BOTÓN PIPELINE DE VOZ */}
        <button
          onClick={handlePipelineVoz}
          disabled={pipelineLoading || !clienteId}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-200"
        >
          {pipelineLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Pipeline en ejecución...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              🎤 Pipeline de Voz
            </>
          )}
        </button>
      </div>

      {/* Pipeline result */}
      {pipelineResult && (
        <div className={`rounded-xl p-4 text-sm font-medium ${
          pipelineResult.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {pipelineResult}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={<BookOpen className="w-5 h-5 text-accent" />} label="Total contenidos" value={stats.total} />
          <StatCard icon={<Mic className="w-5 h-5 text-purple-500" />} label="Optimiz. voz" value={stats.voz_total} highlight />
          <StatCard icon={<Zap className="w-5 h-5 text-green-500" />} label="Generados" value={stats.por_estado?.generado ?? 0} />
          <StatCard icon={<Check className="w-5 h-5 text-blue-500" />} label="Publicados" value={stats.por_estado?.publicado ?? 0} />
          <StatCard icon={<Search className="w-5 h-5 text-amber-500" />} label="Tipos distintos" value={Object.keys(stats.por_tipo).length} />
        </div>
      )}

      {/* Content list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : contenidos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <Mic className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">No hay contenido generado aún.</p>
          <p className="text-neutral-400 text-xs mt-1">
            Ejecuta el <strong>Pipeline de Voz</strong> para generar FAQs, chunks y schemas optimizados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contenidos.map(item => {
            const tipoConf = TIPO_CONFIG[item.tipo] ?? { label: item.tipo, icon: FileText, color: 'bg-neutral-100 text-neutral-800' }
            const TipoIcon = tipoConf.icon
            const isExpanded = expandedId === item.id
            const plataforma = PLATAFORMA_EMOJI[item.plataforma_target ?? ''] ?? item.plataforma_target

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${tipoConf.color}`}>
                    <TipoIcon className="w-3.5 h-3.5" />
                    {tipoConf.label}
                  </span>

                  <span className="flex-1 text-sm text-neutral-700 truncate">{item.titulo}</span>

                  {plataforma && (
                    <span className="text-xs text-neutral-400 hidden md:inline">{plataforma}</span>
                  )}

                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.estado === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {item.estado === 'publicado' ? '✅ Publicado' : 'Generado'}
                  </span>

                  <span className="text-xs text-neutral-400">
                    {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>

                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-neutral-100 p-5 space-y-4">
                    {/* Contenido completo */}
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <pre className="text-sm text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {item.contenido}
                      </pre>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCopy(item.id, item.contenido)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === item.id ? 'Copiado' : 'Copiar'}
                      </button>

                      {item.estado !== 'publicado' && (
                        <>
                          <button onClick={() => handlePublicar(item.id, 'web')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors">
                            🌐 Marcar publicado en web
                          </button>
                          <button onClick={() => handlePublicar(item.id, 'gbp')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors">
                            📍 Marcar publicado en GBP
                          </button>
                        </>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex gap-4 text-xs text-neutral-400">
                      <span>Agente: {item.agente}</span>
                      {item.optimizado_para && <span>Optimizado: {item.optimizado_para}</span>}
                      {item.publicado_en && <span>Publicado en: {item.publicado_en}</span>}
                    </div>
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

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? 'bg-purple-50 border-purple-200' : 'bg-white border-neutral-200'}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <p className={`text-xl font-bold ${highlight ? 'text-purple-700' : 'text-neutral-900'}`}>{value}</p>
    </div>
  )
}
