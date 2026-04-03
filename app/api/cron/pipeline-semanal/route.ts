// ─────────────────────────────────────────────────────────
// CRON: Pipeline Semanal — Ejecuta análisis completo
// ─────────────────────────────────────────────────────────
// GET /api/cron/pipeline-semanal
//
// Ejecuta el supervisor (11 agentes) para TODOS los clientes
// activos, uno por uno. El supervisor ya incluye los 5 agentes
// de voz en su fase 4-5, así que no hace falta pipeline aparte.
//
// Protegido con CRON_SECRET (Vercel lo inyecta automáticamente).
// Schedule: Lunes 9:00 UTC (11:00 Madrid)
//
// Las tareas generadas siguen el sistema de autonomía:
//   🟢 auto_ejecutar → se ejecutan solas
//   🟡 notificar     → se ejecutan y notifican al admin
//   🔴 aprobar       → esperan aprobación manual

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { runSupervisor } from '@/lib/agents/supervisor'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel Hobby max

interface ClienteResult {
  cliente_id: string
  negocio: string
  estado: string
  completados: number
  errores: number
  tareas: number
  coste: number
  error?: string
}

export async function GET(request: NextRequest) {
  // ── Verificar autorización ──
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 })
  }

  console.log('[cron] ══════ Pipeline semanal iniciado ══════')
  const startTime = Date.now()

  // ── Obtener clientes activos ──
  const { data: clientes, error: clientesError } = await supabaseAdmin
    .from('clientes')
    .select('id, nombre, negocio, pack')
    .eq('estado', 'activo')
    .order('created_at', { ascending: true })

  if (clientesError || !clientes) {
    console.error('[cron] Error obteniendo clientes:', clientesError)
    return NextResponse.json({ error: 'Error obteniendo clientes' }, { status: 500 })
  }

  if (clientes.length === 0) {
    return NextResponse.json({ ok: true, message: 'No hay clientes activos', clientes: 0 })
  }

  console.log(`[cron] ${clientes.length} clientes activos encontrados`)

  // ── Ejecutar supervisor para cada cliente ──
  const results: ClienteResult[] = []
  let totalCoste = 0
  let totalTareas = 0

  for (const cliente of clientes) {
    const label = cliente.negocio ?? cliente.nombre
    console.log(`[cron] ── Procesando: ${label} ──`)

    try {
      const sup = await runSupervisor(cliente.id, cliente.pack)

      results.push({
        cliente_id: cliente.id,
        negocio: label,
        estado: sup.estado,
        completados: sup.completados,
        errores: sup.errores,
        tareas: sup.tareas_generadas,
        coste: sup.coste_total,
      })

      totalCoste += sup.coste_total
      totalTareas += sup.tareas_generadas
      console.log(`[cron]   ✓ ${sup.completados}/${sup.total} agentes OK, ${sup.tareas_generadas} tareas, $${sup.coste_total.toFixed(4)}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      results.push({
        cliente_id: cliente.id,
        negocio: label,
        estado: 'error',
        completados: 0,
        errores: 11,
        tareas: 0,
        coste: 0,
        error: msg,
      })
      console.error(`[cron]   ✗ ${label} falló: ${msg}`)
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const exitosos = results.filter(r => r.estado !== 'error').length

  // ── Registrar ejecución en Supabase ──
  await supabaseAdmin.from('uso_api').insert({
    servicio: 'cron_pipeline_semanal',
    endpoint: '/api/cron/pipeline-semanal',
    coste: totalCoste,
    detalles: {
      clientes_total: clientes.length,
      clientes_ok: exitosos,
      tareas_generadas: totalTareas,
      duracion_seg: parseFloat(elapsed),
    },
  })

  console.log(`[cron] ══════ Pipeline completado: ${exitosos}/${clientes.length} clientes, ${totalTareas} tareas, $${totalCoste.toFixed(4)}, ${elapsed}s ══════`)

  return NextResponse.json({
    ok: true,
    clientes_total: clientes.length,
    clientes_ok: exitosos,
    clientes_error: clientes.length - exitosos,
    tareas_generadas: totalTareas,
    coste_total: Math.round(totalCoste * 1_000_000) / 1_000_000,
    duracion_seg: parseFloat(elapsed),
    resultados: results,
  })
}
