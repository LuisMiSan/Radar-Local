import 'server-only'
import { supabaseAdmin } from './supabase-admin'

// ══════════════════════════════════════════════════════════════
// LIBRERÍA DE CONTENIDO — Todo lo que generan los agentes
//
// Cuando un agente genera contenido (FAQ, chunk, schema, post),
// se guarda aquí automáticamente. Es el OUTPUT real del sistema.
// ══════════════════════════════════════════════════════════════

export interface ContenidoGenerado {
  id: string
  cliente_id: string
  agente: string
  tarea_id: string | null
  tipo: string
  categoria: string
  titulo: string
  contenido: string
  contenido_json: Record<string, unknown> | null
  plataforma_target: string | null
  optimizado_para: string | null
  keywords: string[] | null
  estado: 'generado' | 'publicado' | 'descartado'
  publicado_en: string | null
  publicado_at: string | null
  score_calidad: number | null
  created_at: string
  updated_at: string
}

// ── Guardar contenido generado por un agente ──────────────────

export async function guardarContenido(params: {
  clienteId: string
  agente: string
  tareaId?: string
  tipo: string
  categoria: string
  titulo: string
  contenido: string
  contenidoJson?: Record<string, unknown>
  plataformaTarget?: string
  optimizadoPara?: string
  keywords?: string[]
  scoreCalidad?: number
}): Promise<ContenidoGenerado | null> {
  if (!supabaseAdmin) {
    console.log(`[content-library] Sin Supabase → contenido no guardado: ${params.titulo}`)
    return null
  }

  const row = {
    cliente_id: params.clienteId,
    agente: params.agente,
    tarea_id: params.tareaId ?? null,
    tipo: params.tipo,
    categoria: params.categoria,
    titulo: params.titulo,
    contenido: params.contenido,
    contenido_json: params.contenidoJson ?? null,
    plataforma_target: params.plataformaTarget ?? null,
    optimizado_para: params.optimizadoPara ?? null,
    keywords: params.keywords ?? null,
    score_calidad: params.scoreCalidad ?? null,
  }

  const { data, error } = await supabaseAdmin
    .from('contenido_generado')
    .insert(row)
    .select()
    .single()

  if (error) {
    console.error('[content-library] Error guardando:', error)
    return null
  }

  console.log(`[content-library] ✓ Guardado: "${params.titulo}" (${params.tipo}/${params.categoria})`)
  return data as ContenidoGenerado
}

// ── Obtener contenido por cliente ─────────────────────────────

export async function getContenido(
  clienteId: string,
  filtros?: {
    tipo?: string
    categoria?: string
    plataforma?: string
    estado?: string
    limit?: number
  }
): Promise<ContenidoGenerado[]> {
  if (!supabaseAdmin) return []

  let query = supabaseAdmin
    .from('contenido_generado')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })

  if (filtros?.tipo) query = query.eq('tipo', filtros.tipo)
  if (filtros?.categoria) query = query.eq('categoria', filtros.categoria)
  if (filtros?.plataforma) query = query.eq('plataforma_target', filtros.plataforma)
  if (filtros?.estado) query = query.eq('estado', filtros.estado)
  if (filtros?.limit) query = query.limit(filtros.limit)

  const { data, error } = await query

  if (error) {
    console.error('[content-library] Error:', error)
    return []
  }

  return (data ?? []) as ContenidoGenerado[]
}

// ── Stats de contenido ────────────────────────────────────────

export async function getContenidoStats(clienteId: string): Promise<{
  total: number
  por_tipo: Record<string, number>
  por_categoria: Record<string, number>
  por_estado: Record<string, number>
  voz_total: number
}> {
  if (!supabaseAdmin) {
    return { total: 0, por_tipo: {}, por_categoria: {}, por_estado: {}, voz_total: 0 }
  }

  const { data, error } = await supabaseAdmin
    .from('contenido_generado')
    .select('tipo, categoria, estado, plataforma_target')
    .eq('cliente_id', clienteId)

  if (error || !data) {
    return { total: 0, por_tipo: {}, por_categoria: {}, por_estado: {}, voz_total: 0 }
  }

  const por_tipo: Record<string, number> = {}
  const por_categoria: Record<string, number> = {}
  const por_estado: Record<string, number> = {}
  let voz_total = 0

  data.forEach(item => {
    por_tipo[item.tipo] = (por_tipo[item.tipo] ?? 0) + 1
    por_categoria[item.categoria] = (por_categoria[item.categoria] ?? 0) + 1
    por_estado[item.estado] = (por_estado[item.estado] ?? 0) + 1
    if (item.categoria === 'voz' || item.plataforma_target === 'gemini' || item.plataforma_target === 'siri') {
      voz_total++
    }
  })

  return { total: data.length, por_tipo, por_categoria, por_estado, voz_total }
}

// ── Marcar como publicado ─────────────────────────────────────

export async function marcarPublicado(
  contenidoId: string,
  publicadoEn: string
): Promise<boolean> {
  if (!supabaseAdmin) return false

  const { error } = await supabaseAdmin
    .from('contenido_generado')
    .update({
      estado: 'publicado',
      publicado_en: publicadoEn,
      publicado_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', contenidoId)

  return !error
}
