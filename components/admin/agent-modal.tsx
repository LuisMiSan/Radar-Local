'use client'

import { useState, useEffect } from 'react'
import { X, Play, Loader2, CheckCircle2, AlertCircle, ChevronDown, RotateCcw } from 'lucide-react'
import type { AgentConfig, AgentResult } from '@/lib/agents/types'
import type { Cliente } from '@/types'
import AgentReport from './agent-report'

interface AgentModalProps {
  agent: AgentConfig
  clients: Cliente[]
  onClose: () => void
}

export default function AgentModal({ agent, clients, onClose }: AgentModalProps) {
  const [clienteId, setClienteId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AgentResult | null>(null)

  // Filtrar clientes compatibles con el pack del agente
  const compatibleClients = clients.filter(
    (c) => c.pack && agent.packs.includes(c.pack)
  )

  // Cerrar con Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [loading, onClose])

  async function handleExecute() {
    if (!clienteId) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId }),
        cache: 'no-store',
      })
      const data = await res.json()

      if (!res.ok && !data.agente) {
        setError(data.error ?? 'Error desconocido')
        return
      }

      setResult(data as AgentResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${result ? 'max-w-3xl' : 'max-w-lg'} transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{agent.nombre}</h2>
            <p className="text-sm text-neutral-500 mt-0.5">{agent.descripcion}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {/* Skills del agente */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Qué hace este agente
            </h4>
            <ul className="text-sm text-neutral-700 space-y-1">
              {getAgentCapabilities(agent.id).map((cap, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Selector de cliente */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Selecciona un cliente
            </label>
            {compatibleClients.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-sm text-amber-700">
                  No hay clientes con pack compatible
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Este agente requiere: {agent.packs.map(p =>
                    p === 'visibilidad_local' ? 'Visibilidad Local' : 'Autoridad Maps + IA'
                  ).join(' o ')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {compatibleClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setClienteId(c.id)}
                    disabled={loading}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      clienteId === c.id
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{c.negocio}</p>
                        <p className="text-xs text-neutral-500">{c.nombre} — {c.pack === 'visibilidad_local' ? 'Visibilidad Local' : 'Autoridad Maps + IA'}</p>
                      </div>
                      {clienteId === c.id && (
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón ejecutar */}
          <button
            onClick={handleExecute}
            disabled={!clienteId || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Ejecutando agente con Claude...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Ejecutar {agent.nombre}
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div>
              {/* Cabecera resultado */}
              <div className={`flex items-center justify-between mb-4 p-3 rounded-xl ${
                result.estado === 'error' ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <div className="flex items-center gap-2">
                  {result.estado === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  <span className="text-sm font-medium text-neutral-800">{result.resumen}</span>
                </div>
                <button
                  onClick={() => { setResult(null); setClienteId('') }}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 px-2 py-1 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Nuevo
                </button>
              </div>

              {/* Informe visual */}
              <AgentReport result={result} />

              {/* JSON raw (colapsado) */}
              <details className="group mt-4">
                <summary className="text-xs font-medium text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors flex items-center gap-1">
                  <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                  Ver JSON completo
                </summary>
                <pre className="mt-2 bg-neutral-900 text-green-400 p-3 rounded-lg text-[10px] overflow-x-auto max-h-60">
                  {JSON.stringify(result.datos, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Capacidades por agente (descripciones legibles) ──────────

function getAgentCapabilities(agentId: string): string[] {
  const caps: Record<string, string[]> = {
    auditor_gbp: [
      'Analiza completitud del perfil GBP',
      'Evalúa categorías, fotos, descripción',
      'Da puntuación 0-100 con justificación',
      'Lista problemas y recomendaciones',
    ],
    optimizador_nap: [
      'Verifica Nombre, Dirección, Teléfono',
      'Comprueba consistencia entre directorios',
      'Detecta duplicados y errores',
      'Recomienda correcciones prioritarias',
    ],
    keywords_locales: [
      'Investiga keywords con intención local',
      'Identifica terms que activan Map Pack',
      'Clasifica por volumen e intención',
      'Sugiere keywords long-tail geo',
    ],
    gestor_resenas: [
      'Analiza sentimiento de reseñas',
      'Genera respuestas profesionales',
      'Identifica temas recurrentes',
      'Sugiere estrategia de reputación',
    ],
    redactor_posts_gbp: [
      'Crea posts optimizados para GBP',
      'Incluye CTAs y keywords locales',
      'Calendario de publicación sugerido',
      'Formatos: oferta, novedad, evento',
    ],
    generador_schema: [
      'Genera Schema JSON-LD (LocalBusiness)',
      'Incluye FAQPage, Product, Review',
      'Optimizado para rich snippets',
      'Código listo para copiar/pegar',
    ],
    creador_faq_geo: [
      'Crea FAQs optimizadas para LLMs',
      'Formato pregunta-respuesta citable',
      'Incluye entidades y datos locales',
      'Mejora presencia en IA generativa',
    ],
    generador_chunks: [
      'Genera bloques de contenido citables',
      'Optimizados para RAG de LLMs',
      'Incluye datos verificables',
      'Formato ideal para ser citado por IAs',
    ],
    tldr_entidad: [
      'Resume la entidad del negocio',
      'Formato TL;DR para LLMs',
      'Datos clave: qué, dónde, para quién',
      'Mejora comprensión por ChatGPT/Gemini',
    ],
    monitor_ias: [
      'Simula consultas a LLMs sobre el negocio',
      'Verifica si IAs recomiendan al cliente',
      'Compara con competidores',
      'Sugiere acciones para mejorar presencia',
    ],
    generador_reporte: [
      'Consolida resultados de todos los agentes',
      'Genera informe mensual completo',
      'Incluye métricas y evolución',
      'Formato profesional para enviar al cliente',
    ],
  }
  return caps[agentId] ?? ['Ejecuta análisis especializado']
}
