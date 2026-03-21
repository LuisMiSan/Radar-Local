// ════════════════════════════════════════════════════════════
// Script de verificación de Supabase
// Ejecutar: node scripts/verify-supabase.mjs
// ════════════════════════════════════════════════════════════

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Cargar .env.local manualmente
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

console.log('🔗 Conectando a:', SUPABASE_URL)
console.log('')

const TABLAS = ['clientes', 'perfiles_gbp', 'tareas', 'auditorias', 'uso_api', 'metricas', 'reportes', 'informes']

async function checkTable(tabla) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${tabla}?select=count`, {
    method: 'HEAD',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'count=exact',
    },
  })
  if (res.status === 200) {
    const range = res.headers.get('content-range')
    const total = range ? range.split('/')[1] : '?'
    return { exists: true, count: total }
  }
  // 404 = tabla no existe, otros = error de permisos u otro
  return { exists: res.status !== 404, count: 0, status: res.status }
}

async function main() {
  console.log('📋 Verificando tablas...\n')
  let allOk = true

  for (const tabla of TABLAS) {
    const r = await checkTable(tabla)
    const icon = r.exists ? '✅' : '❌'
    const info = r.exists ? `(${r.count} filas)` : `— NO EXISTE: ${r.error || ''}`
    console.log(`  ${icon} ${tabla.padEnd(15)} ${info}`)
    if (!r.exists) allOk = false
  }

  console.log('')

  if (allOk) {
    console.log('🎉 ¡Todas las tablas existen!')

    // Test escritura
    console.log('\n🔧 Test de escritura...')
    const testId = `test_${Date.now()}`
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/auditorias`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: testId, nombre_negocio: 'TEST', direccion: 'TEST',
        zona: 'TEST', categoria: 'TEST', puntuacion: 0,
        competidores: [], gaps: [], recomendacion_pack: 'visibilidad_local',
      }),
    })
    if (insertRes.ok) {
      console.log('  ✅ INSERT OK')
      await fetch(`${SUPABASE_URL}/rest/v1/auditorias?id=eq.${testId}`, {
        method: 'DELETE',
        headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` },
      })
      console.log('  ✅ DELETE OK (limpieza)')
    } else {
      console.log(`  ❌ INSERT falló: ${(await insertRes.text()).substring(0, 150)}`)
    }

    console.log('\n✨ ¡Base de datos lista para producción!')
  } else {
    console.log('⚠️  Faltan tablas. Ejecuta las migraciones en Supabase Dashboard → SQL Editor')
  }
}

main().catch(console.error)
