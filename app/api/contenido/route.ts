import { NextRequest, NextResponse } from 'next/server'
import { getContenido, getContenidoStats, marcarPublicado } from '@/lib/content-library'

// GET /api/contenido?clienteId=xxx&tipo=faq_voz&categoria=voz
export async function GET(request: NextRequest) {
  const clienteId = request.nextUrl.searchParams.get('clienteId')
  const stats = request.nextUrl.searchParams.get('stats') === 'true'

  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
  }

  if (stats) {
    const data = await getContenidoStats(clienteId)
    return NextResponse.json(data)
  }

  const tipo = request.nextUrl.searchParams.get('tipo') ?? undefined
  const categoria = request.nextUrl.searchParams.get('categoria') ?? undefined
  const plataforma = request.nextUrl.searchParams.get('plataforma') ?? undefined
  const estado = request.nextUrl.searchParams.get('estado') ?? undefined
  const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '100')

  const data = await getContenido(clienteId, { tipo, categoria, plataforma, estado, limit })
  return NextResponse.json(data)
}

// PATCH /api/contenido — Marcar como publicado
export async function PATCH(request: NextRequest) {
  let body: { contenidoId?: string; publicadoEn?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  if (!body.contenidoId || !body.publicadoEn) {
    return NextResponse.json({ error: 'contenidoId y publicadoEn son requeridos' }, { status: 400 })
  }

  const ok = await marcarPublicado(body.contenidoId, body.publicadoEn)
  if (!ok) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
