import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CambioDetectado } from '@/types'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/vigilante/cambios?estado=pending&limit=50
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado') // null = todos
  const limit = parseInt(searchParams.get('limit') ?? '50')

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('cambios_detectados')
    .select('*')
    .order('fecha_deteccion', { ascending: false })
    .limit(limit)

  if (estado) query = query.eq('estado', estado)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data as CambioDetectado[])
}
