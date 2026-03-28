import { NextRequest, NextResponse } from 'next/server'
import { tomarSnapshot, getSnapshots, getResumenEvolucion } from '@/lib/snapshots'
import { getClientById } from '@/lib/clients'
import { getProfileByClient } from '@/lib/profiles'

// POST /api/snapshots — Tomar snapshot del día
export async function POST(request: NextRequest) {
  let body: { clienteId?: string; notas?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { clienteId, notas } = body
  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
  }

  // Validar UUID
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_REGEX.test(clienteId)) {
    return NextResponse.json({ error: 'clienteId debe ser UUID válido' }, { status: 400 })
  }

  // Obtener datos del cliente y perfil GBP
  const cliente = await getClientById(clienteId)
  if (!cliente) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  const perfilGbp = await getProfileByClient(clienteId)

  // Usar nombre GBP si existe (es el que aparece en Google), sino negocio
  const nombreBusqueda = perfilGbp?.nombre_gbp ?? cliente.negocio
  const zona = cliente.direccion?.split(',').pop()?.trim() ?? ''
  const snapshot = await tomarSnapshot(clienteId, nombreBusqueda, zona, notas)

  if (!snapshot) {
    return NextResponse.json(
      { error: 'No se pudo tomar el snapshot. Verifica que el negocio aparece en Google Places.' },
      { status: 500 }
    )
  }

  return NextResponse.json(snapshot)
}

// GET /api/snapshots?clienteId=xxx&dias=30
export async function GET(request: NextRequest) {
  const clienteId = request.nextUrl.searchParams.get('clienteId')
  const dias = parseInt(request.nextUrl.searchParams.get('dias') ?? '90')
  const resumen = request.nextUrl.searchParams.get('resumen') === 'true'

  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
  }

  if (resumen) {
    const data = await getResumenEvolucion(clienteId)
    return NextResponse.json(data)
  }

  const snapshots = await getSnapshots(clienteId, dias)
  return NextResponse.json(snapshots)
}
