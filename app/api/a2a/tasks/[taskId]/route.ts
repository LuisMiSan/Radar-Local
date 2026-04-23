import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { validateA2AKey } from '@/lib/a2a/auth'
import type { TaskResult } from '@/lib/a2a/types'

// GET /api/a2a/tasks/[taskId]
// Polling de estado de una tarea async A2A
// Recomendado: poll cada 10s hasta que estado sea "completed" o "failed"
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params
  const now = () => new Date().toISOString()

  // Autenticación
  const apiKeyCtx = await validateA2AKey(req.headers.get('Authorization'))
  if (!apiKeyCtx) {
    return NextResponse.json(
      { id: taskId, status: { state: 'failed', message: 'No autorizado', timestamp: now() } } satisfies TaskResult,
      { status: 401 }
    )
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { id: taskId, status: { state: 'failed', message: 'Error de configuración', timestamp: now() } } satisfies TaskResult,
      { status: 500 }
    )
  }

  const { data: tarea, error } = await supabaseAdmin
    .from('a2a_tasks')
    .select('*')
    .eq('id', taskId)
    .eq('api_key_id', apiKeyCtx.keyId)   // solo la agencia propietaria puede consultar
    .maybeSingle()

  if (error || !tarea) {
    return NextResponse.json(
      { id: taskId, status: { state: 'failed', message: 'Tarea no encontrada', timestamp: now() } } satisfies TaskResult,
      { status: 404 }
    )
  }

  const estado = tarea.estado as string
  const timestamp = (tarea.completed_at ?? tarea.started_at ?? tarea.created_at) as string

  // Tarea en progreso o pendiente
  if (estado === 'submitted' || estado === 'working') {
    const elapsed = Math.round((Date.now() - new Date(tarea.created_at as string).getTime()) / 1000)
    return NextResponse.json({
      id: taskId,
      status: {
        state: estado === 'submitted' ? 'submitted' : 'working',
        message: estado === 'submitted'
          ? 'Tarea en cola, iniciando pronto...'
          : `Ejecutando agentes... (${elapsed}s)`,
        timestamp: now(),
      },
    } satisfies TaskResult)
  }

  // Tarea completada o fallida
  const response: TaskResult = {
    id: taskId,
    status: {
      state: estado === 'completed' ? 'completed' : 'failed',
      message: estado === 'failed' ? (tarea.error_message as string ?? 'Error desconocido') : undefined,
      timestamp,
    },
    artifacts: estado === 'completed' ? (tarea.resultado as TaskResult['artifacts']) : undefined,
  }

  return NextResponse.json(response)
}
