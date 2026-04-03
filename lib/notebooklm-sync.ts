import 'server-only'
import { supabaseAdmin } from './supabase-admin'
import type { Cliente } from '@/types'
import type { ContenidoGenerado } from './content-library'

// ══════════════════════════════════════════════════════════════
// NOTEBOOKLM SYNC — Sincronización bidireccional
//
// Push: Formatea resultados de agentes para enviar a NotebookLM
// Pull: Procesa conocimiento extraído de notebooks para actualizar
//       la base de conocimiento de los agentes
//
// NOTA: Las llamadas MCP a NotebookLM solo funcionan desde
// Claude Code (no desde la app en Vercel). Este módulo prepara
// los datos; el push/pull real se ejecuta desde Claude Code.
// ══════════════════════════════════════════════════════════════

// IDs de notebooks de NotebookLM
export const NOTEBOOK_IDS = {
  // Notebook exclusivo para hallazgos de agentes
  agentFindings: '9eea68f2-803c-4927-9617-51ed2c39648b',
  // Notebooks fuente de conocimiento
  sources: {
    geminiMaps: 'ccc832f6',
    mapsPositioner: 'cbde6078',
    aeo: 'b77f2478',
    radarLocalDocs: '4b2ceab7',
    dominioMapsIA: '5d3a2ad0',
    googleMapsPlatform: '85f4b2c5',
    planAEO: '544db77d',
    seoLocal: 'e5157820',
    bing: '8673eb2b',
  },
} as const

// ── Tipos ────────────────────────────────────────────────────

export interface SyncRecord {
  id: string
  cliente_id: string
  direction: 'push' | 'pull'
  status: 'pending' | 'synced' | 'error'
  notebook_id: string
  content_summary: string
  content_ids: string[] // IDs de contenido_generado incluidos
  synced_at: string | null
  created_at: string
  error_message: string | null
}

// ── PUSH: Formatear resultados de agentes ────────────────────

/**
 * Formatea el contenido generado de un cliente para push a NotebookLM.
 * Agrupa por tipo y genera un documento markdown legible.
 */
export function formatContentForNotebook(
  cliente: Cliente,
  contenidos: ContenidoGenerado[]
): string {
  const ahora = new Date().toISOString().split('T')[0]
  const lines: string[] = []

  lines.push(`# Hallazgos de Agentes — ${cliente.negocio}`)
  lines.push(`> Generado automáticamente por Radar Local el ${ahora}`)
  lines.push(``)

  // Agrupar por agente
  const porAgente = new Map<string, ContenidoGenerado[]>()
  contenidos.forEach(c => {
    const list = porAgente.get(c.agente) || []
    list.push(c)
    porAgente.set(c.agente, list)
  })

  const agentNames: Record<string, string> = {
    auditor_gbp: 'Auditor GBP',
    optimizador_nap: 'Optimizador NAP',
    keywords_locales: 'Keywords Locales',
    gestor_resenas: 'Gestor de Reseñas',
    redactor_posts_gbp: 'Redactor Posts GBP',
    generador_schema: 'Generador Schema',
    creador_faq_geo: 'Creador FAQ GEO',
    generador_chunks: 'Generador Chunks',
    tldr_entidad: 'TL;DR de Entidad',
    monitor_ias: 'Monitor de IAs',
    generador_reporte: 'Generador de Reporte',
  }

  porAgente.forEach((items, agente) => {
    lines.push(`## ${agentNames[agente] || agente}`)
    lines.push(``)

    items.forEach(item => {
      lines.push(`### ${item.titulo}`)
      lines.push(`- **Tipo**: ${item.tipo} | **Categoría**: ${item.categoria}`)
      if (item.plataforma_target) lines.push(`- **Plataforma**: ${item.plataforma_target}`)
      if (item.score_calidad) lines.push(`- **Score calidad**: ${item.score_calidad}/100`)
      lines.push(`- **Estado**: ${item.estado}`)
      lines.push(``)
      lines.push(item.contenido)
      lines.push(``)
    })
  })

  lines.push(`---`)
  lines.push(`Total: ${contenidos.length} piezas de contenido de ${porAgente.size} agentes`)

  return lines.join('\n')
}

/**
 * Obtiene contenido pendiente de sincronizar para un cliente.
 * Devuelve contenido generado que aún no se ha enviado a NotebookLM.
 */
export async function getPendingSyncContent(
  clienteId: string
): Promise<ContenidoGenerado[]> {
  if (!supabaseAdmin) return []

  // Obtener IDs ya sincronizados
  const { data: syncedRecords } = await supabaseAdmin
    .from('notebooklm_sync')
    .select('content_ids')
    .eq('cliente_id', clienteId)
    .eq('direction', 'push')
    .eq('status', 'synced')

  const syncedIds = new Set<string>()
  syncedRecords?.forEach(r => {
    const ids = r.content_ids as string[]
    ids?.forEach(id => syncedIds.add(id))
  })

  // Obtener todo el contenido generado (no descartado)
  const { data: contenido } = await supabaseAdmin
    .from('contenido_generado')
    .select('*')
    .eq('cliente_id', clienteId)
    .neq('estado', 'descartado')
    .order('created_at', { ascending: false })

  if (!contenido) return []

  // Filtrar los que ya están sincronizados
  return (contenido as ContenidoGenerado[]).filter(c => !syncedIds.has(c.id))
}

/**
 * Registra un push exitoso en la tabla de sync.
 */
export async function recordPushSync(
  clienteId: string,
  contentIds: string[],
  summary: string
): Promise<boolean> {
  if (!supabaseAdmin) return false

  const { error } = await supabaseAdmin
    .from('notebooklm_sync')
    .insert({
      cliente_id: clienteId,
      direction: 'push',
      status: 'synced',
      notebook_id: NOTEBOOK_IDS.agentFindings,
      content_summary: summary,
      content_ids: contentIds,
      synced_at: new Date().toISOString(),
    })

  if (error) {
    console.error('[notebooklm-sync] Error registrando push:', error)
    return false
  }

  return true
}

// ── PULL: Preparar actualización de conocimiento ─────────────

/**
 * Registra un pull exitoso (conocimiento actualizado desde notebooks).
 */
export async function recordPullSync(
  summary: string,
  sourceNotebooks: string[]
): Promise<boolean> {
  if (!supabaseAdmin) return false

  const { error } = await supabaseAdmin
    .from('notebooklm_sync')
    .insert({
      cliente_id: null,
      direction: 'pull',
      status: 'synced',
      notebook_id: sourceNotebooks.join(','),
      content_summary: summary,
      content_ids: [],
      synced_at: new Date().toISOString(),
    })

  if (error) {
    console.error('[notebooklm-sync] Error registrando pull:', error)
    return false
  }

  return true
}

// ── Estado de sincronización ─────────────────────────────────

export async function getSyncStatus(clienteId?: string): Promise<{
  lastPush: SyncRecord | null
  lastPull: SyncRecord | null
  pendingCount: number
}> {
  if (!supabaseAdmin) {
    return { lastPush: null, lastPull: null, pendingCount: 0 }
  }

  const pushQuery = supabaseAdmin
    .from('notebooklm_sync')
    .select('*')
    .eq('direction', 'push')
    .eq('status', 'synced')
    .order('synced_at', { ascending: false })
    .limit(1)

  if (clienteId) pushQuery.eq('cliente_id', clienteId)

  const pullQuery = supabaseAdmin
    .from('notebooklm_sync')
    .select('*')
    .eq('direction', 'pull')
    .eq('status', 'synced')
    .order('synced_at', { ascending: false })
    .limit(1)

  const [pushRes, pullRes] = await Promise.all([pushQuery, pullQuery])

  // Contar contenido pendiente de sync
  let pendingCount = 0
  if (clienteId) {
    const pending = await getPendingSyncContent(clienteId)
    pendingCount = pending.length
  }

  return {
    lastPush: (pushRes.data?.[0] as SyncRecord) ?? null,
    lastPull: (pullRes.data?.[0] as SyncRecord) ?? null,
    pendingCount,
  }
}
