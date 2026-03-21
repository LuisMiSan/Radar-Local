// ─────────────────────────────────────────────────────────
// Cliente Supabase PRIVADO (service_role) — SOLO SERVIDOR
// ─────────────────────────────────────────────────────────
// 'server-only' hace que Next.js dé ERROR si alguien intenta
// importar este archivo desde un componente 'use client'.
// Así es imposible que la clave secreta llegue al navegador.
import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const isValidUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://')

// Cliente PRIVADO (service_role) — para ESCRITURA (INSERT/UPDATE/DELETE)
// Esta clave es SECRETA, solo existe en el servidor, NUNCA se envía al navegador
// Con esta clave, Supabase ignora las políticas RLS (tiene acceso total)
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey && isValidUrl(supabaseUrl)
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null
