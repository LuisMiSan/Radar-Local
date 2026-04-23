import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { runSupervisor } from '@/lib/agents/supervisor'
import { getClientById } from '@/lib/clients'

// Worker interno — invocado por POST /api/a2a/tasks sin esperar la respuesta
// Tiene su propia invocación Vercel con 300s de presupuesto independiente
export const maxDuration = 300

// Protección: solo llamadas internas con el secreto correcto
function isInternalCall(req: NextRequest): boolean {
  const secret = process.env.A2A_INTERNAL_SECRET
  if (!secret) return false
  return req.headers.get('x-a2a-internal') === secret
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params

  if (!isInternalCall(_req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
  }

  // Leer la tarea de la DB
  const { data: tarea, error } = await supabaseAdmin
    .from('a2a_tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error || !tarea) {
    return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
  }

  // Marcar como working
  await supabaseAdmin
    .from('a2a_tasks')
    .update({ estado: 'working', started_at: new Date().toISOString() })
    .eq('id', taskId)

  console.log(`[a2a/run] Iniciando tarea ${taskId} — cliente ${tarea.cliente_id} — agencia "${tarea.nombre_agencia}"`)

  try {
    const cliente = await getClientById(tarea.cliente_id as string)
    const packMap: Record<string, string | null> = {
      auditoria_completa: cliente?.pack ?? null,
      pack_visibilidad:   'visibilidad_local',
      pack_autoridad:     'autoridad_maps_ia',
    }
    const packEjecucion = packMap[tarea.skill_id as string] ?? cliente?.pack ?? null

    const result = await runSupervisor(tarea.cliente_id as string, packEjecucion)

    // Guardar resultado completo
    const artifacts = [
      {
        name: 'supervisor_result',
        parts: [
          {
            type: 'data',
            data: {
              agencia: tarea.nombre_agencia,
              cliente_id: tarea.cliente_id,
              estado: result.estado,
              completados: result.completados,
              errores: result.errores,
              total: result.total,
              coste_total: result.coste_total,
              tareas_generadas: result.tareas_generadas,
              detalle_errores: result.detalle_errores,
              agentes: result.resultados.map((r) => ({
                agente: r.agente,
                estado: r.estado,
                resumen: r.resumen,
                tareas: r.tareas?.length ?? 0,
                coste: r.usage?.coste_total ?? 0,
              })),
            },
          },
        ],
      },
    ]

    await supabaseAdmin
      .from('a2a_tasks')
      .update({
        estado: result.estado === 'error' ? 'failed' : 'completed',
        resultado: artifacts,
        error_message: result.estado === 'error' ? result.resumen : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    console.log(`[a2a/run] Tarea ${taskId} completada — ${result.resumen}`)
    return NextResponse.json({ ok: true })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    console.error(`[a2a/run] Tarea ${taskId} falló:`, err)

    await supabaseAdmin
      .from('a2a_tasks')
      .update({
        estado: 'failed',
        error_message: msg,
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
