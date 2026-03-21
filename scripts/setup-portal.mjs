// Script para verificar/crear tokens de portal para todos los clientes
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'))
  return match ? match[1].trim() : null
}

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'))

try {
  // 1. Check if portal_token column exists
  const { data: test, error: testErr } = await supabase.from('clientes').select('id, portal_token').limit(1)

  if (testErr && testErr.message.includes('portal_token')) {
    console.log('❌ Columna portal_token NO existe.')
    console.log('Ejecuta este SQL en Supabase:')
    console.log('  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS portal_token text UNIQUE DEFAULT NULL;')
    process.exit(1)
  }

  console.log('✅ Columna portal_token existe')

  // 2. Get all clients
  const { data: clients } = await supabase.from('clientes').select('id, negocio, portal_token')

  let generated = 0
  for (const c of clients || []) {
    if (!c.portal_token) {
      const token = crypto.randomBytes(24).toString('base64url')
      const { error } = await supabase.from('clientes').update({ portal_token: token }).eq('id', c.id)
      if (!error) {
        console.log(`  ✅ ${c.negocio} → /portal/${token}`)
        generated++
      } else {
        console.log(`  ❌ ${c.negocio}: ${error.message}`)
      }
    } else {
      console.log(`  ✓ ${c.negocio} → /portal/${c.portal_token}`)
    }
  }

  console.log(`\n🎉 ${generated} tokens nuevos generados. ${(clients || []).length} clientes en total.`)
  console.log('\nAbre cualquier URL de arriba en el navegador para ver el portal del cliente.')
} catch (e) {
  console.error('Error:', e.message)
}
