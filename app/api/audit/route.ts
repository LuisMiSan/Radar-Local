import { NextRequest, NextResponse } from 'next/server'
import { runAudit, getAuditById, checkDuplicate } from '@/lib/audit'

// --- Helpers de validación ---

// Limpia un string: quita espacios extra y limita longitud
function sanitize(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

// Valida formato básico de email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Valida formato de ID de auditoría (audit_TIMESTAMP_RANDOM)
function isValidAuditId(id: string): boolean {
  return /^audit_\d+_[a-z0-9]+$/.test(id)
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Falta el parámetro id' }, { status: 400 })
  }

  // Validar formato del ID para evitar inyección
  if (!isValidAuditId(id)) {
    return NextResponse.json({ error: 'Formato de ID inválido' }, { status: 400 })
  }

  const result = await getAuditById(id)
  if (!result) {
    return NextResponse.json(
      { error: 'Auditoría no encontrada' },
      { status: 404 }
    )
  }
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Sanitizar inputs: quitar espacios y limitar longitud
    const nombre_negocio = sanitize(body.nombre_negocio, 200)
    const direccion = sanitize(body.direccion, 300)
    const zona = sanitize(body.zona, 100)
    const categoria = sanitize(body.categoria, 100)
    const nombre_contacto = sanitize(body.nombre_contacto, 200)
    const puesto = sanitize(body.puesto, 100)
    const telefono = sanitize(body.telefono, 20)
    const email = sanitize(body.email, 254)

    // Validar campos obligatorios
    if (!nombre_negocio || !direccion || !zona || !categoria ||
        !nombre_contacto || !puesto || !telefono || !email) {
      return NextResponse.json(
        { error: 'Todos los campos marcados con * son obligatorios' },
        { status: 400 }
      )
    }

    // Validar email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      )
    }

    // Sanitizar campos opcionales (competidores)
    const competidor1 = sanitize(body.competidor1, 200)
    const competidor2 = sanitize(body.competidor2, 200)

    // Verificar duplicados (1 auditoría por persona, excepto admin)
    const duplicateMsg = await checkDuplicate({
      nombre_negocio,
      direccion,
      zona,
      categoria,
      nombre_contacto,
      puesto,
      telefono,
      email,
    })
    if (duplicateMsg) {
      return NextResponse.json(
        { error: duplicateMsg },
        { status: 409 }
      )
    }

    const result = await runAudit({
      nombre_negocio,
      direccion,
      zona,
      categoria,
      nombre_contacto,
      puesto,
      telefono,
      email,
      competidor1: competidor1 || undefined,
      competidor2: competidor2 || undefined,
    })

    return NextResponse.json({ id: result.id }, { status: 201 })
  } catch (error) {
    console.error('[api/audit] Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la auditoría' },
      { status: 500 }
    )
  }
}
