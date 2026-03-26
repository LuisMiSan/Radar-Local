import { NextResponse } from 'next/server'
import { procesarColaEjecucion, ejecutarTareasAprobadas } from '@/lib/task-executor'
import { obtenerTareas } from '@/lib/tareas-ejecucion'

// POST /api/tasks/execute
// Ejecuta tareas aprobadas pendientes
// Body opcional: { cliente_id?: string } para filtrar por cliente

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { cliente_id } = body as { cliente_id?: string }

    if (cliente_id) {
      // Ejecutar solo tareas aprobadas de un cliente específico
      const tareas = await obtenerTareas(cliente_id, { estado: 'aprobada' })
      const pendientes = tareas.filter(t => !t.ejecutado_en)

      if (pendientes.length === 0) {
        return NextResponse.json({
          mensaje: 'No hay tareas aprobadas pendientes de ejecución para este cliente',
          total: 0,
        })
      }

      const resultado = await ejecutarTareasAprobadas(pendientes)
      return NextResponse.json({
        mensaje: `${resultado.exitosas} tareas ejecutadas, ${resultado.fallidas} fallidas`,
        ...resultado,
      })
    }

    // Sin cliente_id → procesar toda la cola
    const resultado = await procesarColaEjecucion()
    return NextResponse.json({
      mensaje: `Cola procesada: ${resultado.exitosas} exitosas, ${resultado.fallidas} fallidas de ${resultado.total}`,
      ...resultado,
    })
  } catch (error) {
    console.error('[api/tasks/execute] Error:', error)
    return NextResponse.json(
      { error: 'Error ejecutando tareas', detalle: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
