import { NextResponse } from 'next/server'
import { getAuditById } from '@/lib/audit'
import { generatePresupuesto, sendPresupuestoEmail } from '@/lib/presupuesto'

// GET /api/presupuesto?audit_id=xxx → genera y devuelve el presupuesto
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const audit_id = searchParams.get('audit_id')

  if (!audit_id) {
    return NextResponse.json({ error: 'audit_id requerido' }, { status: 400 })
  }

  const audit = await getAuditById(audit_id)
  if (!audit) {
    return NextResponse.json({ error: 'Auditoría no encontrada' }, { status: 404 })
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
  })
}

// POST /api/presupuesto → genera presupuesto y envía email mock
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { audit_id, email } = body as { audit_id: string; email?: string }

    if (!audit_id) {
      return NextResponse.json({ error: 'audit_id requerido' }, { status: 400 })
    }

    const audit = await getAuditById(audit_id)
    if (!audit) {
      return NextResponse.json({ error: 'Auditoría no encontrada' }, { status: 404 })
    }

    const presupuesto = generatePresupuesto(audit)

    if (email) {
      await sendPresupuestoEmail(email, presupuesto, audit.negocio.nombre)
    }

    return NextResponse.json({ presupuesto, ok: true })
  } catch (err) {
    console.error('[POST /api/presupuesto]', err)
    return NextResponse.json({ error: 'Error al generar presupuesto' }, { status: 500 })
  }
}
