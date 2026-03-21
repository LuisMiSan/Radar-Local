import { NextRequest, NextResponse } from 'next/server'
import { getClientById, updateClient } from '@/lib/clients'

// GET /api/clients/[id] — Obtener un cliente
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const client = await getClientById(id)
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }
  return NextResponse.json(client)
}

// PATCH /api/clients/[id] — Actualizar un cliente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const client = await updateClient(id, body)
  if (!client) {
    return NextResponse.json({ error: 'Error actualizando cliente' }, { status: 500 })
  }
  return NextResponse.json(client)
}
