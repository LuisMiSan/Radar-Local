import Anthropic from '@anthropic-ai/sdk'

// Mismo patrón que lib/supabase.ts — null si no hay API key
const apiKey = process.env.ANTHROPIC_API_KEY ?? ''

export const anthropic = apiKey
  ? new Anthropic({ apiKey })
  : null

// Helper para verificar si Anthropic está configurado
export const isAnthropicConfigured = (): boolean => {
  return anthropic !== null
}
