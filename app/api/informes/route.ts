import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ════════════════════════════════════════════════════════════
// GET /api/informes?clienteId=xxx — Lista informes de un cliente
// GET /api/informes — Lista todos los informes (últimos 50)
// POST /api/informes — Guarda un informe nuevo
// ════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 })
  }

  const clienteId = req.nextUrl.searchParams.get('clienteId')

  let query = supabaseAdmin
    .from('informes')
    .select('id, cliente_id, pack, puntuacion_gbp, consistencia_nap, total_resenas, media_resenas, posicion_maps, presencia_ias, agentes_total, agentes_completados, tiempo_ejecucion, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (clienteId) {
    query = query.eq('cliente_id', clienteId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    clienteId, pack, agentes, reporte,
    completados, total, tiempoEjecucion
  } = body

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 })
  }

  if (!clienteId || !agentes || !reporte) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // Extraer métricas clave de los resultados de agentes
  const auditor = agentes.find((a: { agente: string }) => a.agente === 'auditor_gbp')
  const nap = agentes.find((a: { agente: string }) => a.agente === 'optimizador_nap')
  const resenas = agentes.find((a: { agente: string }) => a.agente === 'gestor_resenas')
  const monitor = agentes.find((a: { agente: string }) => a.agente === 'monitor_ias')

  const puntuacionGbp = auditor?.datos?.puntuacion ?? 0
  const consistenciaNap = nap?.datos?.consistencia_pct ?? 0
  const totalResenas = resenas?.datos?.total ?? 0
  const mediaResenas = resenas?.datos?.puntuacion_media ?? 0
  const posicionMaps = reporte?.datos?.metricas_map_pack?.posicion_maps?.actual ?? 0
  const presenciaIas = monitor?.datos?.plataformas
    ? (monitor.datos.plataformas as Array<{ mencionado: boolean }>).filter((p) => p.mencionado).length
    : 0

  const { data, error } = await supabaseAdmin
    .from('informes')
    .insert({
      cliente_id: clienteId,
      pack,
      agentes: JSON.stringify(agentes),
      reporte: JSON.stringify(reporte),
      puntuacion_gbp: puntuacionGbp,
      consistencia_nap: consistenciaNap,
      total_resenas: totalResenas,
      media_resenas: mediaResenas,
      posicion_maps: posicionMaps,
      presencia_ias: presenciaIas,
      agentes_total: total,
      agentes_completados: completados,
      tiempo_ejecucion: tiempoEjecucion ?? 0,
    })
    .select('id, created_at')
    .single()

  if (error) {
    console.error('Error guardando informe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, created_at: data.created_at, saved: true })
}
