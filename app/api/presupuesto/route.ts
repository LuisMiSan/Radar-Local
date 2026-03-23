import { NextRequest, NextResponse } from 'next/server'
import { getAuditById } from '@/lib/audit'
import { generatePresupuesto, savePresupuesto } from '@/lib/presupuesto'
import { sendPresupuestoCompleteEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const auditId = searchParams.get('audit_id')

    if (!auditId) {
      return NextResponse.json(
        { error: 'Falta parámetro audit_id' },
        { status: 400 }
      )
    }

    // Obtener auditoría
    const auditResult = await getAuditById(auditId)
    if (!auditResult) {
      return NextResponse.json(
        { error: 'Auditoría no encontrada' },
        { status: 404 }
      )
    }

    // Generar presupuesto (es_fundador: false por defecto en mock)
    const presupuesto = generatePresupuesto(
      auditId,
      auditResult,
      false
    )

    // Guardar presupuesto
    savePresupuesto(presupuesto)

    return NextResponse.json(
      {
        success: true,
        presupuesto_id: auditId,
        presupuesto,
        negocio: auditResult.negocio,
        email: auditResult.email,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API /presupuesto GET] Error:', error)
    return NextResponse.json(
      { error: 'Error al cargar el presupuesto' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { audit_id, email } = body

    if (!audit_id || !email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (audit_id, email)' },
        { status: 400 }
      )
    }

    // Obtener auditoría y presupuesto
    const auditResult = await getAuditById(audit_id)
    if (!auditResult) {
      return NextResponse.json(
        { error: 'Auditoría no encontrada' },
        { status: 404 }
      )
    }

    // Generar presupuesto
    const presupuesto = generatePresupuesto(
      audit_id,
      auditResult,
      false
    )

    // Construir URL base para los enlaces del email
    const baseUrl = req.headers.get('origin') || req.headers.get('host') || 'http://localhost:3000'
    const auditUrl = `${baseUrl.startsWith('http') ? baseUrl : 'https://' + baseUrl}/auditoria/${audit_id}`

    // Enviar email real con Resend (o simulado si no hay API key)
    const emailResult = await sendPresupuestoCompleteEmail({
      to: email,
      contactName: auditResult.nombre_contacto || 'Cliente',
      businessName: auditResult.negocio.nombre,
      zona: auditResult.negocio.zona,
      score: auditResult.negocio.puntuacion,
      competidores: auditResult.competidores.map(c => ({
        nombre: c.nombre,
        puntuacion: c.puntuacion,
      })),
      gaps: auditResult.gaps.map(g => ({
        area: g.area,
        impacto: g.impacto,
      })),
      pack: presupuesto.pack_recomendado,
      precioMensual: presupuesto.precio_mensual,
      precioFundador: presupuesto.precio_fundador,
      roi: presupuesto.roi_proyecciones,
      features: presupuesto.features_incluidas,
      mejoras: presupuesto.mejoras_esperadas,
      auditUrl,
      auditResult,
      presupuesto,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Error al enviar email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Presupuesto enviado correctamente',
        audit_id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API /presupuesto POST] Error:', error)
    return NextResponse.json(
      { error: 'Error al enviar el presupuesto' },
      { status: 500 }
    )
  }
}
