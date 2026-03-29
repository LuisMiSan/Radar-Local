import { NextRequest, NextResponse } from 'next/server'
import { generarLlmsTxt } from '@/lib/llms-txt'

// GET /api/contenido/llms-txt?clienteId=xxx
export async function GET(request: NextRequest) {
  const clienteId = request.nextUrl.searchParams.get('clienteId')

  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
  }

  const txt = await generarLlmsTxt(clienteId)

  if (!txt) {
    return NextResponse.json({ error: 'No se pudo generar llms.txt' }, { status: 500 })
  }

  // Si piden formato raw (para descargar)
  const format = request.nextUrl.searchParams.get('format')
  if (format === 'raw') {
    return new NextResponse(txt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="llms.txt"',
      },
    })
  }

  return NextResponse.json({ content: txt })
}
