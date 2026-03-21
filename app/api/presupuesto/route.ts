import { NextRequest, NextResponse } from 'next/server'
import { getAuditById } from '@/lib/audit'
import { generatePresupuesto, sendEmail } from '@/lib/presupuesto'
import { createLeadFromAudit } from '@/lib/clients'
import { sendWelcomeLeadEmail } from '@/lib/email'

// Valida formato de ID de auditoría
function isValidAuditId(id: string): boolean {
  return /^audit_\d+_[a-z0-9]+$/.test(id)
}

// Valida formato básico de email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function GET(request: NextRequest) {
  const auditId = request.nextUrl.searchParams.get('audit_id')
  if (!auditId) {
    return NextResponse.json(
      { error: 'Falta el parámetro audit_id' },
      { status: 400 }
    )
  }

  // Validar formato del ID
  if (!isValidAuditId(auditId)) {
    return NextResponse.json(
      { error: 'Formato de audit_id inválido' },
      { status: 400 }
    )
  }

  const audit = await getAuditById(auditId)
  if (!audit) {
    return NextResponse.json(
      { error: 'Auditoría no encontrada. Puede haber caducado.' },
      { status: 404 }
    )
  }
  const presupuesto = generatePresupuesto(audit)
  return NextResponse.json({
    presupuesto,
    negocio: {
      nombre: audit.negocio.nombre,
      zona: audit.negocio.zona,
      categoria: audit.negocio.categoria,
      puntuacion: audit.negocio.puntuacion,
    },
    email: audit.email,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const audit_id = typeof body.audit_id === 'string' ? body.audit_id.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : ''

    if (!audit_id || !email) {
      return NextResponse.json(
        { error: 'Campos obligatorios: audit_id, email' },
        { status: 400 }
      )
    }

    // Validar formato del ID
    if (!isValidAuditId(audit_id)) {
      return NextResponse.json(
        { error: 'Formato de audit_id inválido' },
        { status: 400 }
      )
    }

    // Validar formato del email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      )
    }

    const audit = await getAuditById(audit_id)
    if (!audit) {
      return NextResponse.json(
        { error: 'Auditoría no encontrada' },
        { status: 404 }
      )
    }
    const presupuesto = generatePresupuesto(audit)
    sendEmail(email, presupuesto)

    // AUTO-CONVERSIÓN: Crear lead en el CRM automáticamente
    // Usa los datos de contacto que se guardaron en la auditoría
    await createLeadFromAudit(audit, {
      nombre_contacto: audit.nombre_contacto || '',
      puesto: audit.puesto || '',
      telefono: audit.telefono || '',
      email,
    })

    // EMAIL AUTOMÁTICO: Enviar resultado de auditoría al lead
    const baseUrl = request.nextUrl.origin
    await sendWelcomeLeadEmail({
      to: email,
      businessName: audit.negocio.nombre,
      auditUrl: `${baseUrl}/auditoria/${audit.id}`,
      score: audit.negocio.puntuacion,
    }).catch(err => console.error('[Email] Error enviando welcome:', err))

    return NextResponse.json({ ok: true, message: 'Presupuesto enviado' })
  } catch (error) {
    console.error('[api/presupuesto] Error:', error)
    return NextResponse.json(
      { error: 'Error al enviar el presupuesto' },
      { status: 500 }
    )
  }
}
