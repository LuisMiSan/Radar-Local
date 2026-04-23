// Autenticación A2A para white label
// Formato de API key: rl_<base64url> (prefijo "rl" de Radar Local)
// Las keys se almacenan hasheadas en Supabase — nunca en texto plano.

import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export interface ApiKeyContext {
  keyId: string
  nombreAgencia: string
  rateLimitPerHour: number
}

// Rate limiter en memoria — suficiente para v1 (se resetea en redeploy)
// Clave: keyId | Valor: { count, resetAt (timestamp ms) }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

// Valida el header Authorization y devuelve el contexto si es válido
export async function validateA2AKey(authHeader: string | null): Promise<ApiKeyContext | null> {
  if (!authHeader?.startsWith('Bearer rl_')) return null

  const key = authHeader.slice(7) // quita "Bearer "
  const hash = hashKey(key)

  if (!supabaseAdmin) return null

  const { data } = await supabaseAdmin
    .from('a2a_api_keys')
    .select('id, nombre_agencia, activa, rate_limit_per_hour, llamadas_totales')
    .eq('key_hash', hash)
    .eq('activa', true)
    .maybeSingle()

  if (!data) return null

  // Verificar rate limit
  const now = Date.now()
  const hourMs = 60 * 60 * 1000
  const state = rateLimitMap.get(data.id) ?? { count: 0, resetAt: now + hourMs }

  if (now > state.resetAt) {
    state.count = 0
    state.resetAt = now + hourMs
  }

  state.count++
  rateLimitMap.set(data.id, state)

  const limit: number = data.rate_limit_per_hour ?? 10
  if (state.count > limit) return null

  // Registrar uso (no bloquea la respuesta)
  void supabaseAdmin
    .from('a2a_api_keys')
    .update({
      llamadas_totales: (data.llamadas_totales as number ?? 0) + 1,
      ultima_llamada: new Date().toISOString(),
    })
    .eq('id', data.id)

  return {
    keyId: data.id as string,
    nombreAgencia: data.nombre_agencia as string,
    rateLimitPerHour: limit,
  }
}

// Genera una nueva API key (devuelve el valor en texto plano — solo se muestra una vez)
export function generateApiKey(): string {
  const random = crypto.randomBytes(24).toString('base64url')
  return `rl_${random}`
}

export function hashApiKey(key: string): string {
  return hashKey(key)
}
