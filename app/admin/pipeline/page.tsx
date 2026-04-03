'use client'

// ─────────────────────────────────────────────────────────
// Pipeline CRM — Vista Kanban (compacta con hover)
// ─────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  Users,
  Phone,
  FileText,
  Handshake,
  CheckCircle2,
  Pause,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Mail,
  MapPin,
  RefreshCw,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import type { Cliente, EstadoCliente } from '@/types'
import { ESTADO_LABELS, ESTADO_COLORS, PIPELINE_ORDER } from '@/types'

const ESTADO_ICONS: Record<EstadoCliente, React.ElementType> = {
  lead: Users,
  contactado: Phone,
  llamada_info: Phone,
  propuesta_enviada: FileText,
  negociando: Handshake,
  llamada_onboarding: Phone,
  activo: CheckCircle2,
  pausado: Pause,
  eliminado: XCircle,
}

function emptyBoard(): Record<EstadoCliente, Cliente[]> {
  return {
    lead: [], contactado: [], llamada_info: [], propuesta_enviada: [],
    negociando: [], llamada_onboarding: [], activo: [], pausado: [], eliminado: [],
  }
}

export default function PipelinePage() {
  const [clients, setClients] = useState<Record<EstadoCliente, Cliente[]>>(emptyBoard)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const hasFetched = useRef(false)

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients?_=' + Date.now())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Cliente[] = await res.json()

      const grouped = emptyBoard()
      for (const c of data) {
        const estado = c.estado as EstadoCliente
        if (grouped[estado]) {
          grouped[estado].push(c)
        } else {
          grouped.lead.push(c)
        }
      }
      setClients(grouped)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function moveClient(clientId: string, direction: 'next' | 'prev') {
    let currentEstado: EstadoCliente | null = null
    let currentClient: Cliente | null = null

    for (const estado of PIPELINE_ORDER) {
      const found = clients[estado].find(c => c.id === clientId)
      if (found) {
        currentClient = found
        currentEstado = estado
        break
      }
    }

    if (!currentClient || !currentEstado) return

    const currentIndex = PIPELINE_ORDER.indexOf(currentEstado)
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1

    if (newIndex < 0 || newIndex >= PIPELINE_ORDER.length) return

    const newEstado = PIPELINE_ORDER[newIndex]
    setUpdating(clientId)
    setError(null)

    // Optimistic update
    setClients(prev => {
      const updated = { ...prev }
      updated[currentEstado!] = prev[currentEstado!].filter(c => c.id !== clientId)
      updated[newEstado] = [...prev[newEstado], { ...currentClient!, estado: newEstado }]
      return updated
    })

    try {
      const res = await fetch(`/api/clients/${clientId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newEstado }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(`Error: ${data.error || 'Error del servidor'}`)
        // Revert
        setClients(prev => {
          const reverted = { ...prev }
          reverted[newEstado] = prev[newEstado].filter(c => c.id !== clientId)
          reverted[currentEstado!] = [...prev[currentEstado!], currentClient!]
          return reverted
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de conexión'
      setError(msg)
      setClients(prev => {
        const reverted = { ...prev }
        reverted[newEstado] = prev[newEstado].filter(c => c.id !== clientId)
        reverted[currentEstado!] = [...prev[currentEstado!], currentClient!]
        return reverted
      })
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  const visibleStates: EstadoCliente[] = ['lead', 'contactado', 'llamada_info', 'propuesta_enviada', 'negociando', 'llamada_onboarding', 'activo']
  if (clients.pausado.length > 0) visibleStates.push('pausado')
  if (clients.eliminado.length > 0) visibleStates.push('eliminado')

  const totalClients = PIPELINE_ORDER.reduce((sum, s) => sum + clients[s].length, 0)

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Pipeline CRM</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {totalClients} {totalClients === 1 ? 'contacto' : 'contactos'} en el pipeline
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchClients() }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-primary border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs ml-4">✕</button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {visibleStates.map((estado) => {
          const Icon = ESTADO_ICONS[estado]
          const colors = ESTADO_COLORS[estado]
          const count = clients[estado].length

          return (
            <div
              key={estado}
              className="flex-shrink-0 w-56 bg-neutral-50 rounded-xl border border-neutral-100"
            >
              {/* Column header */}
              <div className="px-3 py-2.5 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <h3 className="font-semibold text-xs text-primary">
                      {ESTADO_LABELS[estado]}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                    {count}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-220px)] overflow-y-auto">
                {count === 0 ? (
                  <div className="text-center py-6">
                    <Icon className="w-6 h-6 text-neutral-300 mx-auto mb-1" />
                    <p className="text-[10px] text-neutral-400">Sin contactos</p>
                  </div>
                ) : (
                  clients[estado].map((client) => {
                    const stateIndex = PIPELINE_ORDER.indexOf(estado)
                    const canGoNext = stateIndex < PIPELINE_ORDER.length - 1
                    const canGoPrev = stateIndex > 0
                    const isUpdating = updating === client.id
                    const isHovered = hoveredCard === client.id

                    return (
                      <div
                        key={client.id}
                        onMouseEnter={() => setHoveredCard(client.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className={`bg-white rounded-lg border border-neutral-100 shadow-sm transition-all duration-200 ${
                          isHovered ? 'shadow-md border-accent/30 scale-[1.02]' : ''
                        }`}
                      >
                        {/* Clickable area → ficha del cliente */}
                        <Link
                          href={`/admin/clientes/${client.id}`}
                          className="block px-3 py-2 cursor-pointer hover:bg-neutral-50/50 rounded-t-lg transition-colors"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-medium text-xs text-primary truncate">
                              {client.negocio || client.nombre || 'Sin nombre'}
                            </h4>
                            {isHovered && (
                              <ExternalLink className="w-3 h-3 text-accent shrink-0" />
                            )}
                          </div>
                          {client.nombre && client.negocio && (
                            <p className="text-[10px] text-neutral-400 truncate">{client.nombre}</p>
                          )}
                        </Link>

                        {/* Expanded details - only on hover */}
                        <div className={`overflow-hidden transition-all duration-200 ${
                          isHovered ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="px-3 pb-2 space-y-1.5">
                            {/* Contact info */}
                            {client.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span className="text-[10px] text-neutral-500 truncate">{client.email}</span>
                              </div>
                            )}
                            {client.direccion && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span className="text-[10px] text-neutral-500 truncate">{client.direccion}</span>
                              </div>
                            )}

                            {/* Pack badge */}
                            {client.pack && (
                              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                                {client.pack === 'autoridad_maps_ia'
                                  ? 'Autoridad Maps + IA'
                                  : 'Visibilidad Local'}
                              </span>
                            )}

                            {/* Move buttons */}
                            <div className="flex items-center gap-1.5 pt-1.5 border-t border-neutral-100">
                              <button
                                onClick={(e) => { e.stopPropagation(); moveClient(client.id, 'prev') }}
                                disabled={!canGoPrev || isUpdating}
                                className="flex-1 flex items-center justify-center gap-0.5 py-1.5 rounded text-[10px] font-medium text-neutral-500 bg-neutral-50 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft className="w-3 h-3" />
                                Atrás
                              </button>

                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 text-accent animate-spin shrink-0" />
                              ) : null}

                              <button
                                onClick={(e) => { e.stopPropagation(); moveClient(client.id, 'next') }}
                                disabled={!canGoNext || isUpdating}
                                className="flex-1 flex items-center justify-center gap-0.5 py-1.5 rounded text-[10px] font-medium text-white bg-accent hover:bg-accent/90 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              >
                                Avanzar
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
