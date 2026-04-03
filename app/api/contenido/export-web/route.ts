import { NextRequest, NextResponse } from 'next/server'
import { generarExportWeb } from '@/lib/export-web'

// GET /api/contenido/export-web?clienteId=xxx
export async function GET(request: NextRequest) {
  const clienteId = request.nextUrl.searchParams.get('clienteId')

  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
  }

  const html = await generarExportWeb(clienteId)

  if (!html) {
    return NextResponse.json({ error: 'No se pudo generar el export' }, { status: 500 })
  }

  // Si piden formato raw (para descargar)
  const format = request.nextUrl.searchParams.get('format')
  if (format === 'raw') {
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="radar-local-export.html"`,
      },
    })
  }

  return NextResponse.json({ content: html })
}
