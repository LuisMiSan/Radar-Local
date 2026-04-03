import type { Agente } from '@/types'
import type { AgentResult } from './types'
import { runAgent } from './index'
import { AGENT_CONFIGS } from './config'

// ══════════════════════════════════════════════════════════════
// SUPERVISOR — Orquestador que ejecuta los 11 agentes en orden
// ══════════════════════════════════════════════════════════════
//
// Flujo:
// 1. Recibe un cliente_id
// 2. Determina qué agentes ejecutar según el pack del cliente
// 3. Ejecuta cada agente en secuencia (no en paralelo, para no saturar la API)
// 4. Cada agente recibe los resultados de los anteriores (previousResults)
// 5. El reporte final tiene acceso a TODOS los resultados previos
// 6. Devuelve un resumen consolidado
//
// Orden de ejecución (lógico, cada fase depende de la anterior):
//   Fase 1 — Diagnóstico:     auditor_gbp, optimizador_nap
//   Fase 2 — Investigación:   keywords_locales
//   Fase 3 — Engagement:      gestor_resenas, redactor_posts_gbp
//   Fase 4 — GEO/AEO:         generador_schema, creador_faq_geo, generador_chunks, tldr_entidad
//   Fase 5 — Monitorización:  monitor_ias
//   Fase 6 — Consolidación:   generador_reporte (usa todos los resultados anteriores)

// Orden de ejecución de los agentes
const EXECUTION_ORDER: Agente[] = [
  // Fase 1 — Diagnóstico
  'auditor_gbp',
  'optimizador_nap',
  // Fase 1b — Prospección (audita web + captación)
  'prospector_web',
  // Fase 2 — Investigación
  'keywords_locales',
  // Fase 3 — Engagement
  'gestor_resenas',
  'redactor_posts_gbp',
  // Fase 4 — GEO/AEO
  'generador_schema',
  'creador_faq_geo',
  'generador_chunks',
  'tldr_entidad',
  // Fase 5 — Monitorización
  'monitor_ias',
  // Fase 6 — Consolidación
  'generador_reporte',
]

// Fases con nombres para el progreso
const FASES = [
  { nombre: 'Diagnóstico', agentes: ['auditor_gbp', 'optimizador_nap'] },
  { nombre: 'Prospección', agentes: ['prospector_web'] },
  { nombre: 'Investigación', agentes: ['keywords_locales'] },
  { nombre: 'Engagement', agentes: ['gestor_resenas', 'redactor_posts_gbp'] },
  { nombre: 'GEO/AEO', agentes: ['generador_schema', 'creador_faq_geo', 'generador_chunks', 'tldr_entidad'] },
  { nombre: 'Monitorización', agentes: ['monitor_ias'] },
  { nombre: 'Consolidación', agentes: ['generador_reporte'] },
] as const

export interface SupervisorProgress {
  fase_actual: string
  agente_actual: string
  completados: number
  total: number
  porcentaje: number
  resultados: AgentResult[]
  errores: { agente: string; error: string }[]
  coste_total: number
}

export interface SupervisorResult {
  estado: 'completada' | 'parcial' | 'error'
  completados: number
  errores: number
  total: number
  coste_total: number
  tareas_generadas: number
  resultados: AgentResult[]
  detalle_errores: { agente: string; error: string }[]
  resumen: string
}

// Callback para reportar progreso en tiempo real
export type OnProgress = (progress: SupervisorProgress) => void

// ── Ejecutar análisis completo ───────────────────────────────

export async function runSupervisor(
  clienteId: string,
  packCliente: string | null,
  onProgress?: OnProgress
): Promise<SupervisorResult> {
  // Filtrar agentes según el pack del cliente
  const agentesDisponibles = EXECUTION_ORDER.filter((agente) => {
    const config = AGENT_CONFIGS.find((c) => c.id === agente)
    if (!config) return false
    // Si el cliente no tiene pack, ejecutar todos (modo demo)
    if (!packCliente) return true
    return config.packs.includes(packCliente as 'visibilidad_local' | 'autoridad_maps_ia')
  })

  const resultados: AgentResult[] = []
  const errores: { agente: string; error: string }[] = []
  let costeTotal = 0
  let tareasGeneradas = 0

  console.log(`[supervisor] Iniciando análisis completo para cliente ${clienteId}`)
  console.log(`[supervisor] Pack: ${packCliente ?? 'sin pack (demo)'}`)
  console.log(`[supervisor] Agentes a ejecutar: ${agentesDisponibles.length}`)

  for (let i = 0; i < agentesDisponibles.length; i++) {
    const agente = agentesDisponibles[i]

    // Determinar fase actual
    const faseActual = FASES.find((f) => (f.agentes as readonly string[]).includes(agente))

    // Reportar progreso
    if (onProgress) {
      onProgress({
        fase_actual: faseActual?.nombre ?? 'Desconocida',
        agente_actual: agente,
        completados: i,
        total: agentesDisponibles.length,
        porcentaje: Math.round((i / agentesDisponibles.length) * 100),
        resultados,
        errores,
        coste_total: costeTotal,
      })
    }

    console.log(`[supervisor] (${i + 1}/${agentesDisponibles.length}) Ejecutando ${agente}...`)

    try {
      const result = await runAgent(agente, clienteId, resultados)
      resultados.push(result)

      if (result.estado === 'error') {
        const errorMsg = (result.datos?.error as string) ?? 'Error desconocido'
        errores.push({ agente, error: errorMsg })
        console.log(`[supervisor] ✗ ${agente} falló: ${errorMsg}`)
      } else {
        console.log(`[supervisor] ✓ ${agente} completado`)
      }

      // Acumular costes
      if (result.usage) {
        costeTotal += result.usage.coste_total
      }

      // Contar tareas generadas
      if (result.tareas) {
        tareasGeneradas += result.tareas.length
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error inesperado'
      errores.push({ agente, error: errorMsg })
      console.error(`[supervisor] ✗ ${agente} excepción:`, error)
      // Continuamos con el siguiente agente — no rompemos la cadena
    }
  }

  // Determinar estado final
  const completados = agentesDisponibles.length - errores.length
  const estado = errores.length === 0
    ? 'completada'
    : errores.length === agentesDisponibles.length
      ? 'error'
      : 'parcial'

  const resumen = `Análisis completo: ${completados}/${agentesDisponibles.length} agentes OK, ${errores.length} errores, ${tareasGeneradas} tareas generadas. Coste: $${costeTotal.toFixed(4)}`

  console.log(`[supervisor] ${resumen}`)

  // Reportar progreso final
  if (onProgress) {
    onProgress({
      fase_actual: 'Completado',
      agente_actual: '',
      completados: agentesDisponibles.length,
      total: agentesDisponibles.length,
      porcentaje: 100,
      resultados,
      errores,
      coste_total: costeTotal,
    })
  }

  return {
    estado,
    completados,
    errores: errores.length,
    total: agentesDisponibles.length,
    coste_total: costeTotal,
    tareas_generadas: tareasGeneradas,
    resultados,
    detalle_errores: errores,
    resumen,
  }
}
