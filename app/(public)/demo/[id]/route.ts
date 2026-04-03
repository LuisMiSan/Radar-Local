// ─────────────────────────────────────────────────────────
// DEMO PAGE — Sirve páginas demo generadas por prospector_web
// ─────────────────────────────────────────────────────────
// GET /demo/[id]
// Busca en contenido_generado el HTML de tipo 'demo_web'
// y lo sirve directamente como text/html.

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!supabaseAdmin) {
    return new NextResponse('Servicio no disponible', { status: 503 })
  }

  const { data, error } = await supabaseAdmin
    .from('contenido_generado')
    .select('contenido, titulo, cliente_id')
    .eq('id', id)
    .eq('tipo', 'demo_web')
    .maybeSingle()

  if (error || !data) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Demo no encontrada</title></head>
      <body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5">
      <div style="text-align:center"><h1>Demo no disponible</h1><p>Esta página demo ha expirado o no existe.</p>
      <a href="https://radar-local.vercel.app" style="color:#6366f1">Visitar Radar Local</a></div></body></html>`,
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  // Registrar visita (no bloquea)
  void supabaseAdmin
    .from('contenido_generado')
    .update({ estado: 'publicado' })
    .eq('id', id)

  return new NextResponse(data.contenido, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
