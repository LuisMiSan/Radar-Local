import 'server-only'
import { supabaseAdmin } from './supabase-admin'
import type { TokenUsage } from './agents/types'
import type { Agente } from '@/types'

// ════════════════════════════════════════════════════════════
// GASTOS — Registro y consulta de consumo de API
// ════════════════════════════════════════════════════════════

export interface RegistroGasto {
  cliente_id?: string
  cliente_nombre?: string
  agente: string
  modelo: string
  input_tokens: number
  output_tokens: number
  coste_input: number
  coste_output: number
  coste_total: number
  tipo: 'agente' | 'individual' | 'analisis_completo'
}

export interface ResumenDiario {
  fecha: string
  total_llamadas: number
  total_input_tokens: number
  total_output_tokens: number
  coste_total_dia: number
  clientes_unicos: number
  agentes_usados: number
}

export interface ResumenAgente {
  agente: string
  total_llamadas: number
  total_input_tokens: number
  total_output_tokens: number
  avg_input_tokens: number
  avg_output_tokens: number
  coste_total: number
  coste_promedio: number
}

// Registrar un gasto de API
export async function registrarGasto(gasto: RegistroGasto): Promise<void> {
  if (!supabaseAdmin) return

  const { error } = await supabaseAdmin
    .from('uso_api')
    .insert({
      cliente_id: gasto.cliente_id || null,
      cliente_nombre: gasto.cliente_nombre || null,
      agente: gasto.agente,
      modelo: gasto.modelo,
      input_tokens: gasto.input_tokens,
      output_tokens: gasto.output_tokens,
      coste_input: gasto.coste_input,
      coste_output: gasto.coste_output,
      coste_total: gasto.coste_total,
      tipo: gasto.tipo,
    })

  if (error) {
    console.error('[gastos] Error registrando gasto:', error.message)
  }
}

// Helper: registrar desde un AgentResult
export async function registrarGastoAgente(
  agente: Agente,
  usage: TokenUsage | undefined,
  clienteId?: string,
  clienteNombre?: string,
  tipo: 'agente' | 'individual' | 'analisis_completo' = 'agente'
): Promise<void> {
  if (!usage) return

  await registrarGasto({
    cliente_id: clienteId,
    cliente_nombre: clienteNombre,
    agente,
    modelo: usage.model,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    coste_input: usage.coste_input,
    coste_output: usage.coste_output,
    coste_total: usage.coste_total,
    tipo,
  })
}

// Consultar resumen diario — query directa (sin vista SQL)
export async function getResumenDiario(dias: number = 30): Promise<ResumenDiario[]> {
  if (!supabaseAdmin) return []

  const { data, error } = await supabaseAdmin
    .from('uso_api')
    .select('fecha, input_tokens, output_tokens, coste_total, cliente_id, agente')
    .order('fecha', { ascending: false })
    .limit(1000)

  if (error) {
    console.error('[gastos] Error consultando uso_api:', error.message)
    return []
  }

  // Agrupar por fecha en JS
  interface DiaTemp {
    llamadas: number; inT: number; outT: number; coste: number
    clientes: Set<string>; agentes: Set<string>
  }
  const porFecha = new Map<string, DiaTemp>()
  for (const row of data ?? []) {
    const f = row.fecha
    const existing = porFecha.get(f)
    if (existing) {
      existing.llamadas++
      existing.inT += row.input_tokens
      existing.outT += row.output_tokens
      existing.coste += Number(row.coste_total)
      if (row.cliente_id) existing.clientes.add(row.cliente_id)
      existing.agentes.add(row.agente)
    } else {
      porFecha.set(f, {
        llamadas: 1,
        inT: row.input_tokens,
        outT: row.output_tokens,
        coste: Number(row.coste_total),
        clientes: new Set(row.cliente_id ? [row.cliente_id] : []),
        agentes: new Set([row.agente]),
      })
    }
  }

  const result: ResumenDiario[] = []
  porFecha.forEach((v, fecha) => {
    result.push({
      fecha,
      total_llamadas: v.llamadas,
      total_input_tokens: v.inT,
      total_output_tokens: v.outT,
      coste_total_dia: v.coste,
      clientes_unicos: v.clientes.size,
      agentes_usados: v.agentes.size,
    })
  })

  return result.slice(0, dias)
}

// Consultar resumen por agente — query directa (sin vista SQL)
export async function getResumenPorAgente(): Promise<ResumenAgente[]> {
  if (!supabaseAdmin) return []

  const { data, error } = await supabaseAdmin
    .from('uso_api')
    .select('agente, input_tokens, output_tokens, coste_total')

  if (error) {
    console.error('[gastos] Error consultando uso_api por agente:', error.message)
    return []
  }

  const porAgente = new Map<string, { calls: number; inT: number; outT: number; coste: number }>()
  for (const row of data ?? []) {
    const existing = porAgente.get(row.agente)
    if (existing) {
      existing.calls++
      existing.inT += row.input_tokens
      existing.outT += row.output_tokens
      existing.coste += Number(row.coste_total)
    } else {
      porAgente.set(row.agente, {
        calls: 1,
        inT: row.input_tokens,
        outT: row.output_tokens,
        coste: Number(row.coste_total),
      })
    }
  }

  const result: ResumenAgente[] = []
  porAgente.forEach((v, agente) => {
    result.push({
      agente,
      total_llamadas: v.calls,
      total_input_tokens: v.inT,
      total_output_tokens: v.outT,
      avg_input_tokens: Math.round(v.inT / v.calls),
      avg_output_tokens: Math.round(v.outT / v.calls),
      coste_total: v.coste,
      coste_promedio: v.coste / v.calls,
    })
  })

  return result.sort((a, b) => b.coste_total - a.coste_total)
}

// Consultar detalle de un día específico
export async function getDetalleDia(fecha: string) {
  if (!supabaseAdmin) return []

  const { data, error } = await supabaseAdmin
    .from('uso_api')
    .select('*')
    .eq('fecha', fecha)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[gastos] Error consultando detalle:', error.message)
    return []
  }

  return data ?? []
}

// Consultar gasto total acumulado (mes actual)
export async function getGastoMesActual(): Promise<{ total: number; llamadas: number }> {
  if (!supabaseAdmin) return { total: 0, llamadas: 0 }

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const { data, error } = await supabaseAdmin
    .from('uso_api')
    .select('coste_total')
    .gte('created_at', inicioMes.toISOString())

  if (error) {
    console.error('[gastos] Error consultando mes actual:', error.message)
    return { total: 0, llamadas: 0 }
  }

  const rows = data ?? []
  const total = rows.reduce((sum, r) => sum + Number(r.coste_total), 0)
  return { total, llamadas: rows.length }
}
