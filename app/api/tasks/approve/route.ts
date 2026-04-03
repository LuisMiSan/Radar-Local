import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { aprobarTarea, rechazarTarea } from '@/lib/tareas-ejecucion'
import { ejecutarTareasAprobadas } from '@/lib/task-executor'
import type { TareaEjecucion } from '@/types'

// POST /api/tasks/approve
// Aprobar o rechazar una tarea que necesita aprobación humana
// Body: { tarea_id: string, accion: 'aprobar' | 'rechazar', motivo?: string, ejecutar_ahora?: boolean }
// PROTEGIDA: requiere sesión de admin

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const supabase = await createSupabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { tarea_id, accion, motivo, ejecutar_ahora = true } = body as {
      tarea_id: string
      accion: 'aprobar' | 'rechazar'
      motivo?: string
      ejecutar_ahora?: boolean
    }

    if (!tarea_id || !accion) {
      return NextResponse.json(
        { error: 'Faltan campos: tarea_id, accion ("aprobar" o "rechazar")' },
        { status: 400 }
      )
    }

    // Validar que accion sea un valor permitido
    if (accion !== 'aprobar' && accion !== 'rechazar') {
      return NextResponse.json(
        { error: 'accion debe ser "aprobar" o "rechazar"' },
        { status: 400 }
      )
    }

    // Validar formato UUID de tarea_id
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tarea_id)) {
      return NextResponse.json(
        { error: 'tarea_id debe ser un UUID válido' },
        { status: 400 }
      )
    }

    if (accion === 'rechazar') {
      const tarea = await rechazarTarea(tarea_id, motivo)
      if (!tarea) {
        return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
      }
      return NextResponse.json({
        mensaje: `Tarea rechazada: "${tarea.titulo}"`,
        tarea,
      })
    }

    // Aprobar
    const tarea = await aprobarTarea(tarea_id)
    if (!tarea) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
    }

    // Opcionalmente ejecutar inmediatamente
    if (ejecutar_ahora) {
      const resultado = await ejecutarTareasAprobadas([tarea as TareaEjecucion])
      return NextResponse.json({
        mensaje: `Tarea aprobada y ejecutada: "${tarea.titulo}"`,
        tarea,
        ejecucion: resultado,
      })
    }

    return NextResponse.json({
      mensaje: `Tarea aprobada: "${tarea.titulo}". Pendiente de ejecución.`,
      tarea,
    })
  } catch (error) {
    console.error('[api/tasks/approve] Error:', error)
    return NextResponse.json(
      { error: 'Error procesando aprobación', detalle: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
