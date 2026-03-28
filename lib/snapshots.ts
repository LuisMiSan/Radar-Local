import 'server-only'
import { supabaseAdmin } from './supabase-admin'
import { searchPlace, normalizePlaceData } from './google-places'
import type { PlaceData } from './google-places'

// ════════════════════════════════════════════════════════════
// SNAPSHOTS GBP — Seguimiento diario de métricas del perfil
// ════════════════════════════════════════════════════════════

export interface SnapshotGBP {
  id: string
  cliente_id: string
  fecha: string
  nombre: string | null
  direccion: string | null
  rating: number
  resenas_count: number
  fotos_count: number
  google_maps_url: string | null
  horarios_completos: boolean
  tiene_web: boolean
  tiene_descripcion: boolean
  business_status: string | null
  score_gbp: number
  score_rating: number
  score_resenas: number
  score_fotos: number
  score_horarios: number
  score_web: number
  score_descripcion: number
  tareas_creadas: number
  tareas_completadas: number
  agentes_ejecutados: number
  informe_id: string | null
  delta_rating: number
  delta_resenas: number
  delta_fotos: number
  delta_score: number
  notas: string | null
  created_at: string
}

export interface ScoreBreakdown {
  total: number
  rating: number    // max 25
  resenas: number   // max 25
  fotos: number     // max 20
  horarios: number  // max 10
  web: number       // max 10
  descripcion: number // max 10
}

export interface ResumenEvolucion {
  dias_tracking: number
  primer_snapshot: SnapshotGBP | null
  ultimo_snapshot: SnapshotGBP | null
  delta_total_score: number
  delta_total_resenas: number
  delta_total_fotos: number
  delta_total_rating: number
  mejora_promedio_diaria: number
}

// ── Calcular desglose del score ────────────────────────────

function calculateScoreBreakdown(data: PlaceData): ScoreBreakdown {
  const rating = Math.min(25, Math.round((data.rating / 5) * 25))
  const resenas = data.resenas_count > 0
    ? Math.min(25, Math.round(Math.log10(data.resenas_count + 1) * 12.5))
    : 0
  const fotos = Math.min(20, data.fotos_count)
  const horarios = data.horarios_completos ? 10 : 0
  const web = data.tiene_web ? 10 : 0
  const descripcion = data.tiene_descripcion ? 10 : 0

  return {
    total: Math.min(100, rating + resenas + fotos + horarios + web + descripcion),
    rating, resenas, fotos, horarios, web, descripcion,
  }
}

// ── Tomar snapshot de un cliente ───────────────────────────

export async function tomarSnapshot(
  clienteId: string,
  negocio: string,
  zona: string,
  notas?: string
): Promise<SnapshotGBP | null> {
  if (!supabaseAdmin) {
    console.error('[snapshots] supabaseAdmin no disponible')
    return null
  }

  // 1. Buscar datos reales en Google Places
  const place = await searchPlace(negocio, zona)
  if (!place) {
    console.warn(`[snapshots] No se encontró "${negocio}" en Google Places`)
    return null
  }

  const placeData = normalizePlaceData(place)
  const breakdown = calculateScoreBreakdown(placeData)

  // 2. Obtener snapshot anterior para calcular deltas
  const { data: prevSnapshot } = await supabaseAdmin
    .from('snapshots_gbp')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle()

  const deltaRating = prevSnapshot ? placeData.rating - (prevSnapshot.rating ?? 0) : 0
  const deltaResenas = prevSnapshot ? placeData.resenas_count - (prevSnapshot.resenas_count ?? 0) : 0
  const deltaFotos = prevSnapshot ? placeData.fotos_count - (prevSnapshot.fotos_count ?? 0) : 0
  const deltaScore = prevSnapshot ? breakdown.total - (prevSnapshot.score_gbp ?? 0) : 0

  // 3. Contar actividad del día
  const hoy = new Date().toISOString().split('T')[0]

  const { count: tareasCreadas } = await supabaseAdmin
    .from('tareas_ejecucion')
    .select('*', { count: 'exact', head: true })
    .eq('cliente_id', clienteId)
    .gte('created_at', `${hoy}T00:00:00Z`)
    .lte('created_at', `${hoy}T23:59:59Z`)

  const { count: tareasCompletadas } = await supabaseAdmin
    .from('tareas_ejecucion')
    .select('*', { count: 'exact', head: true })
    .eq('cliente_id', clienteId)
    .eq('estado', 'completada')
    .gte('updated_at', `${hoy}T00:00:00Z`)
    .lte('updated_at', `${hoy}T23:59:59Z`)

  const { count: agentesEjecutados } = await supabaseAdmin
    .from('uso_api')
    .select('*', { count: 'exact', head: true })
    .eq('cliente_id', clienteId)
    .gte('created_at', `${hoy}T00:00:00Z`)
    .lte('created_at', `${hoy}T23:59:59Z`)

  // 4. Upsert snapshot (un registro por cliente por día)
  const row = {
    cliente_id: clienteId,
    fecha: hoy,
    nombre: placeData.nombre,
    direccion: placeData.direccion,
    rating: placeData.rating,
    resenas_count: placeData.resenas_count,
    fotos_count: placeData.fotos_count,
    google_maps_url: placeData.google_maps_url,
    horarios_completos: placeData.horarios_completos,
    tiene_web: placeData.tiene_web,
    tiene_descripcion: placeData.tiene_descripcion,
    business_status: placeData.business_status,
    score_gbp: breakdown.total,
    score_rating: breakdown.rating,
    score_resenas: breakdown.resenas,
    score_fotos: breakdown.fotos,
    score_horarios: breakdown.horarios,
    score_web: breakdown.web,
    score_descripcion: breakdown.descripcion,
    tareas_creadas: tareasCreadas ?? 0,
    tareas_completadas: tareasCompletadas ?? 0,
    agentes_ejecutados: agentesEjecutados ?? 0,
    delta_rating: deltaRating,
    delta_resenas: deltaResenas,
    delta_fotos: deltaFotos,
    delta_score: deltaScore,
    notas: notas ?? null,
  }

  const { data, error } = await supabaseAdmin
    .from('snapshots_gbp')
    .upsert(row, { onConflict: 'cliente_id,fecha' })
    .select()
    .single()

  if (error) {
    console.error('[snapshots] Error guardando snapshot:', error)
    return null
  }

  console.log(`[snapshots] ✓ Snapshot de "${placeData.nombre}": ${breakdown.total}/100 (Δ${deltaScore >= 0 ? '+' : ''}${deltaScore})`)
  return data as SnapshotGBP
}

// ── Obtener historial de snapshots ─────────────────────────

export async function getSnapshots(
  clienteId: string,
  dias: number = 30
): Promise<SnapshotGBP[]> {
  if (!supabaseAdmin) return []

  const desde = new Date()
  desde.setDate(desde.getDate() - dias)

  const { data, error } = await supabaseAdmin
    .from('snapshots_gbp')
    .select('*')
    .eq('cliente_id', clienteId)
    .gte('fecha', desde.toISOString().split('T')[0])
    .order('fecha', { ascending: true })

  if (error) {
    console.error('[snapshots] Error obteniendo historial:', error)
    return []
  }

  return (data ?? []) as SnapshotGBP[]
}

// ── Obtener último snapshot ────────────────────────────────

export async function getUltimoSnapshot(
  clienteId: string
): Promise<SnapshotGBP | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('snapshots_gbp')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[snapshots] Error obteniendo último snapshot:', error)
    return null
  }

  return data as SnapshotGBP | null
}

// ── Resumen de evolución ───────────────────────────────────

export async function getResumenEvolucion(
  clienteId: string
): Promise<ResumenEvolucion> {
  if (!supabaseAdmin) {
    return { dias_tracking: 0, primer_snapshot: null, ultimo_snapshot: null, delta_total_score: 0, delta_total_resenas: 0, delta_total_fotos: 0, delta_total_rating: 0, mejora_promedio_diaria: 0 }
  }

  // Primer snapshot
  const { data: primero } = await supabaseAdmin
    .from('snapshots_gbp')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: true })
    .limit(1)
    .maybeSingle()

  // Último snapshot
  const { data: ultimo } = await supabaseAdmin
    .from('snapshots_gbp')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Total snapshots
  const { count } = await supabaseAdmin
    .from('snapshots_gbp')
    .select('*', { count: 'exact', head: true })
    .eq('cliente_id', clienteId)

  if (!primero || !ultimo) {
    return { dias_tracking: 0, primer_snapshot: null, ultimo_snapshot: null, delta_total_score: 0, delta_total_resenas: 0, delta_total_fotos: 0, delta_total_rating: 0, mejora_promedio_diaria: 0 }
  }

  const diasTracking = count ?? 0
  const deltaScore = (ultimo.score_gbp ?? 0) - (primero.score_gbp ?? 0)
  const diasEntre = Math.max(1, Math.ceil((new Date(ultimo.fecha).getTime() - new Date(primero.fecha).getTime()) / (1000 * 60 * 60 * 24)))

  return {
    dias_tracking: diasTracking,
    primer_snapshot: primero as SnapshotGBP,
    ultimo_snapshot: ultimo as SnapshotGBP,
    delta_total_score: deltaScore,
    delta_total_resenas: (ultimo.resenas_count ?? 0) - (primero.resenas_count ?? 0),
    delta_total_fotos: (ultimo.fotos_count ?? 0) - (primero.fotos_count ?? 0),
    delta_total_rating: (ultimo.rating ?? 0) - (primero.rating ?? 0),
    mejora_promedio_diaria: Math.round((deltaScore / diasEntre) * 100) / 100,
  }
}
