import Anthropic from '@anthropic-ai/sdk'

// Mismo patrón que lib/supabase.ts — null si no hay API key
// Usamos RADAR_ANTHROPIC_KEY porque ANTHROPIC_API_KEY está vacía en el sistema (Claude Code la define)
const apiKey = (process.env.RADAR_ANTHROPIC_KEY ?? '').trim()

export const anthropic = apiKey
  ? new Anthropic({ apiKey })
  : null

// Helper para verificar si Anthropic está configurado
export const isAnthropicConfigured = (): boolean => {
  return anthropic !== null
}
