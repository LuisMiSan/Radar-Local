import { NextRequest, NextResponse } from 'next/server'
import { runAudit, getAuditById } from '@/lib/audit'

// POST — ejecutar auditoría
export async function POST(request: NextRequest) {
  let body: {
    nombre_negocio?: string
    direccion?: string
    zona?: string
    categoria?: string
    telefono?: string
    email?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { nombre_negocio, direccion, zona, categoria } = body

  if (!nombre_negocio || !direccion || !zona || !categoria) {
    return NextResponse.json(
      { error: 'Campos requeridos: nombre_negocio, direccion, zona, categoria' },
      { status: 400 }
    )
  }

  const result = await runAudit({
    nombre_negocio,
    direccion,
    zona,
    categoria,
    telefono: body.telefono,
    email: body.email,
  })

  return NextResponse.json(result)
}

// GET — obtener resultado por id
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Parámetro id requerido' }, { status: 400 })
  }

  const result = await getAuditById(id)

  if (!result) {
    return NextResponse.json({ error: 'Auditoría no encontrada' }, { status: 404 })
  }

  return NextResponse.json(result)
}
