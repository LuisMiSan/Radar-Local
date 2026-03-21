// Genera y muestra los links del portal para todos los clientes
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'))
  return match ? match[1].trim() : null
}

const PORTAL_SECRET = getEnv('PORTAL_SECRET') || 'radar-local-portal-dev-secret-2025'
const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'))

function generateToken(clienteId) {
  return crypto.createHmac('sha256', PORTAL_SECRET).update(clienteId).digest('base64url').slice(0, 32)
}

const { data: clients } = await supabase.from('clientes').select('id, negocio, estado')

console.log('\n📋 Links del Portal del Cliente\n')
console.log('─'.repeat(80))
for (const c of clients || []) {
  const token = generateToken(c.id)
  console.log(`  ${c.negocio.padEnd(30)} | ${c.estado.padEnd(15)} | /portal/${token}`)
}
console.log('─'.repeat(80))
console.log(`\nAbre: http://localhost:3000/portal/<token> para probar`)
