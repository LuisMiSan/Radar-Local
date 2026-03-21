import postgres from 'postgres'
import { readFileSync } from 'fs'

// Leer la clave del .env.local
const envContent = readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'))
  return match ? match[1].trim() : null
}

const dbPassword = getEnv('SUPABASE_DB_PASSWORD') || getEnv('SUPABASE_SERVICE_ROLE_KEY')

// Conexión directa a PostgreSQL via Supabase pooler
const sql = postgres({
  host: 'aws-0-eu-west-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.outopbbvhsmrtcdqshvr',
  password: dbPassword,
  ssl: 'require',
  connect_timeout: 15,
})

try {
  console.log('Conectando a PostgreSQL...')

  // 1. Test connection
  const count = await sql`SELECT count(*) as n FROM clientes`
  console.log(`✅ Conectado. ${count[0].n} clientes en la tabla.`)

  // 2. Drop old constraint
  console.log('Eliminando constraint viejo...')
  await sql`ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_estado_check`
  console.log('✅ Constraint eliminado')

  // 3. Rename baja → eliminado
  const updated = await sql`UPDATE clientes SET estado = 'eliminado' WHERE estado = 'baja' RETURNING id`
  console.log(`✅ ${updated.length} filas actualizadas (baja → eliminado)`)

  // 4. Add new constraint
  console.log('Creando constraint nuevo con 9 estados...')
  await sql`ALTER TABLE clientes ADD CONSTRAINT clientes_estado_check CHECK (estado IN ('lead','contactado','llamada_info','propuesta_enviada','negociando','llamada_onboarding','activo','pausado','eliminado'))`
  console.log('✅ Constraint nuevo creado')

  // 5. Verify
  const estados = await sql`SELECT DISTINCT estado FROM clientes ORDER BY estado`
  console.log('Estados actuales:', estados.map(r => r.estado).join(', '))

  console.log('\n🎉 Migración completada exitosamente!')
} catch (e) {
  console.error('❌ Error:', e.message)
} finally {
  await sql.end()
}
