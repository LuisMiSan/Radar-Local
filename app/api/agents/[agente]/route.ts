import { NextRequest, NextResponse } from 'next/server'
import type { Agente } from '@/types'
import { runAgent } from '@/lib/agents'

// Lista válida de agentes para validación
const AGENTES_VALIDOS: Agente[] = [
  'auditor_gbp',
  'optimizador_nap',
  'keywords_locales',
  'gestor_resenas',
  'redactor_posts_gbp',
  'generador_schema',
  'creador_faq_geo',
  'generador_chunks',
  'tldr_entidad',
  'monitor_ias',
  'generador_reporte',
]

// POST /api/agents/[agente] — Ejecutar un agente para un cliente
export async function POST(
  request: NextRequest,
  { params }: { params: { agente: string } }
) {
  const { agente } = params

  // Validar que el agente es válido
  if (!AGENTES_VALIDOS.includes(agente as Agente)) {
    return NextResponse.json(
      { error: `Agente "${agente}" no válido` },
      { status: 400 }
    )
  }

  // Parsear body
  let body: { clienteId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body JSON inválido' },
      { status: 400 }
    )
  }

  const { clienteId } = body
  if (!clienteId) {
    return NextResponse.json(
      { error: 'clienteId es requerido' },
      { status: 400 }
    )
  }

  // Validar formato UUID para evitar inyección
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (typeof clienteId !== 'string' || !UUID_REGEX.test(clienteId)) {
    return NextResponse.json(
      { error: 'clienteId debe ser un UUID válido' },
      { status: 400 }
    )
  }

  // Ejecutar agente
  const result = await runAgent(agente as Agente, clienteId)

  // Si el resultado es error, devolver 500
  if (result.estado === 'error') {
    return NextResponse.json(result, { status: 500 })
  }

  return NextResponse.json(result)
}
