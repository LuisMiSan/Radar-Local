import 'server-only'
import { supabaseAdmin } from './supabase-admin'
import type { Agente } from '@/types'
import type { AgentResult } from './agents/types'

// ══════════════════════════════════════════════════════════════
// MEMORIA DE AGENTES — Dar contexto histórico a cada ejecución
//
// Cada agente recuerda:
// - Qué recomendó la última vez
// - Si sus tareas se completaron
// - Cómo cambió el perfil después de sus acciones
// - Qué NO debe repetir
// ══════════════════════════════════════════════════════════════

export interface AgentMemoryEntry {
  id: string
  cliente_id: string
  agente: string
  fecha: string
  score_gbp_al_ejecutar: number | null
  rating_al_ejecutar: number | null
  resenas_al_ejecutar: number | null
  fotos_al_ejecutar: number | null
  resumen: string
  decisiones_clave: string[]
  tareas_generadas: number
  tareas_auto: number
  tareas_revision: number
  tareas_manual: number
  impacto_score_delta: number | null
  impacto_resenas_delta: number | null
  impacto_fotos_delta: number | null
  impacto_evaluado: boolean
  tokens_input: number
  tokens_output: number
  coste_usd: number
  snapshot_id: string | null
  resultado_completo: Record<string, unknown> | null
  created_at: string
}

export interface MemoryContext {
  ejecuciones_previas: AgentMemoryEntry[]
  tareas_pendientes_count: number
  tareas_completadas_count: number
  resumen_impacto: string | null
}

// ── Cargar memoria de un agente para un cliente ───────────────

export async function loadAgentMemory(
  clienteId: string,
  agente: Agente,
  limit: number = 5
): Promise<MemoryContext> {
  const empty: MemoryContext = {
    ejecuciones_previas: [],
    tareas_pendientes_count: 0,
    tareas_completadas_count: 0,
    resumen_impacto: null,
  }

  if (!supabaseAdmin) return empty

  // 1. Últimas N ejecuciones de este agente para este cliente
  const { data: memorias, error: memError } = await supabaseAdmin
    .from('agent_memory')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('agente', agente)
    .order('fecha', { ascending: false })
    .limit(limit)

  if (memError) {
    console.error(`[agent-memory] Error cargando memoria de ${agente}:`, memError)
    return empty
  }

  // 2. Tareas pendientes de este agente para este cliente
  const { count: pendientes } = await supabaseAdmin
    .from('tareas_ejecucion')
    .select('*', { count: 'exact', head: true })
    .eq('cliente_id', clienteId)
    .eq('agente', agente)
    .in('estado', ['pendiente', 'aprobada', 'ejecutando'])

  // 3. Tareas completadas de este agente
  const { count: completadas } = await supabaseAdmin
    .from('tareas_ejecucion')
    .select('*', { count: 'exact', head: true })
    .eq('cliente_id', clienteId)
    .eq('agente', agente)
    .eq('estado', 'completada')

  // 4. Calcular resumen de impacto si hay datos
  let resumenImpacto: string | null = null
  const entries = (memorias ?? []) as AgentMemoryEntry[]
  const conImpacto = entries.filter(m => m.impacto_evaluado && m.impacto_score_delta !== null)

  if (conImpacto.length > 0) {
    const totalDelta = conImpacto.reduce((sum, m) => sum + (m.impacto_score_delta ?? 0), 0)
    const avgDelta = Math.round((totalDelta / conImpacto.length) * 10) / 10
    resumenImpacto = avgDelta > 0
      ? `Tus acciones previas han generado un impacto promedio de +${avgDelta} puntos en el score.`
      : avgDelta < 0
        ? `Atención: el score bajó ${avgDelta} puntos de media tras tus acciones. Revisa tu estrategia.`
        : 'Tus acciones previas no han tenido impacto medible en el score aún.'
  }

  return {
    ejecuciones_previas: entries,
    tareas_pendientes_count: pendientes ?? 0,
    tareas_completadas_count: completadas ?? 0,
    resumen_impacto: resumenImpacto,
  }
}

// ── Guardar memoria de una ejecución ──────────────────────────

export async function saveAgentMemory(
  clienteId: string,
  agente: Agente,
  result: AgentResult,
  context: {
    scoreGbp?: number | null
    rating?: number | null
    resenas?: number | null
    fotos?: number | null
    snapshotId?: string | null
  }
): Promise<string | null> {
  if (!supabaseAdmin) {
    console.log(`[agent-memory] Sin Supabase → memoria de ${agente} no guardada`)
    return null
  }

  // Extraer decisiones clave del resultado
  const decisiones = extraerDecisiones(agente, result)

  // Contar tareas por tipo
  const tareas = result.tareas ?? []
  const tareasAuto = tareas.filter(t => t.tipo === 'auto').length
  const tareasRevision = tareas.filter(t => t.tipo === 'revision').length
  const tareasManual = tareas.filter(t => t.tipo === 'manual').length

  const row = {
    cliente_id: clienteId,
    agente,
    score_gbp_al_ejecutar: context.scoreGbp ?? null,
    rating_al_ejecutar: context.rating ?? null,
    resenas_al_ejecutar: context.resenas ?? null,
    fotos_al_ejecutar: context.fotos ?? null,
    resumen: result.resumen,
    decisiones_clave: decisiones,
    tareas_generadas: tareas.length,
    tareas_auto: tareasAuto,
    tareas_revision: tareasRevision,
    tareas_manual: tareasManual,
    tokens_input: result.usage?.input_tokens ?? 0,
    tokens_output: result.usage?.output_tokens ?? 0,
    coste_usd: result.usage?.coste_total ?? 0,
    snapshot_id: context.snapshotId ?? null,
    resultado_completo: result.datos,
  }

  const { data, error } = await supabaseAdmin
    .from('agent_memory')
    .insert(row)
    .select('id')
    .single()

  if (error) {
    console.error(`[agent-memory] Error guardando memoria de ${agente}:`, error)
    return null
  }

  console.log(`[agent-memory] ✓ Memoria de ${agente} guardada (${decisiones.length} decisiones, ${tareas.length} tareas)`)
  return data.id
}

// ── Evaluar impacto de ejecuciones pasadas ─────────────────────
// Se llama después de tomar un nuevo snapshot

export async function evaluarImpacto(clienteId: string): Promise<number> {
  if (!supabaseAdmin) return 0

  // Buscar memorias sin impacto evaluado
  const { data: pendientes, error } = await supabaseAdmin
    .from('agent_memory')
    .select('id, score_gbp_al_ejecutar, resenas_al_ejecutar, fotos_al_ejecutar')
    .eq('cliente_id', clienteId)
    .eq('impacto_evaluado', false)

  if (error || !pendientes || pendientes.length === 0) return 0

  // Obtener último snapshot como referencia de "estado actual"
  const { data: snapshot } = await supabaseAdmin
    .from('snapshots_gbp')
    .select('score_gbp, resenas_count, fotos_count')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!snapshot) return 0

  let evaluadas = 0

  for (const mem of pendientes) {
    const deltaScore = mem.score_gbp_al_ejecutar !== null
      ? (snapshot.score_gbp ?? 0) - mem.score_gbp_al_ejecutar
      : null
    const deltaResenas = mem.resenas_al_ejecutar !== null
      ? (snapshot.resenas_count ?? 0) - mem.resenas_al_ejecutar
      : null
    const deltaFotos = mem.fotos_al_ejecutar !== null
      ? (snapshot.fotos_count ?? 0) - mem.fotos_al_ejecutar
      : null

    const { error: updateError } = await supabaseAdmin
      .from('agent_memory')
      .update({
        impacto_score_delta: deltaScore,
        impacto_resenas_delta: deltaResenas,
        impacto_fotos_delta: deltaFotos,
        impacto_evaluado: true,
      })
      .eq('id', mem.id)

    if (!updateError) evaluadas++
  }

  if (evaluadas > 0) {
    console.log(`[agent-memory] ✓ Impacto evaluado para ${evaluadas} ejecuciones de ${clienteId}`)
  }

  return evaluadas
}

// ── Formatear memoria como contexto para el prompt ────────────

export function formatMemoryForPrompt(memory: MemoryContext): string {
  if (memory.ejecuciones_previas.length === 0) {
    return `## Memoria del agente
Esta es tu PRIMERA ejecución para este cliente. No tienes historial previo.`
  }

  let text = `## Memoria del agente — Historial de ejecuciones previas
IMPORTANTE: Usa esta información para NO repetir recomendaciones ya hechas y para construir sobre el trabajo anterior.

`

  // Resumen de tareas
  text += `### Estado de tareas
- Tareas pendientes de ejecuciones anteriores: ${memory.tareas_pendientes_count}
- Tareas completadas: ${memory.tareas_completadas_count}
`

  // Impacto
  if (memory.resumen_impacto) {
    text += `\n### Impacto medido\n${memory.resumen_impacto}\n`
  }

  // Ejecuciones anteriores (de más reciente a más antigua)
  text += `\n### Últimas ejecuciones (${memory.ejecuciones_previas.length})\n`

  memory.ejecuciones_previas.forEach((entry, i) => {
    const fecha = new Date(entry.fecha).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
    const scoreInfo = entry.score_gbp_al_ejecutar !== null
      ? ` | Score: ${entry.score_gbp_al_ejecutar}/100`
      : ''
    const impactoInfo = entry.impacto_evaluado && entry.impacto_score_delta !== null
      ? ` → Impacto: ${entry.impacto_score_delta >= 0 ? '+' : ''}${entry.impacto_score_delta} pts`
      : ''

    text += `\n**${i + 1}. ${fecha}**${scoreInfo}${impactoInfo}
- Resumen: ${entry.resumen}
- Decisiones: ${entry.decisiones_clave.length > 0 ? entry.decisiones_clave.join(', ') : 'N/A'}
- Tareas: ${entry.tareas_generadas} generadas (${entry.tareas_auto} auto, ${entry.tareas_revision} revisión, ${entry.tareas_manual} manual)
`
  })

  text += `\n### Instrucciones de continuidad
- NO repitas recomendaciones que ya hayas hecho antes (están arriba).
- Si hay tareas pendientes, prioriza verificar su estado antes de crear nuevas.
- Si una recomendación anterior no tuvo impacto, prueba un enfoque diferente.
- Enfócate en las áreas que aún NO se han trabajado.
`

  return text
}

// ── Extraer decisiones clave del resultado de un agente ───────

function extraerDecisiones(agente: Agente, result: AgentResult): string[] {
  const datos = result.datos
  const decisiones: string[] = []

  // Extraer de las tareas generadas (más fiable)
  if (result.tareas && result.tareas.length > 0) {
    result.tareas.forEach(t => {
      if (t.prioridad === 'critica' || t.prioridad === 'alta') {
        decisiones.push(t.titulo)
      }
    })
  }

  // Extraer de datos específicos del agente
  switch (agente) {
    case 'auditor_gbp': {
      const puntuacion = datos.puntuacion as number
      if (puntuacion !== undefined) decisiones.push(`Score evaluado: ${puntuacion}/100`)
      const problemas = datos.problemas as string[]
      if (Array.isArray(problemas)) {
        problemas.slice(0, 3).forEach(p => decisiones.push(`Problema: ${typeof p === 'string' ? p : JSON.stringify(p)}`))
      }
      break
    }
    case 'optimizador_nap': {
      const pct = datos.consistencia_pct as number
      if (pct !== undefined) decisiones.push(`NAP consistencia: ${pct}%`)
      break
    }
    case 'keywords_locales': {
      const kws = datos.keywords as unknown[]
      if (Array.isArray(kws)) decisiones.push(`${kws.length} keywords identificadas`)
      break
    }
    case 'gestor_resenas': {
      const total = datos.total as number
      if (total !== undefined) decisiones.push(`${total} reseñas analizadas`)
      break
    }
    case 'redactor_posts_gbp': {
      const posts = datos.posts as unknown[]
      if (Array.isArray(posts)) decisiones.push(`${posts.length} posts redactados`)
      break
    }
    case 'generador_schema': {
      const schemas = datos.schemas as unknown[]
      if (Array.isArray(schemas)) decisiones.push(`${schemas.length} schemas JSON-LD`)
      break
    }
    default: {
      // Para agentes sin extracción específica, usar el resumen
      if (result.resumen) decisiones.push(result.resumen)
    }
  }

  // Limitar a 10 decisiones máx
  return decisiones.slice(0, 10)
}
