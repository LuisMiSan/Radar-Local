import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getClientById } from '@/lib/clients'
import { validateA2AKey } from '@/lib/a2a/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { A2ATask, TaskResult } from '@/lib/a2a/types'

interface NegocioData {
  negocio: string
  nombre_contacto?: string
  direccion?: string
  web?: string
  pack?: string
}

// POST /api/a2a/tasks
// Responde 202 inmediatamente. El trabajo real ocurre en /[taskId]/run
// (invocación Vercel independiente con maxDuration=300).
// Polling: GET /api/a2a/tasks/[taskId] cada ~10s
export async function POST(req: NextRequest) {
  const task: A2ATask = await req.json()
  const taskId = task.id ?? randomUUID()
  const now = () => new Date().toISOString()

  // ── Autenticación ────────────────────────────────────────
  const apiKeyCtx = await validateA2AKey(req.headers.get('Authorization'))
  if (!apiKeyCtx) {
    return NextResponse.json(
      {
        id: taskId,
        status: { state: 'failed', message: 'No autorizado. Incluye Authorization: Bearer rl_<api_key>', timestamp: now() },
      } satisfies TaskResult,
      { status: 401 }
    )
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { id: taskId, status: { state: 'failed', message: 'Error de configuración del servidor', timestamp: now() } } satisfies TaskResult,
      { status: 500 }
    )
  }

  // ── Extraer parámetros ──────────────────────────────────
  const dataPart = task.message.parts.find((p) => p.type === 'data')
  const params = (dataPart?.data ?? {}) as { clienteId?: string; negocio?: NegocioData; skillId?: string }
  const skillId = params.skillId ?? 'auditoria_completa'

  // ── Resolver clienteId ──────────────────────────────────
  let clienteId: string | null = null

  if (params.clienteId) {
    const cliente = await getClientById(params.clienteId).catch(() => null)
    if (!cliente) {
      return NextResponse.json(
        { id: taskId, status: { state: 'failed', message: `Cliente "${params.clienteId}" no encontrado`, timestamp: now() } } satisfies TaskResult,
        { status: 404 }
      )
    }
    clienteId = params.clienteId

  } else if (params.negocio?.negocio) {
    const nd = params.negocio
    const { data: nuevo, error } = await supabaseAdmin
      .from('clientes')
      .insert({
        nombre: nd.nombre_contacto ?? nd.negocio,
        negocio: nd.negocio,
        email: `a2a-${randomUUID().slice(0, 8)}@radarlocal.es`,
        direccion: nd.direccion ?? null,
        web: nd.web ?? null,
        pack: nd.pack ?? 'autoridad_maps_ia',
        estado: 'activo',
        notas: `Cliente API externa — agencia: ${apiKeyCtx.nombreAgencia} | task: ${taskId}`,
      })
      .select('id')
      .single()

    if (error || !nuevo) {
      return NextResponse.json(
        { id: taskId, status: { state: 'failed', message: `Error creando cliente: ${error?.message}`, timestamp: now() } } satisfies TaskResult,
        { status: 500 }
      )
    }
    clienteId = nuevo.id as string

  } else {
    return NextResponse.json(
      {
        id: taskId,
        status: { state: 'failed', message: 'Proporciona clienteId o negocio en data part', timestamp: now() },
      } satisfies TaskResult,
      { status: 400 }
    )
  }

  // ── Guardar tarea en DB ─────────────────────────────────
  const { error: insertError } = await supabaseAdmin
    .from('a2a_tasks')
    .insert({
      id: taskId,
      api_key_id: apiKeyCtx.keyId,
      cliente_id: clienteId,
      skill_id: skillId,
      nombre_agencia: apiKeyCtx.nombreAgencia,
      estado: 'submitted',
    })

  if (insertError) {
    return NextResponse.json(
      { id: taskId, status: { state: 'failed', message: `Error guardando tarea: ${insertError.message}`, timestamp: now() } } satisfies TaskResult,
      { status: 500 }
    )
  }

  // ── Disparar worker (invocación independiente, sin await) ─
  const internalSecret = process.env.A2A_INTERNAL_SECRET
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (internalSecret) {
    // Fire-and-forget: no await → respuesta 202 sale inmediatamente
    // El worker tiene su propia invocación Vercel con maxDuration=300
    fetch(`${baseUrl}/api/a2a/tasks/${taskId}/run`, {
      method: 'POST',
      headers: { 'x-a2a-internal': internalSecret },
    }).catch((e) => console.error(`[a2a/tasks] Worker trigger falló para ${taskId}:`, e))
  } else {
    console.warn('[a2a/tasks] A2A_INTERNAL_SECRET no configurado — worker no disparado')
  }

  // ── Respuesta inmediata 202 ──────────────────────────────
  const response: TaskResult = {
    id: taskId,
    sessionId: task.sessionId,
    status: {
      state: 'submitted',
      message: `Tarea registrada. Haz polling a GET /api/a2a/tasks/${taskId} cada 10s para ver el progreso.`,
      timestamp: now(),
    },
  }

  return NextResponse.json(response, { status: 202 })
}
