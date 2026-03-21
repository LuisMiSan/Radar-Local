// ─────────────────────────────────────────────────────────
// Auth Callback — /api/auth/callback
// ─────────────────────────────────────────────────────────
// Supabase redirige aquí después de confirmar email.
// Intercambia el código temporal por una sesión real.
// No necesitas tocar este archivo, es infraestructura de Supabase.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // No-op en contexto donde cookies son read-only
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Error — redirigir a login
  return NextResponse.redirect(`${origin}/admin/login`)
}
