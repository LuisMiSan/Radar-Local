import { NextResponse } from 'next/server'
import { runSupervisor } from '@/lib/agents/supervisor'
import { getClientById } from '@/lib/clients'

// POST /api/agents/supervisor
// Body: { cliente_id: string }
// Ejecuta TODOS los agentes en secuencia para un cliente
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Acepta tanto clienteId (panel de agentes) como cliente_id (legacy)
    const cliente_id = body.clienteId ?? body.cliente_id

    if (!cliente_id) {
      return NextResponse.json(
        { error: 'Se requiere cliente_id' },
        { status: 400 }
      )
    }

    // Verificar que el cliente existe
    const cliente = await getClientById(cliente_id)
    if (!cliente) {
      return NextResponse.json(
        { error: `Cliente "${cliente_id}" no encontrado` },
        { status: 404 }
      )
    }

    console.log(`[API supervisor] Iniciando análisis completo para ${cliente.negocio ?? cliente.nombre}`)

    // Ejecutar el supervisor
    const result = await runSupervisor(cliente_id, cliente.pack)

    return NextResponse.json({
      ok: true,
      estado: result.estado,
      completados: result.completados,
      errores: result.errores,
      total: result.total,
      coste_total: result.coste_total,
      tareas_generadas: result.tareas_generadas,
      resumen: result.resumen,
      detalle_errores: result.detalle_errores,
      // Resumen por agente (sin datos completos para no saturar la respuesta)
      agentes: result.resultados.map((r) => ({
        agente: r.agente,
        estado: r.estado,
        resumen: r.resumen,
        tareas: r.tareas?.length ?? 0,
        coste: r.usage?.coste_total ?? 0,
      })),
    })
  } catch (error) {
    console.error('[API supervisor] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
