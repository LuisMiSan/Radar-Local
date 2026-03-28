import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/agents'
import type { AgentResult } from '@/lib/agents/types'
import type { Agente } from '@/types'

// ══════════════════════════════════════════════════════════════
// PIPELINE DE VOZ — Encadena agentes para optimización de voz
//
// Ejecuta en secuencia:
// 1. creador_faq_geo    → FAQs para asistentes de voz
// 2. generador_chunks   → Chunks citables para LLMs
// 3. tldr_entidad       → Perfil de entidad para LLMs
// 4. generador_schema   → Schema JSON-LD (FAQPage + LocalBusiness)
// 5. monitor_ias        → Verificar presencia en IAs
//
// Cada agente recibe los resultados de los anteriores como contexto.
// Las tareas tipo "auto" se ejecutan automáticamente y el contenido
// se guarda en la librería.
// ══════════════════════════════════════════════════════════════

const PIPELINE_AGENTS: Agente[] = [
  'creador_faq_geo',
  'generador_chunks',
  'tldr_entidad',
  'generador_schema',
  'monitor_ias',
]

const PIPELINE_NAMES: Record<string, string> = {
  creador_faq_geo: '1/5 — FAQs de voz',
  generador_chunks: '2/5 — Chunks citables',
  tldr_entidad: '3/5 — TL;DR de entidad',
  generador_schema: '4/5 — Schema JSON-LD',
  monitor_ias: '5/5 — Monitor presencia IA',
}

export async function POST(request: NextRequest) {
  let body: { clienteId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { clienteId } = body
  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_REGEX.test(clienteId)) {
    return NextResponse.json({ error: 'clienteId debe ser UUID válido' }, { status: 400 })
  }

  console.log(`[pipeline-voz] ══════ Iniciando pipeline de voz para ${clienteId} ══════`)

  const results: AgentResult[] = []
  const errors: string[] = []
  let totalCost = 0
  let totalTareas = 0

  for (const agente of PIPELINE_AGENTS) {
    const stepName = PIPELINE_NAMES[agente] ?? agente
    console.log(`[pipeline-voz] → ${stepName}...`)

    try {
      // Pasar resultados anteriores para que cada agente tenga contexto
      const result = await runAgent(agente, clienteId, results.length > 0 ? results : undefined)
      results.push(result)

      if (result.usage) {
        totalCost += result.usage.coste_total
      }
      if (result.tareas) {
        totalTareas += result.tareas.length
      }

      console.log(`[pipeline-voz] ✓ ${stepName} completado — ${result.tareas?.length ?? 0} tareas, $${result.usage?.coste_total.toFixed(4) ?? '0'}`)
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error desconocido'
      errors.push(`${stepName}: ${errorMsg}`)
      console.error(`[pipeline-voz] ✗ ${stepName} falló:`, errorMsg)

      // Seguir con el siguiente agente aunque uno falle
      results.push({
        agente,
        estado: 'error',
        datos: { error: errorMsg },
        resumen: `Error en ${stepName}: ${errorMsg}`,
      })
    }
  }

  const exitosos = results.filter(r => r.estado === 'completada').length

  console.log(`[pipeline-voz] ══════ Pipeline completado: ${exitosos}/${PIPELINE_AGENTS.length} agentes OK, ${totalTareas} tareas, $${totalCost.toFixed(4)} ══════`)

  return NextResponse.json({
    pipeline: 'voz',
    cliente_id: clienteId,
    agentes_total: PIPELINE_AGENTS.length,
    agentes_exitosos: exitosos,
    agentes_fallidos: errors.length,
    tareas_generadas: totalTareas,
    coste_total: Math.round(totalCost * 1_000_000) / 1_000_000,
    resultados: results.map(r => ({
      agente: r.agente,
      estado: r.estado,
      resumen: r.resumen,
      tareas: r.tareas?.length ?? 0,
      coste: r.usage?.coste_total ?? 0,
    })),
    errors: errors.length > 0 ? errors : undefined,
  })
}
