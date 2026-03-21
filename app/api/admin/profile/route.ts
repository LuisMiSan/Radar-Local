import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { getAdminProfile, createAdminProfile } from '@/lib/roles'

// ══════════════════════════════════════════════════════════════
// GET /api/admin/profile — Obtener perfil del admin logueado
//
// Si es la primera vez que entra, crea su perfil automáticamente.
// El primer usuario se crea como super_admin.
// ══════════════════════════════════════════════════════════════

export async function GET() {
  const supabase = createSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const userId = session.user.id
  const email = session.user.email ?? ''

  // Intentar obtener perfil existente
  let profile = await getAdminProfile(userId)

  // Si no existe, crearlo (auto-registro)
  if (!profile) {
    // Primer usuario = super_admin, los demás = gestion por defecto
    profile = await createAdminProfile(userId, email, '', 'super_admin')
  }

  if (!profile) {
    return NextResponse.json({ error: 'No se pudo obtener/crear perfil' }, { status: 500 })
  }

  return NextResponse.json(profile)
}
