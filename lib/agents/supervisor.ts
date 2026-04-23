import type { Agente } from '@/types'
import type { AgentResult } from './types'
import { runAgent } from './index'
import { AGENT_CONFIGS } from './config'

// ══════════════════════════════════════════════════════════════
// SUPERVISOR — Orquestador con ejecución paralela por grupos
// ══════════════════════════════════════════════════════════════
//
// Estrategia de paralelismo (4 fases en vez de 12 llamadas secuenciales):
//
//  Grupo 1 ─── paralelo ──────────────────────────────────────────
//    auditor_gbp · optimizador_nap · prospector_web
//    gestor_resenas · tldr_entidad · monitor_ias
//    → Sin dependencias entre sí. Solo necesitan el perfil GBP del cliente.
//
//  Grupo 2 ─── paralelo (espera Grupo 1) ─────────────────────────
//    keywords_locales · generador_schema
//    → Se enriquecen con los resultados del auditor y del perfil.
//
//  Grupo 3 ─── paralelo (espera Grupo 2) ─────────────────────────
//    redactor_posts_gbp · creador_faq_geo · generador_chunks
//    → Necesitan las keywords para optimizar el contenido.
//
//  Grupo 4 ─── serie (espera todos) ──────────────────────────────
//    generador_reporte
//    → Consume TODOS los resultados anteriores para el informe final.
//
// Concurrencia máxima: 3 llamadas simultáneas a la API de Claude
// (evita saturar rate limits de Anthropic)

type GrupoEjecucion = {
  nombre: string
  agentes: Agente[]
}

const GRUPOS: GrupoEjecucion[] = [
  {
    nombre: 'Diagnóstico y Monitorización',
    agentes: ['auditor_gbp', 'optimizador_nap', 'prospector_web', 'gestor_resenas', 'tldr_entidad', 'monitor_ias'],
  },
  {
    nombre: 'Investigación y Schema',
    agentes: ['keywords_locales', 'generador_schema'],
  },
  {
    nombre: 'Contenido GEO/AEO',
    agentes: ['redactor_posts_gbp', 'creador_faq_geo', 'generador_chunks'],
  },
  {
    nombre: 'Consolidación',
    agentes: ['generador_reporte'],
  },
]

// Concurrencia máxima dentro de un grupo (respeta rate limits de Anthropic)
const MAX_CONCURRENT = 3

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

export type OnProgress = (progress: SupervisorProgress) => void

// ── Pool de concurrencia ─────────────────────────────────────

async function runWithConcurrency<T>(
  items: (() => Promise<T>)[],
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = []
  const queue = [...items]
  const running: Promise<void>[] = []

  const runNext = (): Promise<void> => {
    if (queue.length === 0) return Promise.resolve()
    const task = queue.shift()!
    const p = task()
      .then((r) => { results.push({ status: 'fulfilled', value: r }) })
      .catch((e) => { results.push({ status: 'rejected', reason: e }) })
      .then(() => runNext())
    running.push(p)
    return p
  }

  // Lanzar hasta `limit` tareas en paralelo
  const initial = Math.min(limit, items.length)
  await Promise.all(Array.from({ length: initial }, runNext))

  return results
}

// ── Ejecutar un grupo de agentes con concurrencia controlada ─

async function runGrupo(
  grupo: GrupoEjecucion,
  agentesDisponibles: Set<Agente>,
  clienteId: string,
  acumulados: AgentResult[],
  onProgress?: OnProgress,
  completadosAntes?: number,
  totalAgentes?: number,
  erroresAcum?: { agente: string; error: string }[],
  costeAcum?: number
): Promise<{
  resultados: AgentResult[]
  errores: { agente: string; error: string }[]
  costeGrupo: number
}> {
  const agentesGrupo = grupo.agentes.filter((a) => agentesDisponibles.has(a))
  if (agentesGrupo.length === 0) return { resultados: [], errores: [], costeGrupo: 0 }

  const resultadosGrupo: AgentResult[] = []
  const erroresGrupo: { agente: string; error: string }[] = []
  let costeGrupo = 0

  console.log(`[supervisor] ── ${grupo.nombre} (${agentesGrupo.length} agentes en paralelo) ──`)

  if (onProgress) {
    onProgress({
      fase_actual: grupo.nombre,
      agente_actual: agentesGrupo.join(', '),
      completados: completadosAntes ?? 0,
      total: totalAgentes ?? agentesGrupo.length,
      porcentaje: Math.round(((completadosAntes ?? 0) / (totalAgentes ?? agentesGrupo.length)) * 100),
      resultados: acumulados,
      errores: erroresAcum ?? [],
      coste_total: costeAcum ?? 0,
    })
  }

  const tareas = agentesGrupo.map((agente) => async (): Promise<AgentResult> => {
    console.log(`[supervisor]   → ${agente} iniciado`)
    const result = await runAgent(agente, clienteId, acumulados)
    console.log(`[supervisor]   ✓ ${agente} completado`)
    return result
  })

  const settled = await runWithConcurrency(tareas, MAX_CONCURRENT)

  for (let i = 0; i < settled.length; i++) {
    const agente = agentesGrupo[i]
    const s = settled[i]

    if (s.status === 'fulfilled') {
      const result = s.value
      resultadosGrupo.push(result)

      if (result.estado === 'error') {
        const msg = (result.datos?.error as string) ?? 'Error desconocido'
        erroresGrupo.push({ agente, error: msg })
        console.log(`[supervisor] ✗ ${agente} falló: ${msg}`)
      }

      costeGrupo += result.usage?.coste_total ?? 0
    } else {
      const msg = s.reason instanceof Error ? s.reason.message : 'Error inesperado'
      erroresGrupo.push({ agente, error: msg })
      console.error(`[supervisor] ✗ ${agente} excepción:`, s.reason)
    }
  }

  return { resultados: resultadosGrupo, errores: erroresGrupo, costeGrupo }
}

// ── Ejecutar análisis completo ───────────────────────────────

export async function runSupervisor(
  clienteId: string,
  packCliente: string | null,
  onProgress?: OnProgress
): Promise<SupervisorResult> {
  // Conjunto de agentes disponibles para este cliente/pack
  const agentesDisponibles = new Set(
    GRUPOS.flatMap((g) => g.agentes).filter((agente) => {
      const config = AGENT_CONFIGS.find((c) => c.id === agente)
      if (!config) return false
      if (!packCliente) return true
      return config.packs.includes(packCliente as 'visibilidad_local' | 'autoridad_maps_ia')
    })
  )

  const totalAgentes = agentesDisponibles.size

  console.log(`[supervisor] Iniciando análisis completo para cliente ${clienteId}`)
  console.log(`[supervisor] Pack: ${packCliente ?? 'sin pack (demo)'}`)
  console.log(`[supervisor] Agentes: ${totalAgentes} en 4 grupos paralelos`)

  let todosResultados: AgentResult[] = []
  let todosErrores: { agente: string; error: string }[] = []
  let costeTotal = 0
  let tareasGeneradas = 0
  let completados = 0

  // Ejecutar los 4 grupos en secuencia; dentro de cada grupo, paralelismo controlado
  for (const grupo of GRUPOS) {
    const { resultados, errores, costeGrupo } = await runGrupo(
      grupo,
      agentesDisponibles,
      clienteId,
      todosResultados,        // resultados acumulados hasta ahora
      onProgress,
      completados,
      totalAgentes,
      todosErrores,
      costeTotal
    )

    todosResultados = [...todosResultados, ...resultados]
    todosErrores = [...todosErrores, ...errores]
    costeTotal += costeGrupo
    completados += resultados.length
    tareasGeneradas += resultados.reduce((sum, r) => sum + (r.tareas?.length ?? 0), 0)

    console.log(
      `[supervisor] Grupo "${grupo.nombre}" completado — ${resultados.length - errores.length}/${resultados.length} OK`
    )
  }

  // Estado final
  const estado =
    todosErrores.length === 0
      ? 'completada'
      : todosErrores.length === totalAgentes
        ? 'error'
        : 'parcial'

  const resumen = `Análisis completo: ${completados - todosErrores.length}/${totalAgentes} agentes OK, ${todosErrores.length} errores, ${tareasGeneradas} tareas generadas. Coste: $${costeTotal.toFixed(4)}`

  console.log(`[supervisor] ${resumen}`)

  if (onProgress) {
    onProgress({
      fase_actual: 'Completado',
      agente_actual: '',
      completados: totalAgentes,
      total: totalAgentes,
      porcentaje: 100,
      resultados: todosResultados,
      errores: todosErrores,
      coste_total: costeTotal,
    })
  }

  return {
    estado,
    completados: completados - todosErrores.length,
    errores: todosErrores.length,
    total: totalAgentes,
    coste_total: costeTotal,
    tareas_generadas: tareasGeneradas,
    resultados: todosResultados,
    detalle_errores: todosErrores,
    resumen,
  }
}
