import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// POST /api/clients/[id]/gbp — Crear o actualizar perfil GBP
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
  }

  const body = await request.json()

  // Check if profile already exists
  const { data: existing } = await supabaseAdmin
    .from('perfiles_gbp')
    .select('id')
    .eq('cliente_id', id)
    .maybeSingle()

  if (existing) {
    // Update
    const { data, error } = await supabaseAdmin
      .from('perfiles_gbp')
      .update(body)
      .eq('cliente_id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Create
  const { data, error } = await supabaseAdmin
    .from('perfiles_gbp')
    .insert({ cliente_id: id, ...body })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// GET /api/clients/[id]/gbp — Obtener perfil GBP
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin
    .from('perfiles_gbp')
    .select('*')
    .eq('cliente_id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
