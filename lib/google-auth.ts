import 'server-only'

// ══════════════════════════════════════════════════════════════
// Google OAuth2 — Autenticación para Google Business Profile API
// ══════════════════════════════════════════════════════════════

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ''
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`
  : 'http://localhost:3000/api/auth/google/callback'

// Scopes necesarios para leer y modificar GBP
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
].join(' ')

export interface GoogleTokens {
  access_token: string
  refresh_token: string
  expires_at: number // timestamp en ms
  token_type: string
  scope: string
}

// ── Generar URL de autorizacion ─────────────────────────────

export function getGoogleAuthUrl(clienteId: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',       // Para obtener refresh_token
    prompt: 'consent',            // Forzar consent para obtener refresh_token
    state: clienteId,             // Pasamos el clienteId para saber a quién vincular
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// ── Intercambiar code por tokens ────────────────────────────

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Google OAuth error: ${JSON.stringify(error)}`)
  }

  const data = await res.json()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    token_type: data.token_type,
    scope: data.scope,
  }
}

// ── Refrescar access_token con refresh_token ────────────────

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Google refresh error: ${JSON.stringify(error)}`)
  }

  const data = await res.json()

  return {
    access_token: data.access_token,
    refresh_token: refreshToken, // Google no devuelve nuevo refresh_token en refresh
    expires_at: Date.now() + (data.expires_in * 1000),
    token_type: data.token_type,
    scope: data.scope ?? SCOPES,
  }
}

// ── Obtener token válido (refresca si expiró) ───────────────

export async function getValidToken(tokens: GoogleTokens): Promise<GoogleTokens> {
  // Si el token expira en menos de 5 minutos, refrescar
  if (Date.now() > tokens.expires_at - 5 * 60 * 1000) {
    console.log('[google-auth] Token expirado, refrescando...')
    return refreshAccessToken(tokens.refresh_token)
  }
  return tokens
}

// ── Guardar/obtener tokens en Supabase ──────────────────────

import { supabaseAdmin } from './supabase-admin'

export async function saveGoogleTokens(clienteId: string, tokens: GoogleTokens): Promise<void> {
  if (!supabaseAdmin) throw new Error('Supabase admin no disponible')

  const { error } = await supabaseAdmin
    .from('google_tokens')
    .upsert({
      cliente_id: clienteId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expires_at).toISOString(),
      scope: tokens.scope,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'cliente_id' })

  if (error) throw new Error(`Error guardando tokens: ${error.message}`)
  console.log(`[google-auth] Tokens guardados para cliente ${clienteId}`)
}

export async function getGoogleTokens(clienteId: string): Promise<GoogleTokens | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('google_tokens')
    .select('*')
    .eq('cliente_id', clienteId)
    .single()

  if (error || !data) return null

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(data.expires_at).getTime(),
    token_type: 'Bearer',
    scope: data.scope ?? SCOPES,
  }
}

// ── Obtener token válido para un cliente ─────────────────────

export async function getClientGoogleToken(clienteId: string): Promise<string | null> {
  const tokens = await getGoogleTokens(clienteId)
  if (!tokens) return null

  const validTokens = await getValidToken(tokens)

  // Si se refrescó, guardar los nuevos tokens
  if (validTokens.access_token !== tokens.access_token) {
    await saveGoogleTokens(clienteId, validTokens)
  }

  return validTokens.access_token
}
