// ─────────────────────────────────────────────────────────
// Cliente Supabase para el SERVIDOR (con gestión de auth)
// ─────────────────────────────────────────────────────────
// Se usa en middleware.ts y Server Components para verificar
// si el usuario está logueado leyendo la cookie de sesión.
//
// createServerClient necesita acceso a las cookies del request,
// por eso recibe cookieStore como parámetro.

import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServer() {
  const cookieStore = cookies()

  return createServerClient(
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
            // Esto puede fallar en Server Components (solo lectura)
            // Es normal — el middleware se encarga de actualizar cookies
          }
        },
      },
    }
  )
}
