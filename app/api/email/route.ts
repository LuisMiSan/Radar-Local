// ─────────────────────────────────────────────────────────
// API: Enviar emails desde el admin
// ─────────────────────────────────────────────────────────
// POST /api/email
// Body: { type: "portal"|"report"|"welcome"|"custom", ...params }
//
// Solo accesible desde el admin (middleware protege /admin/*
// pero esta ruta es /api/email, así que validamos manualmente).

import { NextRequest, NextResponse } from 'next/server'
import {
  sendPortalEmail,
  sendReportEmail,
  sendWelcomeLeadEmail,
  sendCustomEmail,
} from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { type } = body

  // Validar email destino
  const to = body.to as string
  if (!to || !to.includes('@')) {
    return NextResponse.json({ error: 'Email destino inválido' }, { status: 400 })
  }

  let result: { success: boolean; error?: string }

  switch (type) {
    case 'portal':
      result = await sendPortalEmail({
        to,
        clientName: (body.clientName as string) || '',
        businessName: (body.businessName as string) || '',
        portalUrl: (body.portalUrl as string) || '',
      })
      break

    case 'report':
      result = await sendReportEmail({
        to,
        clientName: (body.clientName as string) || '',
        businessName: (body.businessName as string) || '',
        month: (body.month as string) || '',
        score: (body.score as number) || 0,
        portalUrl: (body.portalUrl as string) || '',
        highlights: (body.highlights as string[]) || [],
      })
      break

    case 'welcome':
      result = await sendWelcomeLeadEmail({
        to,
        businessName: (body.businessName as string) || '',
        auditUrl: (body.auditUrl as string) || '',
        score: (body.score as number) || 0,
      })
      break

    case 'custom':
      result = await sendCustomEmail({
        to,
        subject: (body.subject as string) || 'Mensaje de Radar Local',
        title: (body.title as string) || '',
        body: (body.body as string) || '',
        ctaText: body.ctaText as string | undefined,
        ctaUrl: body.ctaUrl as string | undefined,
      })
      break

    default:
      return NextResponse.json(
        { error: `Tipo inválido: ${type}. Válidos: portal, report, welcome, custom` },
        { status: 400 }
      )
  }

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Error enviando email' },
      { status: 500 }
    )
  }

  return NextResponse.json({ message: 'Email enviado', success: true })
}
