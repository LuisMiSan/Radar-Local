// ─────────────────────────────────────────────────────────
// API: Cambiar estado del cliente en el pipeline CRM
// ─────────────────────────────────────────────────────────
// PATCH /api/clients/[id]/status
// Body: { estado: "contactado", nota?: "Llamada realizada" }

import { NextRequest, NextResponse } from 'next/server'
import { updateClientStatus } from '@/lib/clients'
import type { EstadoCliente } from '@/types'

const ESTADOS_VALIDOS: EstadoCliente[] = [
  'lead', 'contactado', 'llamada_info', 'propuesta_enviada', 'negociando', 'llamada_onboarding', 'activo', 'pausado', 'eliminado',
]

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  // Validar UUID
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: 'ID de cliente inválido' },
      { status: 400 }
    )
  }

  // Parsear body
  let body: { estado?: string; nota?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body JSON inválido' },
      { status: 400 }
    )
  }

  const { estado, nota } = body

  // Validar estado
  if (!estado || !ESTADOS_VALIDOS.includes(estado as EstadoCliente)) {
    return NextResponse.json(
      { error: `Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}` },
      { status: 400 }
    )
  }

  // Sanitizar nota
  const notaLimpia = typeof nota === 'string' ? nota.trim().slice(0, 500) : undefined

  const updated = await updateClientStatus(id, estado as EstadoCliente, notaLimpia)

  if (!updated) {
    return NextResponse.json(
      { error: 'No se pudo actualizar el estado' },
      { status: 500 }
    )
  }

  return NextResponse.json(updated)
}
