import { NextRequest, NextResponse } from 'next/server'
import type { Agente } from '@/types'
import { runAgent } from '@/lib/agents'

// Agentes por pack (sin incluir generador_reporte)
const AGENTES_MAP_PACK: Agente[] = [
  'auditor_gbp', 'optimizador_nap', 'keywords_locales',
  'gestor_resenas', 'redactor_posts_gbp',
]

const AGENTES_GEO_AEO: Agente[] = [
  'generador_schema', 'creador_faq_geo', 'generador_chunks',
  'tldr_entidad', 'monitor_ias',
]

// POST /api/agents/run-all — Ejecutar todos los agentes de un cliente
export async function POST(request: NextRequest) {
  let body: { clienteId?: string; pack?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { clienteId, pack } = body
  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
  }

  // Validar UUID
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_REGEX.test(clienteId)) {
    return NextResponse.json({ error: 'clienteId inválido' }, { status: 400 })
  }

  // Determinar qué agentes ejecutar según el pack
  let agentesToRun: Agente[] = [...AGENTES_MAP_PACK]
  if (pack === 'autoridad_maps_ia') {
    agentesToRun = [...AGENTES_MAP_PACK, ...AGENTES_GEO_AEO]
  }

  console.log(`[run-all] Ejecutando ${agentesToRun.length} agentes para cliente ${clienteId} (pack: ${pack})`)

  // Ejecutar todos en paralelo
  const results = await Promise.allSettled(
    agentesToRun.map((agente) => runAgent(agente, clienteId))
  )

  // Mapear resultados
  const agentResults = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return {
      agente: agentesToRun[i],
      estado: 'error' as const,
      datos: { error: r.reason?.message ?? 'Error desconocido' },
      resumen: `Error en ${agentesToRun[i]}`,
    }
  })

  // Ahora ejecutar el generador de reporte CON los datos de todos los agentes
  console.log(`[run-all] Ejecutando generador_reporte con datos de ${agentResults.length} agentes...`)
  const reporteResult = await runAgent('generador_reporte', clienteId, agentResults)

  return NextResponse.json({
    clienteId,
    pack,
    agentes: agentResults,
    reporte: reporteResult,
    completados: agentResults.filter((r) => r.estado === 'completada').length,
    errores: agentResults.filter((r) => r.estado === 'error').length,
    total: agentResults.length,
  })
}
