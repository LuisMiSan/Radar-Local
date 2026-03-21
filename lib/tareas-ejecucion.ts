import 'server-only'
import { supabaseAdmin } from './supabase-admin'
import type { TareaEjecucion, EstadoEjecucion, Agente } from '@/types'
import type { TareaGenerada } from './agents/types'

// ══════════════════════════════════════════════════════════════
// TAREAS DE EJECUCIÓN — CRUD para el sistema de ejecución
//
// Cuando un agente audita, genera tareas ejecutables.
// Este módulo gestiona esas tareas en Supabase.
// ══════════════════════════════════════════════════════════════

// ── Guardar tareas generadas por un agente ──────────────────

export async function guardarTareasGeneradas(
  clienteId: string,
  agente: Agente,
  tareas: TareaGenerada[],
  informeId?: string
): Promise<TareaEjecucion[]> {
  if (!supabaseAdmin) {
    console.log(`[tareas-ejecucion] Sin Supabase → ${tareas.length} tareas no guardadas`)
    // Devolver las tareas como si se hubieran guardado (para desarrollo sin DB)
    return tareas.map((t, i) => ({
      id: `mock-${agente}-${i}`,
      cliente_id: clienteId,
      agente,
      informe_id: informeId ?? null,
      titulo: t.titulo,
      descripcion: t.descripcion,
      categoria: t.categoria,
      tipo: t.tipo,
      prioridad: t.prioridad,
      estado: 'pendiente' as EstadoEjecucion,
      campo_gbp: t.campo_gbp,
      valor_actual: t.valor_actual,
      valor_propuesto: t.valor_propuesto,
      accion_api: t.accion_api ?? null,
      resultado: null,
      error: null,
      aprobado_por: null,
      aprobado_en: null,
      ejecutado_en: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  }

  const rows = tareas.map((t) => ({
    cliente_id: clienteId,
    agente,
    informe_id: informeId ?? null,
    titulo: t.titulo,
    descripcion: t.descripcion,
    categoria: t.categoria,
    tipo: t.tipo,
    prioridad: t.prioridad,
    estado: 'pendiente',
    campo_gbp: t.campo_gbp,
    valor_actual: t.valor_actual,
    valor_propuesto: t.valor_propuesto,
    accion_api: t.accion_api ?? null,
  }))

  const { data, error } = await supabaseAdmin
    .from('tareas_ejecucion')
    .insert(rows)
    .select()

  if (error) {
    console.error('[tareas-ejecucion] Error al guardar:', error)
    throw new Error(`Error guardando tareas: ${error.message}`)
  }

  console.log(`[tareas-ejecucion] ${data.length} tareas guardadas para ${agente}`)
  return data as TareaEjecucion[]
}

// ── Obtener tareas de un cliente ────────────────────────────

export async function obtenerTareas(
  clienteId: string,
  filtros?: {
    agente?: Agente
    estado?: EstadoEjecucion
    tipo?: 'auto' | 'revision' | 'manual'
  }
): Promise<TareaEjecucion[]> {
  if (!supabaseAdmin) {
    console.log('[tareas-ejecucion] Sin Supabase → devolviendo array vacío')
    return []
  }

  let query = supabaseAdmin
    .from('tareas_ejecucion')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('prioridad', { ascending: true })   // critica primero
    .order('created_at', { ascending: false })

  if (filtros?.agente) query = query.eq('agente', filtros.agente)
  if (filtros?.estado) query = query.eq('estado', filtros.estado)
  if (filtros?.tipo) query = query.eq('tipo', filtros.tipo)

  const { data, error } = await query

  if (error) {
    console.error('[tareas-ejecucion] Error al obtener:', error)
    return []
  }

  return data as TareaEjecucion[]
}

// ── Obtener tareas pendientes de aprobación ─────────────────

export async function obtenerTareasPendientesAprobacion(
  clienteId?: string
): Promise<TareaEjecucion[]> {
  if (!supabaseAdmin) return []

  let query = supabaseAdmin
    .from('tareas_ejecucion')
    .select('*')
    .eq('estado', 'pendiente')
    .eq('tipo', 'revision')
    .order('prioridad', { ascending: true })
    .order('created_at', { ascending: false })

  if (clienteId) query = query.eq('cliente_id', clienteId)

  const { data, error } = await query

  if (error) {
    console.error('[tareas-ejecucion] Error al obtener pendientes:', error)
    return []
  }

  return data as TareaEjecucion[]
}

// ── Aprobar una tarea (HITL) ────────────────────────────────

export async function aprobarTarea(
  tareaId: string,
  aprobadoPor: string = 'admin'
): Promise<TareaEjecucion | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('tareas_ejecucion')
    .update({
      estado: 'aprobada',
      aprobado_por: aprobadoPor,
      aprobado_en: new Date().toISOString(),
    })
    .eq('id', tareaId)
    .select()
    .single()

  if (error) {
    console.error('[tareas-ejecucion] Error al aprobar:', error)
    return null
  }

  console.log(`[tareas-ejecucion] Tarea ${tareaId} aprobada por ${aprobadoPor}`)
  return data as TareaEjecucion
}

// ── Rechazar una tarea ──────────────────────────────────────

export async function rechazarTarea(
  tareaId: string,
  motivo?: string
): Promise<TareaEjecucion | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('tareas_ejecucion')
    .update({
      estado: 'rechazada',
      resultado: motivo ?? 'Rechazada por el admin',
    })
    .eq('id', tareaId)
    .select()
    .single()

  if (error) {
    console.error('[tareas-ejecucion] Error al rechazar:', error)
    return null
  }

  return data as TareaEjecucion
}

// ── Marcar tarea como ejecutando ────────────────────────────

export async function marcarEjecutando(
  tareaId: string
): Promise<TareaEjecucion | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('tareas_ejecucion')
    .update({ estado: 'ejecutando' })
    .eq('id', tareaId)
    .select()
    .single()

  if (error) {
    console.error('[tareas-ejecucion] Error al marcar ejecutando:', error)
    return null
  }

  return data as TareaEjecucion
}

// ── Completar una tarea ─────────────────────────────────────

export async function completarTarea(
  tareaId: string,
  resultado: string
): Promise<TareaEjecucion | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('tareas_ejecucion')
    .update({
      estado: 'completada',
      resultado,
      ejecutado_en: new Date().toISOString(),
    })
    .eq('id', tareaId)
    .select()
    .single()

  if (error) {
    console.error('[tareas-ejecucion] Error al completar:', error)
    return null
  }

  console.log(`[tareas-ejecucion] Tarea ${tareaId} completada: ${resultado}`)
  return data as TareaEjecucion
}

// ── Marcar tarea como fallida ───────────────────────────────

export async function fallarTarea(
  tareaId: string,
  errorMsg: string
): Promise<TareaEjecucion | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('tareas_ejecucion')
    .update({
      estado: 'fallo',
      error: errorMsg,
      ejecutado_en: new Date().toISOString(),
    })
    .eq('id', tareaId)
    .select()
    .single()

  if (error) {
    console.error('[tareas-ejecucion] Error al marcar fallo:', error)
    return null
  }

  return data as TareaEjecucion
}

// ── Resumen de progreso por cliente ─────────────────────────

export async function obtenerResumenProgreso(
  clienteId: string
): Promise<{
  total: number
  completadas: number
  pendientes: number
  esperando_aprobacion: number
  en_ejecucion: number
  fallidas: number
  porcentaje: number
}> {
  if (!supabaseAdmin) {
    return { total: 0, completadas: 0, pendientes: 0, esperando_aprobacion: 0, en_ejecucion: 0, fallidas: 0, porcentaje: 0 }
  }

  const { data, error } = await supabaseAdmin
    .from('tareas_ejecucion')
    .select('estado, tipo')
    .eq('cliente_id', clienteId)

  if (error || !data) {
    return { total: 0, completadas: 0, pendientes: 0, esperando_aprobacion: 0, en_ejecucion: 0, fallidas: 0, porcentaje: 0 }
  }

  const total = data.length
  const completadas = data.filter((t) => t.estado === 'completada').length
  const pendientes = data.filter((t) => t.estado === 'pendiente').length
  const esperando_aprobacion = data.filter((t) => t.estado === 'pendiente' && t.tipo === 'revision').length
  const en_ejecucion = data.filter((t) => t.estado === 'ejecutando').length
  const fallidas = data.filter((t) => t.estado === 'fallo').length
  const activas = data.filter((t) => t.estado !== 'rechazada' && t.estado !== 'omitida').length
  const porcentaje = activas > 0 ? Math.round((completadas / activas) * 100) : 0

  return { total, completadas, pendientes, esperando_aprobacion, en_ejecucion, fallidas, porcentaje }
}
