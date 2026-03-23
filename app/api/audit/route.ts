import { NextRequest, NextResponse } from 'next/server'
import { runAudit, saveAudit, getAuditById } from '@/lib/audit'
import type { AuditFormData } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Falta parámetro: id' },
        { status: 400 }
      )
    }

    const auditResult = await getAuditById(id)

    if (!auditResult) {
      return NextResponse.json(
        { error: 'Auditoría no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(auditResult, { status: 200 })
  } catch (error) {
    console.error('[API /audit GET] Error:', error)
    return NextResponse.json(
      { error: 'Error al recuperar la auditoría' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validar campos requeridos
    const { nombre_negocio, categoria, direccion, zona, nombre_contacto, puesto, email, telefono, competidor1, competidor2 } = body

    if (!nombre_negocio || !categoria || !direccion || !zona || !email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (nombre_negocio, categoria, direccion, zona, email)' },
        { status: 400 }
      )
    }

    // Construir AuditFormData
    const formData: AuditFormData = {
      nombre_negocio,
      categoria,
      direccion,
      zona,
      nombre_contacto: nombre_contacto || '',
      puesto: puesto || '',
      email,
      telefono: telefono || '',
      competidor1: competidor1 || 'Competidor 1',
      competidor2: competidor2 || 'Competidor 2',
    }

    // Ejecutar auditoría
    const auditResult = await runAudit(formData)

    // Guardar en Supabase (o in-memory como fallback)
    const auditId = await saveAudit(auditResult)

    // Devolver audit ID para redirección
    return NextResponse.json(
      {
        success: true,
        id: auditId,
        message: 'Auditoría completada correctamente',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API /audit] Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la auditoría' },
      { status: 500 }
    )
  }
}
