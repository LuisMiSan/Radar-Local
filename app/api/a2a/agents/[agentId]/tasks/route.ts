import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import type { Agente } from '@/types'
import { runAgent } from '@/lib/agents'
import type { A2ATask, TaskResult } from '@/lib/a2a/types'

// Mapa de agentId A2A → nombre interno del agente
const AGENT_ID_MAP: Record<string, Agente> = {
  'auditor-gbp':        'auditor_gbp',
  'optimizador-nap':    'optimizador_nap',
  'prospector-web':     'prospector_web',
  'keywords-locales':   'keywords_locales',
  'gestor-resenas':     'gestor_resenas',
  'redactor-posts':     'redactor_posts_gbp',
  'generador-schema':   'generador_schema',
  'creador-faq':        'creador_faq_geo',
  'generador-chunks':   'generador_chunks',
  'tldr-entidad':       'tldr_entidad',
  'monitor-ias':        'monitor_ias',
  'generador-reporte':  'generador_reporte',
}

// POST /api/a2a/agents/[agentId]/tasks
// Endpoint A2A para ejecutar un agente individual vía protocolo Agent2Agent
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params
  const task: A2ATask = await req.json()
  const taskId = task.id ?? randomUUID()
  const now = () => new Date().toISOString()

  // Resolver nombre interno del agente
  const agenteInterno = AGENT_ID_MAP[agentId]
  if (!agenteInterno) {
    return NextResponse.json(
      {
        id: taskId,
        status: {
          state: 'failed',
          message: `Agente "${agentId}" no reconocido. IDs válidos: ${Object.keys(AGENT_ID_MAP).join(', ')}`,
          timestamp: now(),
        },
      } satisfies TaskResult,
      { status: 404 }
    )
  }

  // Extraer clienteId del mensaje A2A
  const dataPart = task.message.parts.find((p) => p.type === 'data')
  const { clienteId } = (dataPart?.data ?? {}) as { clienteId?: string }

  if (!clienteId) {
    return NextResponse.json(
      {
        id: taskId,
        status: { state: 'failed', message: 'clienteId requerido en data part', timestamp: now() },
      } satisfies TaskResult,
      { status: 400 }
    )
  }

  try {
    const result = await runAgent(agenteInterno, clienteId)

    const response: TaskResult = {
      id: taskId,
      sessionId: task.sessionId,
      status: {
        state: result.estado === 'error' ? 'failed' : 'completed',
        message: result.resumen,
        timestamp: now(),
      },
      artifacts: [
        {
          name: `${agentId}_result`,
          parts: [
            {
              type: 'data',
              data: {
                agente: result.agente,
                estado: result.estado,
                resumen: result.resumen,
                datos: result.datos,
                tareas: result.tareas ?? [],
                coste: result.usage?.coste_total ?? 0,
              },
            },
          ],
        },
      ],
    }

    return NextResponse.json(response)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json(
      { id: taskId, status: { state: 'failed', message: msg, timestamp: now() } } satisfies TaskResult,
      { status: 500 }
    )
  }
}
