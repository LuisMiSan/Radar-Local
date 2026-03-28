import { NextRequest, NextResponse } from 'next/server'
import { getContenido, getContenidoStats, marcarPublicado, actualizarContenido, descartarContenido } from '@/lib/content-library'

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

// PUT /api/contenido — Editar contenido
export async function PUT(request: NextRequest) {
  let body: { contenidoId?: string; titulo?: string; contenido?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  if (!body.contenidoId) {
    return NextResponse.json({ error: 'contenidoId es requerido' }, { status: 400 })
  }

  const campos: { titulo?: string; contenido?: string } = {}
  if (body.titulo) campos.titulo = body.titulo
  if (body.contenido) campos.contenido = body.contenido

  if (Object.keys(campos).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const ok = await actualizarContenido(body.contenidoId, campos)
  if (!ok) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// PATCH /api/contenido — Marcar como publicado o descartar
export async function PATCH(request: NextRequest) {
  let body: { contenidoId?: string; publicadoEn?: string; accion?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  if (!body.contenidoId) {
    return NextResponse.json({ error: 'contenidoId es requerido' }, { status: 400 })
  }

  // Descartar contenido
  if (body.accion === 'descartar') {
    const ok = await descartarContenido(body.contenidoId)
    if (!ok) {
      return NextResponse.json({ error: 'No se pudo descartar' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  // Marcar como publicado
  if (!body.publicadoEn) {
    return NextResponse.json({ error: 'publicadoEn es requerido' }, { status: 400 })
  }

  const ok = await marcarPublicado(body.contenidoId, body.publicadoEn)
  if (!ok) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
