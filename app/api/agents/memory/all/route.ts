import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/agents/memory/all?clienteId=xxx&limit=50
// Devuelve historial de TODOS los agentes para un cliente
export async function GET(request: NextRequest) {
  const clienteId = request.nextUrl.searchParams.get('clienteId')
  const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '50')

  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json([], { status: 200 })
  }

  const { data, error } = await supabaseAdmin
    .from('agent_memory')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[agent-memory-all] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
