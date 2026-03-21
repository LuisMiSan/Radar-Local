import { NextRequest, NextResponse } from 'next/server'
import { sendReportEmail } from '@/lib/email'
import { supabaseAdmin } from '@/lib/supabase-admin'

// POST /api/email/send-report
// Body: { informeId, clienteId }
export async function POST(request: NextRequest) {
  try {
    const { informeId, clienteId } = await request.json()

    if (!clienteId) {
      return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }

    // Obtener datos del cliente
    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single()

    if (clienteError || !cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    if (!cliente.email) {
      return NextResponse.json({ error: 'El cliente no tiene email configurado' }, { status: 400 })
    }

    // Si hay informeId, obtener datos del informe
    let score = 0
    let highlights: string[] = []
    let month = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

    if (informeId) {
      const { data: informe } = await supabaseAdmin
        .from('informes')
        .select('*')
        .eq('id', informeId)
        .single()

      if (informe) {
        score = informe.puntuacion_gbp || 0
        month = new Date(informe.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

        // Extraer highlights del reporte
        const reporte = informe.reporte as Record<string, unknown> || {}
        if (reporte.resumen_ejecutivo) {
          const resumen = reporte.resumen_ejecutivo as Record<string, unknown>
          if (Array.isArray(resumen.logros)) {
            highlights = resumen.logros.slice(0, 5)
          } else if (Array.isArray(resumen.highlights)) {
            highlights = resumen.highlights.slice(0, 5)
          }
        }

        // Si no hay highlights del reporte, generar unos básicos
        if (highlights.length === 0) {
          if (informe.puntuacion_gbp > 0) highlights.push(`Puntuación GBP: ${informe.puntuacion_gbp}/100`)
          if (informe.consistencia_nap > 0) highlights.push(`Consistencia NAP: ${informe.consistencia_nap}%`)
          if (informe.total_resenas > 0) highlights.push(`Reseñas gestionadas: ${informe.total_resenas}`)
          if (informe.presencia_ias > 0) highlights.push(`Presencia en IAs: ${informe.presencia_ias}%`)
          if (informe.agentes_completados > 0) highlights.push(`${informe.agentes_completados} agentes ejecutados correctamente`)
        }
      }
    }

    // Enviar email
    const result = await sendReportEmail({
      to: cliente.email,
      clientName: cliente.nombre,
      businessName: cliente.negocio,
      month,
      score,
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/${clienteId}`,
      highlights,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Error al enviar email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      to: cliente.email,
      message: `Informe enviado a ${cliente.email}`,
    })
  } catch (err) {
    console.error('[API] Error enviando email:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
