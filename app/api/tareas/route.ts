import { NextRequest, NextResponse } from 'next/server'
import {
  obtenerTareas,
  obtenerTareasPendientesAprobacion,
  aprobarTarea,
  rechazarTarea,
  obtenerResumenProgreso,
} from '@/lib/tareas-ejecucion'
import type { EstadoEjecucion, Agente } from '@/types'

// ══════════════════════════════════════════════════════════════
// GET /api/tareas — Obtener tareas de ejecución
//
// Query params:
//   cliente_id (required) — ID del cliente
//   agente — filtrar por agente
//   estado — filtrar por estado
//   tipo — filtrar por tipo (auto/revision/manual)
//   pendientes — si "true", solo tareas pendientes de aprobación
//   resumen — si "true", devuelve resumen de progreso
// ══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clienteId = searchParams.get('cliente_id')

  // Tareas pendientes de aprobación (sin filtro de cliente)
  if (searchParams.get('pendientes') === 'true') {
    const tareas = await obtenerTareasPendientesAprobacion(clienteId ?? undefined)
    return NextResponse.json({ tareas, total: tareas.length })
  }

  if (!clienteId) {
    return NextResponse.json({ error: 'cliente_id es requerido' }, { status: 400 })
  }

  // Resumen de progreso
  if (searchParams.get('resumen') === 'true') {
    const resumen = await obtenerResumenProgreso(clienteId)
    return NextResponse.json(resumen)
  }

  // Listar tareas con filtros
  const tareas = await obtenerTareas(clienteId, {
    agente: (searchParams.get('agente') as Agente) || undefined,
    estado: (searchParams.get('estado') as EstadoEjecucion) || undefined,
    tipo: (searchParams.get('tipo') as 'auto' | 'revision' | 'manual') || undefined,
  })

  return NextResponse.json({ tareas, total: tareas.length })
}

// ══════════════════════════════════════════════════════════════
// POST /api/tareas — Aprobar o rechazar una tarea (HITL)
//
// Body:
//   tarea_id (required) — ID de la tarea
//   accion (required) — "aprobar" | "rechazar"
//   motivo — motivo del rechazo (opcional)
// ══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tarea_id, accion, motivo } = body

    if (!tarea_id || !accion) {
      return NextResponse.json(
        { error: 'tarea_id y accion son requeridos' },
        { status: 400 }
      )
    }

    if (accion === 'aprobar') {
      const tarea = await aprobarTarea(tarea_id)
      if (!tarea) {
        return NextResponse.json({ error: 'No se pudo aprobar la tarea' }, { status: 500 })
      }
      return NextResponse.json({ tarea, mensaje: 'Tarea aprobada' })
    }

    if (accion === 'rechazar') {
      const tarea = await rechazarTarea(tarea_id, motivo)
      if (!tarea) {
        return NextResponse.json({ error: 'No se pudo rechazar la tarea' }, { status: 500 })
      }
      return NextResponse.json({ tarea, mensaje: 'Tarea rechazada' })
    }

    return NextResponse.json({ error: 'Acción no válida. Usa "aprobar" o "rechazar"' }, { status: 400 })
  } catch (error) {
    console.error('[API /tareas] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
