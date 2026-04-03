// ─────────────────────────────────────────────────────────
// API: Generar link del portal para un cliente
// ─────────────────────────────────────────────────────────
// GET /api/clients/[id]/portal
// Genera el token HMAC y devuelve la URL del portal.
// No necesita escribir en la base de datos.

import { NextRequest, NextResponse } from 'next/server'
import { getClientById } from '@/lib/clients'
import { generatePortalToken } from '@/lib/portal'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  // Verificar que el cliente existe
  const cliente = await getClientById(id)
  if (!cliente) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  // Generar token determinístico (HMAC del ID)
  const token = generatePortalToken(id)
  const baseUrl = request.nextUrl.origin

  return NextResponse.json({
    token,
    url: `${baseUrl}/portal/${token}`,
    negocio: cliente.negocio,
  })
}
