// ─────────────────────────────────────────────────────────
// API: Clientes
// ─────────────────────────────────────────────────────────
// GET  /api/clients — Listar todos
// POST /api/clients — Crear nuevo cliente

import { NextRequest, NextResponse } from 'next/server'
import { getClients, createClient } from '@/lib/clients'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clients = await getClients()
  return NextResponse.json(clients)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.negocio) {
      return NextResponse.json({ error: 'negocio es obligatorio' }, { status: 400 })
    }

    const client = await createClient({
      nombre: body.nombre ?? '',
      negocio: body.negocio,
      email: body.email ?? null,
      telefono: body.telefono ?? null,
      direccion: body.direccion ?? null,
      web: body.web ?? null,
      pack: body.pack ?? null,
      es_fundador: body.es_fundador ?? false,
      estado: body.estado ?? 'activo',
      notas: body.notas ?? null,
    })

    if (!client) {
      return NextResponse.json({ error: 'Error creando cliente' }, { status: 500 })
    }

    return NextResponse.json(client, { status: 201 })
  } catch (e) {
    console.error('Error en POST /api/clients:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
