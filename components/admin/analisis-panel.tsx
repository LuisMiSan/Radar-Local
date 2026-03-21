'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Play, Loader2, CheckCircle2, XCircle,
  MapPin, Brain, BarChart3, ChevronDown, RotateCcw,
  Zap, Building2, Download, History, Calendar, Mail, CheckCheck
} from 'lucide-react'
import type { Cliente } from '@/types'
import type { AgentResult } from '@/lib/agents/types'
import AgentReport from './agent-report'
import { exportToPDF } from '@/lib/pdf-export'

interface AnalisisPanelProps {
  clients: Cliente[]
}

interface RunAllResponse {
  clienteId: string
  pack: string
  agentes: AgentResult[]
  reporte: AgentResult
  completados: number
  errores: number
  total: number
}

const AGENT_LABELS: Record<string, string> = {
  auditor_gbp: 'Auditor GBP',
  optimizador_nap: 'Optimizador NAP',
  keywords_locales: 'Keywords Locales',
  gestor_resenas: 'Gestor Reseñas',
  redactor_posts_gbp: 'Redactor Posts',
  generador_schema: 'Generador Schema',
  creador_faq_geo: 'FAQ GEO',
  generador_chunks: 'Chunks IA',
  tldr_entidad: 'TL;DR Entidad',
  monitor_ias: 'Monitor IAs',
  generador_reporte: 'Reporte Final',
}

interface InformeHistorial {
  id: string
  cliente_id: string
  pack: string
  puntuacion_gbp: number
  consistencia_nap: number
  total_resenas: number
  media_resenas: number
  posicion_maps: number
  presencia_ias: number
  agentes_total: number
  agentes_completados: number
  tiempo_ejecucion: number
  created_at: string
}

export default function AnalisisPanel({ clients }: AnalisisPanelProps) {
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null)
  const [, setLoading] = useState(false)
  const [phase, setPhase] = useState<'select' | 'running' | 'done'>('select')
  const [response, setResponse] = useState<RunAllResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedInformeId, setSavedInformeId] = useState<string | null>(null)
  const [historial, setHistorial] = useState<InformeHistorial[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [showHistorial, setShowHistorial] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  // Solo clientes activos con pack
  const activeClients = clients.filter((c) => c.pack && c.estado !== 'eliminado')

  // Cargar historial cuando se selecciona un cliente
  useEffect(() => {
    if (!selectedClient) {
      setHistorial([])
      return
    }
    loadHistorial(selectedClient.id)
  }, [selectedClient])

  async function loadHistorial(clienteId: string) {
    setLoadingHistorial(true)
    try {
      const res = await fetch(`/api/informes?clienteId=${clienteId}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setHistorial(data)
      }
    } catch {
      // Silenciar error — la tabla puede no existir aún
    } finally {
      setLoadingHistorial(false)
    }
  }

  // Guardar informe automáticamente
  async function saveInforme(resp: RunAllResponse, client: Cliente, time: number) {
    try {
      const res = await fetch('/api/informes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: client.id,
          pack: client.pack,
          agentes: resp.agentes,
          reporte: resp.reporte,
          completados: resp.completados,
          total: resp.total,
          tiempoEjecucion: time,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSaved(true)
        setSavedInformeId(data.id || null)
        // Recargar historial
        loadHistorial(client.id)
      }
    } catch {
      console.warn('No se pudo guardar el informe en Supabase')
    }
  }

  async function handleRunAll() {
    if (!selectedClient) return
    setLoading(true)
    setPhase('running')
    setError(null)
    setResponse(null)
    setElapsed(0)

    // Timer
    const start = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)

    try {
      const res = await fetch('/api/agents/run-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: selectedClient.id,
          pack: selectedClient.pack,
        }),
        cache: 'no-store',
      })

      const data = await res.json()

      if (!res.ok && !data.agentes) {
        setError(data.error ?? 'Error desconocido')
        setPhase('select')
      } else {
        const resp = data as RunAllResponse
        setResponse(resp)
        setPhase('done')
        // Auto-guardar en Supabase
        const finalElapsed = Math.floor((Date.now() - start) / 1000)
        saveInforme(resp, selectedClient, finalElapsed)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
      setPhase('select')
    } finally {
      clearInterval(timer)
      setLoading(false)
    }
  }

  function handleReset() {
    setSaved(false)
    setSavedInformeId(null)
    setEmailSent(false)
    setEmailError(null)
    setSelectedClient(null)
    setPhase('select')
    setResponse(null)
    setError(null)
    setExpandedAgent(null)
  }

  const packLabel = selectedClient?.pack === 'autoridad_maps_ia'
    ? 'Autoridad Maps + IA'
    : 'Visibilidad Local'

  const agentCount = selectedClient?.pack === 'autoridad_maps_ia' ? 10 : 5

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── FASE 1: Seleccionar cliente ── */}
      {phase === 'select' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Análisis completo con IA
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Selecciona un cliente y ejecutamos todos los agentes de su pack en paralelo.
              El resultado es un informe consolidado único.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid gap-3">
            {activeClients.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                  selectedClient?.id === c.id
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/20 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedClient?.id === c.id ? 'bg-accent/10' : 'bg-neutral-100'
                    }`}>
                      <Building2 className={`w-5 h-5 ${
                        selectedClient?.id === c.id ? 'text-accent' : 'text-neutral-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{c.negocio}</p>
                      <p className="text-xs text-neutral-500">{c.nombre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.pack === 'autoridad_maps_ia'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {c.pack === 'autoridad_maps_ia' ? 'Autoridad Maps + IA' : 'Visibilidad Local'}
                    </span>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {c.pack === 'autoridad_maps_ia' ? '10 agentes' : '5 agentes'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedClient && (
            <>
              <button
                onClick={handleRunAll}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Play className="w-5 h-5" />
                Ejecutar {agentCount} agentes para {selectedClient.negocio}
              </button>

              {/* ── HISTORIAL DE INFORMES ── */}
              {historial.length > 0 && (
                <div className="bg-white rounded-xl border border-neutral-200">
                  <button
                    onClick={() => setShowHistorial(!showHistorial)}
                    className="w-full flex items-center justify-between px-5 py-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-semibold text-neutral-800">
                        Historial ({historial.length} informes)
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showHistorial ? 'rotate-180' : ''}`} />
                  </button>

                  {showHistorial && (
                    <div className="border-t border-neutral-100">
                      <div className="grid grid-cols-7 gap-2 px-5 py-2 text-[10px] font-semibold text-neutral-400 uppercase">
                        <span>Fecha</span>
                        <span>GBP</span>
                        <span>NAP</span>
                        <span>Resenas</span>
                        <span>Maps</span>
                        <span>IAs</span>
                        <span>Agentes</span>
                      </div>
                      {historial.map((inf, i) => {
                        const prev = historial[i + 1] // siguiente es el anterior en tiempo
                        const gbpDiff = prev ? inf.puntuacion_gbp - prev.puntuacion_gbp : 0
                        const napDiff = prev ? inf.consistencia_nap - prev.consistencia_nap : 0

                        return (
                          <div key={inf.id} className="grid grid-cols-7 gap-2 px-5 py-2.5 border-t border-neutral-50 hover:bg-neutral-50 text-xs">
                            <span className="flex items-center gap-1 text-neutral-600">
                              <Calendar className="w-3 h-3 text-neutral-400" />
                              {new Date(inf.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className={`font-bold ${inf.puntuacion_gbp >= 60 ? 'text-green-600' : inf.puntuacion_gbp >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                {inf.puntuacion_gbp}
                              </span>
                              {gbpDiff !== 0 && (
                                <span className={`text-[10px] ${gbpDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {gbpDiff > 0 ? '+' : ''}{gbpDiff}
                                </span>
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className={`font-bold ${inf.consistencia_nap >= 60 ? 'text-green-600' : inf.consistencia_nap >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                {inf.consistencia_nap}%
                              </span>
                              {napDiff !== 0 && (
                                <span className={`text-[10px] ${napDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {napDiff > 0 ? '+' : ''}{napDiff}
                                </span>
                              )}
                            </span>
                            <span className="text-neutral-700 font-medium">{inf.total_resenas}</span>
                            <span className="text-neutral-700 font-medium">#{inf.posicion_maps || '—'}</span>
                            <span className="text-neutral-700 font-medium">{inf.presencia_ias}/4</span>
                            <span className="text-neutral-500">{inf.agentes_completados}/{inf.agentes_total}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {loadingHistorial && (
                <div className="flex items-center justify-center gap-2 py-3 text-xs text-neutral-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Cargando historial...
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── FASE 2: Ejecutando ── */}
      {phase === 'running' && selectedClient && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                  Analizando {selectedClient.negocio}
                </h2>
                <p className="text-sm text-neutral-600 mt-1">
                  Ejecutando {agentCount} agentes con Claude en paralelo...
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-mono font-bold text-amber-600">{elapsed}s</p>
                <p className="text-[10px] text-neutral-400">Tiempo transcurrido</p>
              </div>
            </div>

            {/* Barra de progreso animada */}
            <div className="mt-4 h-2 bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Lista de agentes en espera */}
          <div className="grid grid-cols-2 gap-2">
            {/* Map Pack */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-neutral-500 uppercase">Map Pack</span>
              </div>
              {['auditor_gbp', 'optimizador_nap', 'keywords_locales', 'gestor_resenas', 'redactor_posts_gbp'].map((a) => (
                <div key={a} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-neutral-100">
                  <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-xs text-neutral-600">{AGENT_LABELS[a]}</span>
                </div>
              ))}
            </div>

            {/* GEO/AEO (si aplica) */}
            {selectedClient.pack === 'autoridad_maps_ia' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold text-neutral-500 uppercase">GEO / AEO</span>
                </div>
                {['generador_schema', 'creador_faq_geo', 'generador_chunks', 'tldr_entidad', 'monitor_ias'].map((a) => (
                  <div key={a} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-neutral-100">
                    <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                    <span className="text-xs text-neutral-600">{AGENT_LABELS[a]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FASE 3: Resultados ── */}
      {phase === 'done' && response && selectedClient && (
        <div className="space-y-6">
          {/* Header resultado */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Análisis completado — {selectedClient.negocio}
                </h2>
                <p className="text-sm text-neutral-600 mt-1">
                  {packLabel} • {response.completados}/{response.total} agentes exitosos • {elapsed}s
                  {saved && (
                    <span className="inline-flex items-center gap-1 ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Guardado
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setExporting(true)
                    try {
                      await exportToPDF(reportRef.current!, {
                        filename: `radar-local-${selectedClient.negocio.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}`,
                        title: `Informe SEO Local — ${selectedClient.negocio}`,
                        subtitle: `${packLabel} • ${response.completados} agentes`,
                      }, {
                        clientName: selectedClient.negocio,
                        pack: selectedClient.pack ?? 'visibilidad_local',
                        agentes: response.agentes,
                        reporte: response.reporte,
                        completados: response.completados,
                        total: response.total,
                      })
                    } finally {
                      setExporting(false)
                    }
                  }}
                  disabled={exporting}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {exporting ? 'Generando...' : 'Descargar PDF'}
                </button>
                <button
                  onClick={async () => {
                    if (!selectedClient) return
                    setSendingEmail(true)
                    setEmailError(null)
                    try {
                      const res = await fetch('/api/email/send-report', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          clienteId: selectedClient.id,
                          informeId: savedInformeId,
                        }),
                      })
                      const data = await res.json()
                      if (!res.ok) {
                        setEmailError(data.error || 'Error al enviar')
                      } else {
                        setEmailSent(true)
                      }
                    } catch {
                      setEmailError('Error de conexión')
                    } finally {
                      setSendingEmail(false)
                    }
                  }}
                  disabled={sendingEmail || emailSent || !selectedClient?.email}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    emailSent
                      ? 'text-green-700 bg-green-50 border border-green-200'
                      : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title={!selectedClient?.email ? 'El cliente no tiene email configurado' : ''}
                >
                  {sendingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : emailSent ? (
                    <CheckCheck className="w-4 h-4" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {sendingEmail ? 'Enviando...' : emailSent ? 'Enviado' : 'Enviar por email'}
                </button>
                {emailError && (
                  <span className="text-xs text-red-500">{emailError}</span>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Nuevo
                </button>
              </div>
            </div>
          </div>

          {/* Resumen de agentes (colapsable) */}
          <div className="bg-white rounded-xl border border-neutral-200">
            <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-800">
                Resultados por agente ({response.completados} completados, {response.errores} errores)
              </h3>
            </div>

            <div className="divide-y divide-neutral-50">
              {response.agentes.map((result) => (
                <div key={result.agente} className="px-5">
                  {/* Fila resumen */}
                  <button
                    onClick={() => setExpandedAgent(expandedAgent === result.agente ? null : result.agente)}
                    className="w-full flex items-center justify-between py-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      {result.estado === 'completada' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          {AGENT_LABELS[result.agente] ?? result.agente}
                        </p>
                        <p className="text-xs text-neutral-500 truncate max-w-md">{result.resumen}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${
                      expandedAgent === result.agente ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Detalle expandido */}
                  {expandedAgent === result.agente && (
                    <div className="pb-4 pl-7">
                      <AgentReport result={result} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── INFORME CONSOLIDADO (Agente 11) ── */}
          <div ref={reportRef} className="bg-white rounded-xl border-2 border-accent/30 shadow-lg">
            <div className="px-5 py-4 border-b border-accent/10 bg-accent/5 rounded-t-xl">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Informe Consolidado — {selectedClient.negocio}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {packLabel} • {response.completados} agentes • {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="p-5">
              <AgentReport result={response.reporte} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
