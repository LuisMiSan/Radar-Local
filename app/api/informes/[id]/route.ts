import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/informes/[id] — Obtiene un informe completo con JSON de agentes

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 })
  }

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('informes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Informe no encontrado' }, { status: 404 })
  }

  // Parsear JSON almacenados
  return NextResponse.json({
    ...data,
    agentes: typeof data.agentes === 'string' ? JSON.parse(data.agentes) : data.agentes,
    reporte: typeof data.reporte === 'string' ? JSON.parse(data.reporte) : data.reporte,
  })
}
