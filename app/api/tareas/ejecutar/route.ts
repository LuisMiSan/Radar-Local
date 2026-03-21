import { NextRequest, NextResponse } from 'next/server'
import { ejecutarTarea, ejecutarTareasAprobadas } from '@/lib/agents/executor'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { TareaEjecucion } from '@/types'

// ══════════════════════════════════════════════════════════════
// POST /api/tareas/ejecutar — Ejecutar tareas aprobadas
//
// Body:
//   tarea_id — ejecutar UNA tarea específica
//   cliente_id — ejecutar TODAS las aprobadas de un cliente
// ══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tarea_id, cliente_id } = body

    // Modo 1: ejecutar una tarea específica
    if (tarea_id) {
      if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
      }

      const { data: tarea, error } = await supabaseAdmin
        .from('tareas_ejecucion')
        .select('*')
        .eq('id', tarea_id)
        .single()

      if (error || !tarea) {
        return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
      }

      // Verificar que la tarea está lista para ejecutar
      const t = tarea as TareaEjecucion
      const puedeEjecutar =
        t.estado === 'aprobada' ||
        (t.estado === 'pendiente' && t.tipo === 'auto')

      if (!puedeEjecutar) {
        return NextResponse.json(
          { error: `La tarea no se puede ejecutar (estado: ${t.estado}, tipo: ${t.tipo})` },
          { status: 400 }
        )
      }

      const result = await ejecutarTarea(t)

      return NextResponse.json({
        ok: result.ok,
        resultado: result.resultado,
        coste: result.coste,
        mensaje: result.ok
          ? `Tarea "${t.titulo}" ejecutada correctamente`
          : `Error ejecutando tarea: ${result.resultado}`,
      })
    }

    // Modo 2: ejecutar todas las aprobadas de un cliente
    if (cliente_id) {
      const result = await ejecutarTareasAprobadas(cliente_id)

      return NextResponse.json({
        ...result,
        mensaje: `${result.completadas}/${result.ejecutadas} tareas completadas ($${result.coste_total.toFixed(4)})`,
      })
    }

    return NextResponse.json(
      { error: 'Se requiere tarea_id o cliente_id' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API /tareas/ejecutar] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
