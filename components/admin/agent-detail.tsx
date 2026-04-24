'use client'

import { useState, useEffect } from 'react'
import {
  Play, Loader2, CheckCircle2, AlertCircle, RotateCcw,
  ChevronDown, Brain, Clock, Zap, Users,
} from 'lucide-react'
import Link from 'next/link'
import type { AgentConfig, AgentResult } from '@/lib/agents/types'
import type { Cliente } from '@/types'
import AgentReport from './agent-report'

interface AgentDetailProps {
  agent: AgentConfig
  clients: Cliente[]
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  map_pack:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  geo_aeo:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  reporte:    { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  prospector: { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200'   },
}

export default function AgentDetail({ agent, clients }: AgentDetailProps) {
  const [clienteId, setClienteId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AgentResult | null>(null)

  const colors = categoryColors[agent.categoria] ?? { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-200' }

  const compatibleClients = clients.filter(
    (c) => c.pack && agent.packs.includes(c.pack)
  )

  // Resetear al cambiar de agente
  useEffect(() => {
    setResult(null)
    setError(null)
    setClienteId('')
  }, [agent.id])

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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header del agente */}
      <div className={`px-6 py-5 border-b ${colors.border} ${colors.bg}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-lg font-semibold ${colors.text}`}>{agent.nombre}</h2>
            <p className="text-sm text-neutral-600 mt-0.5">{agent.descripcion}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {agent.packs.map((pack) => (
              <span key={pack} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors.border} ${colors.text} ${colors.bg}`}>
                {pack === 'visibilidad_local' ? 'Local' : 'Maps+IA'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cuerpo scrollable */}
      <div className="flex-1 overflow-y-auto">
        {!result ? (
          <div className="p-6 space-y-5">
            {/* Qué hace */}
            <section>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Qué hace este agente
              </h3>
              <ul className="space-y-1.5">
                {getAgentCapabilities(agent.id).map((cap, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    {cap}
                  </li>
                ))}
              </ul>
            </section>

            {/* Selector de cliente */}
            <section>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Selecciona un cliente
              </h3>

              {compatibleClients.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-amber-700">Sin clientes compatibles</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Requiere: {agent.packs.map(p => p === 'visibilidad_local' ? 'Visibilidad Local' : 'Autoridad Maps + IA').join(' o ')}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {compatibleClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setClienteId(c.id)}
                      disabled={loading}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        clienteId === c.id
                          ? 'border-neutral-800 bg-neutral-900 text-white ring-2 ring-neutral-800/20'
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${clienteId === c.id ? 'text-white' : 'text-neutral-900'}`}>
                            {c.negocio}
                          </p>
                          <p className={`text-xs mt-0.5 ${clienteId === c.id ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {c.nombre} · {c.pack === 'visibilidad_local' ? 'Visibilidad Local' : 'Autoridad Maps + IA'}
                          </p>
                        </div>
                        {clienteId === c.id && (
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Botón ejecutar */}
            <button
              onClick={handleExecute}
              disabled={!clienteId || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Ejecutando con Claude...</>
              ) : (
                <><Play className="w-4 h-4" /> Ejecutar {agent.nombre}</>
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
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Status de resultado */}
            <div className={`flex items-center justify-between p-3 rounded-xl ${
              result.estado === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-2">
                {result.estado === 'error'
                  ? <AlertCircle className="w-4 h-4 text-red-500" />
                  : <CheckCircle2 className="w-4 h-4 text-green-600" />
                }
                <span className="text-sm font-medium text-neutral-800">{result.resumen}</span>
              </div>
              <button
                onClick={() => { setResult(null); setClienteId('') }}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 px-2 py-1 rounded-lg hover:bg-white/60 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Nueva
              </button>
            </div>

            {/* Tokens */}
            {result.usage && (
              <div className="flex items-center gap-3 text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2">
                <Clock className="w-3 h-3" />
                <span>
                  {result.usage.input_tokens.toLocaleString()} in / {result.usage.output_tokens.toLocaleString()} out tokens
                  · <span className="font-medium text-neutral-700">${result.usage.coste_total.toFixed(4)}</span>
                </span>
              </div>
            )}

            {/* Informe */}
            <AgentReport result={result} />

            {/* Links */}
            <div className="flex gap-2 pt-2 border-t border-neutral-100">
              <Link
                href="/admin/historial"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-200 transition-colors"
              >
                <Brain className="w-3.5 h-3.5" /> Ver en Memoria IA
              </Link>
            </div>

            {/* JSON raw colapsado */}
            <details className="group">
              <summary className="flex items-center gap-1 text-xs text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors">
                <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                JSON completo
              </summary>
              <pre className="mt-2 bg-neutral-900 text-green-400 p-3 rounded-lg text-[10px] overflow-x-auto max-h-48">
                {JSON.stringify(result.datos, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Capacidades por agente ────────────────────────────────────

function getAgentCapabilities(agentId: string): string[] {
  const caps: Record<string, string[]> = {
    auditor_gbp:       ['Audita completitud del perfil GBP', 'Score 0-100 con justificación por categoría', 'Lista problemas y recomendaciones priorizadas', 'Evalúa categorías, fotos, descripción y horarios'],
    optimizador_nap:   ['Verifica Nombre, Dirección, Teléfono', 'Comprueba consistencia entre directorios', 'Detecta duplicados y errores de NAP', 'Recomienda correcciones prioritarias'],
    keywords_locales:  ['Investiga keywords con intención local', 'Identifica términos que activan Map Pack', 'Clasifica por volumen e intención', 'Sugiere keywords long-tail geolocalizadas'],
    gestor_resenas:    ['Analiza sentimiento de reseñas', 'Genera respuestas profesionales optimizadas', 'Identifica temas recurrentes', 'Sugiere estrategia de reputación'],
    redactor_posts_gbp:['Crea posts optimizados para GBP', 'Incluye CTAs y keywords locales', 'Propone calendario de publicación', 'Formatos: oferta, novedad y evento'],
    generador_schema:  ['Genera Schema JSON-LD (LocalBusiness)', 'Incluye FAQPage, Product y Review', 'Optimizado para rich snippets', 'Código listo para copiar/pegar'],
    creador_faq_geo:   ['Crea FAQs optimizadas para LLMs', 'Formato pregunta-respuesta citable', 'Incluye entidades y datos locales', 'Mejora presencia en IA generativa'],
    generador_chunks:  ['Genera bloques de contenido citables', 'Optimizados para RAG de LLMs', 'Incluye datos verificables', 'Formato ideal para ser citado por IAs'],
    tldr_entidad:      ['Resume la entidad del negocio', 'Formato TL;DR para LLMs', 'Datos clave: qué, dónde, para quién', 'Mejora comprensión por ChatGPT/Gemini'],
    monitor_ias:       ['Verifica presencia real en Perplexity y Bing', 'Simula consultas sobre el negocio', 'Compara visibilidad con competidores', 'Sugiere acciones para mejorar presencia IA'],
    generador_reporte: ['Consolida resultados de todos los agentes', 'Genera informe mensual completo', 'Incluye métricas y evolución', 'Formato profesional para el cliente'],
    prospector_web:    ['Analiza la web del negocio', 'Detecta oportunidades SEO técnicas', 'Evalúa velocidad y mobile-friendliness', 'Genera propuesta de demo personalizada'],
    supervisor:        ['Orquesta los 11 agentes en paralelo', 'Gestiona 4 grupos de ejecución', 'Máx. 3 llamadas simultáneas (rate limit)', 'Genera informe consolidado final'],
  }
  return caps[agentId] ?? ['Ejecuta análisis especializado']
}
