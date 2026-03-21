import 'server-only'
import { anthropic } from '@/lib/anthropic'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  marcarEjecutando,
  completarTarea,
  fallarTarea,
} from '@/lib/tareas-ejecucion'
import { registrarGasto } from '@/lib/gastos'
import type { TareaEjecucion } from '@/types'

// ════════════════════════════════════════════════════════════
// EXECUTOR — Motor de ejecución de tareas aprobadas
//
// Flujo:
//   Tarea aprobada → marcar "ejecutando" → Claude genera solución
//   → guardar resultado → marcar "completada" | "fallo"
//
// Sin API de GBP por ahora, el executor GENERA el contenido
// (descripción, posts, FAQs, etc.) y lo guarda como resultado.
// Cuando tengamos la API de GBP, se añade el paso de push.
// ════════════════════════════════════════════════════════════

// Precios por millón de tokens
const PRICING = {
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4 },
}

const EXECUTOR_MODEL = 'claude-sonnet-4-6'

// ── Ejecutar una tarea individual ────────────────────────────

export async function ejecutarTarea(
  tarea: TareaEjecucion
): Promise<{ ok: boolean; resultado: string; coste?: number }> {
  // 1. Marcar como ejecutando
  const marcada = await marcarEjecutando(tarea.id)
  if (!marcada) {
    return { ok: false, resultado: 'No se pudo marcar como ejecutando' }
  }

  console.log(`[executor] Ejecutando tarea: ${tarea.titulo} (${tarea.id})`)

  // 2. Sin API key → simular ejecución
  if (!anthropic) {
    console.log('[executor] Sin API key → simulando ejecución')
    await new Promise((r) => setTimeout(r, 500))
    const resultado = `[SIMULADO] Tarea "${tarea.titulo}" ejecutada correctamente. Valor propuesto: ${tarea.valor_propuesto ?? 'N/A'}`
    await completarTarea(tarea.id, resultado)
    return { ok: true, resultado }
  }

  // 3. Construir prompt de ejecución
  const { systemPrompt, userPrompt } = buildExecutionPrompt(tarea)

  try {
    const message = await anthropic.messages.create({
      model: EXECUTOR_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    const rawText = textBlock?.text ?? ''

    // Calcular coste
    const prices = PRICING[EXECUTOR_MODEL as keyof typeof PRICING] ?? PRICING['claude-sonnet-4-6']
    const coste = (message.usage.input_tokens / 1_000_000) * prices.input
      + (message.usage.output_tokens / 1_000_000) * prices.output

    // Parsear resultado
    let resultado: string
    try {
      const parsed = parseJsonResponse(rawText)
      resultado = JSON.stringify(parsed, null, 2)
    } catch {
      resultado = rawText
    }

    // 4. Marcar completada
    await completarTarea(tarea.id, resultado)

    // 5. Registrar gasto
    const costeInput = (message.usage.input_tokens / 1_000_000) * prices.input
    const costeOutput = (message.usage.output_tokens / 1_000_000) * prices.output
    await registrarGasto({
      agente: tarea.agente,
      modelo: EXECUTOR_MODEL,
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
      coste_input: Math.round(costeInput * 1_000_000) / 1_000_000,
      coste_output: Math.round(costeOutput * 1_000_000) / 1_000_000,
      coste_total: Math.round(coste * 1_000_000) / 1_000_000,
      cliente_id: tarea.cliente_id,
      tipo: 'agente',
    })

    console.log(`[executor] Tarea completada: ${tarea.titulo} ($${coste.toFixed(4)})`)

    return { ok: true, resultado, coste: Math.round(coste * 1_000_000) / 1_000_000 }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
    console.error(`[executor] Error en tarea ${tarea.id}:`, errorMsg)
    await fallarTarea(tarea.id, errorMsg)
    return { ok: false, resultado: errorMsg }
  }
}

// ── Ejecutar TODAS las tareas aprobadas de un cliente ─────────

export async function ejecutarTareasAprobadas(
  clienteId: string
): Promise<{
  ejecutadas: number
  completadas: number
  fallidas: number
  coste_total: number
  resultados: Array<{ tarea_id: string; titulo: string; ok: boolean; resultado: string }>
}> {
  if (!supabaseAdmin) {
    return { ejecutadas: 0, completadas: 0, fallidas: 0, coste_total: 0, resultados: [] }
  }

  // Obtener tareas aprobadas (revision aprobadas + auto pendientes)
  const { data: tareas, error } = await supabaseAdmin
    .from('tareas_ejecucion')
    .select('*')
    .eq('cliente_id', clienteId)
    .or('estado.eq.aprobada,and(estado.eq.pendiente,tipo.eq.auto)')
    .order('prioridad', { ascending: true })

  if (error || !tareas || tareas.length === 0) {
    console.log('[executor] No hay tareas listas para ejecutar')
    return { ejecutadas: 0, completadas: 0, fallidas: 0, coste_total: 0, resultados: [] }
  }

  console.log(`[executor] ${tareas.length} tareas listas para ejecutar`)

  let completadas = 0
  let fallidas = 0
  let coste_total = 0
  const resultados: Array<{ tarea_id: string; titulo: string; ok: boolean; resultado: string }> = []

  // Ejecutar secuencialmente (para no saturar la API)
  for (const tarea of tareas as TareaEjecucion[]) {
    const result = await ejecutarTarea(tarea)
    resultados.push({
      tarea_id: tarea.id,
      titulo: tarea.titulo,
      ok: result.ok,
      resultado: result.resultado.slice(0, 200), // Truncar para respuesta
    })

    if (result.ok) {
      completadas++
      coste_total += result.coste ?? 0
    } else {
      fallidas++
    }
  }

  return {
    ejecutadas: tareas.length,
    completadas,
    fallidas,
    coste_total: Math.round(coste_total * 1_000_000) / 1_000_000,
    resultados,
  }
}

// ── Construir prompts de ejecución ───────────────────────────

function buildExecutionPrompt(tarea: TareaEjecucion): {
  systemPrompt: string
  userPrompt: string
} {
  // Prompts específicos por campo GBP
  const EXECUTION_PROMPTS: Record<string, { system: string; task: string }> = {
    descripcion: {
      system: `Eres un copywriter experto en SEO local y Google Business Profile para negocios en España.
Tu trabajo: Escribir descripciones de GBP que posicionen el negocio en Map Pack y sean citables por Gemini y otros LLMs.

Reglas:
- Máximo 750 caracteres (límite de Google)
- Incluir keywords locales de forma natural
- Mencionar ubicación, servicios clave y diferenciador
- Tono profesional pero cercano
- Incluir CTA sutil al final
- NO usar emojis, hashtags ni lenguaje promocional excesivo`,
      task: 'Escribe la descripción optimizada para el GBP.',
    },

    categoria_principal: {
      system: `Eres un especialista en categorización de Google Business Profile en España.
Tu trabajo: Seleccionar la categoría principal más específica y relevante de las disponibles en Google.

Reglas:
- La categoría debe existir en el catálogo real de Google
- Ser lo más específica posible (ej: "Clínica dental" mejor que "Dentista")
- Explicar por qué esta categoría mejora el ranking`,
      task: 'Indica la categoría principal óptima y justifica tu elección.',
    },

    categorias_secundarias: {
      system: `Eres un especialista en categorización de Google Business Profile en España.
Tu trabajo: Seleccionar categorías secundarias que amplíen la visibilidad sin diluir la relevancia.

Reglas:
- Máximo 5 categorías secundarias
- Deben existir en el catálogo real de Google
- Complementar la categoría principal, no repetirla
- Cada una debe abrir visibilidad para búsquedas diferentes`,
      task: 'Lista las categorías secundarias óptimas con justificación para cada una.',
    },

    horarios: {
      system: `Eres un gestor de perfiles GBP que configura horarios óptimos para negocios en España.
Genera horarios realistas y completos, incluyendo horarios especiales si aplica.`,
      task: 'Define los horarios de atención óptimos para este negocio.',
    },

    servicios: {
      system: `Eres un especialista en GBP que configura la sección de servicios para máxima visibilidad en Map Pack.
Cada servicio es una oportunidad de aparecer en búsquedas específicas.

Reglas:
- Listar servicios reales del negocio
- Incluir keywords que los clientes realmente buscan
- Agrupar por categoría si hay muchos
- Incluir descripción breve para cada servicio`,
      task: 'Lista los servicios que deben configurarse en el perfil GBP.',
    },

    posts: {
      system: `Eres un redactor de posts para Google Business Profile, especializado en negocios locales de España.

Reglas:
- Post de máximo 1500 caracteres
- Keywords locales naturales (NO keyword stuffing)
- CTA claro que genere métricas Maps (clics, llamadas, rutas)
- Tono adaptado al sector del negocio
- Incluir sugerencia de imagen`,
      task: 'Escribe el post GBP completo, listo para publicar.',
    },

    telefono: {
      system: `Eres un consultor de SEO local especializado en consistencia NAP.
Tu trabajo: Analizar y recomendar el formato correcto de teléfono para GBP y directorios.`,
      task: 'Indica el formato de teléfono correcto y las acciones necesarias.',
    },

    direccion: {
      system: `Eres un consultor de SEO local especializado en configuración de dirección en GBP.
La dirección correcta es CRÍTICA para aparecer en Map Pack de la zona.`,
      task: 'Indica el formato de dirección correcto y los pasos para configurarla.',
    },

    fotos: {
      system: `Eres un especialista en contenido visual para GBP.
Las fotos son una señal de prominencia en Map Pack y generan confianza.

Reglas:
- Describir qué tipo de fotos necesita el negocio
- Recomendar descripciones ALT optimizadas para cada foto
- Indicar formato y resolución recomendados
- Priorizar por impacto`,
      task: 'Lista las fotos necesarias con sus descripciones ALT optimizadas.',
    },

    resenas: {
      system: `Eres un estratega de reputación online para negocios locales en España.
Las reseñas son el factor de prominencia #1 en Map Pack.`,
      task: 'Diseña la estrategia de captación de reseñas paso a paso.',
    },

    verificacion: {
      system: `Eres un especialista en verificación de perfiles GBP.
Un perfil no verificado NO puede aparecer en el Local Pack.`,
      task: 'Explica paso a paso cómo verificar este perfil de GBP.',
    },
  }

  const campo = tarea.campo_gbp ?? 'general'
  const promptConfig = EXECUTION_PROMPTS[campo] ?? {
    system: `Eres un especialista en optimización de Google Business Profile para negocios locales en España.
Tu trabajo es ejecutar tareas concretas de mejora del perfil GBP.`,
    task: 'Ejecuta esta tarea y proporciona el resultado concreto.',
  }

  const systemPrompt = `${promptConfig.system}

FORMATO DE RESPUESTA:
Responde en JSON válido con esta estructura:
{
  "contenido_generado": "El contenido/texto/resultado principal que se va a usar",
  "instrucciones": "Pasos concretos para implementar el cambio (si aplica)",
  "notas": "Observaciones importantes (opcional)",
  "verificacion": "Cómo verificar que el cambio se aplicó correctamente"
}

NO uses bloques de código markdown. Solo JSON puro.
Responde siempre en español de España.`

  const userPrompt = `## Tarea a ejecutar
**${tarea.titulo}**

${tarea.descripcion}

## Contexto
- Campo GBP afectado: ${tarea.campo_gbp ?? 'General'}
- Valor actual: ${tarea.valor_actual ?? 'No disponible'}
- Valor propuesto (referencia): ${tarea.valor_propuesto ?? 'No disponible'}
- Agente que generó la tarea: ${tarea.agente}
- Prioridad: ${tarea.prioridad}

## ${promptConfig.task}

Genera el contenido FINAL y listo para implementar. No des opciones, da LA solución.`

  return { systemPrompt, userPrompt }
}

// ── Parsear JSON de respuesta ────────────────────────────────

function parseJsonResponse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw)
  } catch {
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) return JSON.parse(jsonMatch[1].trim())

    const first = raw.indexOf('{')
    const last = raw.lastIndexOf('}')
    if (first !== -1 && last > first) return JSON.parse(raw.slice(first, last + 1))

    throw new Error('No JSON found')
  }
}
