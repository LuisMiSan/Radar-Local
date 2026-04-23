import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateApiKey, hashApiKey } from '@/lib/a2a/auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Verifica que el solicitante es super_admin
async function isSuperAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false

  const { data } = await supabase
    .from('admin_profiles')
    .select('rol')
    .eq('id', session.user.id)
    .single()

  return data?.rol === 'super_admin'
}

// GET /api/admin/a2a-keys — Listar todas las keys
export async function GET() {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin
    .from('a2a_api_keys')
    .select('id, nombre_agencia, activa, rate_limit_per_hour, llamadas_totales, ultima_llamada, notas, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ keys: data })
}

// POST /api/admin/a2a-keys — Crear nueva API key
// Body: { nombre_agencia: string, rate_limit_per_hour?: number, notas?: string }
export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
  }

  const body = await req.json() as {
    nombre_agencia?: string
    rate_limit_per_hour?: number
    notas?: string
  }

  if (!body.nombre_agencia?.trim()) {
    return NextResponse.json({ error: 'nombre_agencia es requerido' }, { status: 400 })
  }

  const plainKey = generateApiKey()
  const keyHash = hashApiKey(plainKey)

  const { data, error } = await supabaseAdmin
    .from('a2a_api_keys')
    .insert({
      nombre_agencia: body.nombre_agencia.trim(),
      key_hash: keyHash,
      rate_limit_per_hour: body.rate_limit_per_hour ?? 10,
      notas: body.notas ?? null,
    })
    .select('id, nombre_agencia, rate_limit_per_hour, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // La key en texto plano se devuelve UNA SOLA VEZ — no se puede recuperar después
  return NextResponse.json({
    ...data,
    api_key: plainKey,
    aviso: 'Guarda esta API key ahora. No se puede recuperar después.',
  }, { status: 201 })
}

// DELETE /api/admin/a2a-keys — Revocar una key
// Body: { id: string }
export async function DELETE(req: NextRequest) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
  }

  const { id } = await req.json() as { id?: string }
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('a2a_api_keys')
    .update({ activa: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, mensaje: 'API key revocada' })
}
