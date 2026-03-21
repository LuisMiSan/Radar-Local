// ─────────────────────────────────────────────────────────
// Cliente Supabase para el NAVEGADOR (con gestión de auth)
// ─────────────────────────────────────────────────────────
// Este cliente se usa en componentes 'use client' (navegador).
// Usa createBrowserClient que maneja las cookies de sesión
// automáticamente — cuando el usuario hace login, la cookie
// se guarda; cuando cierra sesión, se borra.
//
// Solo tiene la clave PÚBLICA (anon) — es seguro para el navegador.

import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
