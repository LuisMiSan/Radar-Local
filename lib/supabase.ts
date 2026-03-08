import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Solo crear cliente si las credenciales son URLs válidas
const isValidUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://')

export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper para verificar si Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null
}
