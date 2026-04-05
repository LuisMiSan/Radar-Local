import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/landing-config — Read landing page config
export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ config: null, source: 'defaults' })
  }

  try {
    const { data } = await supabaseAdmin
      .from('configuracion')
      .select('valor')
      .eq('clave', 'landing_config')
      .maybeSingle()

    if (data?.valor) {
      return NextResponse.json({ config: data.valor, source: 'db' })
    }

    return NextResponse.json({ config: null, source: 'defaults' })
  } catch {
    return NextResponse.json({ config: null, source: 'defaults' })
  }
}

// POST /api/landing-config — Save landing page config
export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'No database connection' }, { status: 500 })
  }

  try {
    const { config } = await req.json()
    if (!config) {
      return NextResponse.json({ error: 'Missing config' }, { status: 400 })
    }

    // Upsert into configuracion table
    const { error } = await supabaseAdmin
      .from('configuracion')
      .upsert(
        { clave: 'landing_config', valor: config, updated_at: new Date().toISOString() },
        { onConflict: 'clave' }
      )

    if (error) {
      console.error('[landing-config] Error saving:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[landing-config] Error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
