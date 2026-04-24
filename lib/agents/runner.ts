import type { Agente } from '@/types'
import { anthropic } from '@/lib/anthropic'
import type { AgentInput, AgentResult, TareaGenerada, TokenUsage } from './types'
import { buildPrompt } from './prompts'
import { getSystemPrompt } from './system-prompts'
import { generateMockResult } from './mock-data'

// Precios por millón de tokens (USD)
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6': { input: 3, output: 15 },
}

function calcUsage(inputTokens: number, outputTokens: number, model: string): TokenUsage {
  const prices = PRICING[model] ?? PRICING['claude-sonnet-4-6']
  const coste_input = (inputTokens / 1_000_000) * prices.input
  const coste_output = (outputTokens / 1_000_000) * prices.output
  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    model,
    coste_input: Math.round(coste_input * 1_000_000) / 1_000_000,
    coste_output: Math.round(coste_output * 1_000_000) / 1_000_000,
    coste_total: Math.round((coste_input + coste_output) * 1_000_000) / 1_000_000,
  }
}

// ════════════════════════════════════════════════════════════
// RUNNER — Ejecuta agentes con API real (system + user) o mock
// ════════════════════════════════════════════════════════════

export async function runAgentExecution(
  agente: Agente,
  input: AgentInput
): Promise<AgentResult> {
  // Sin API key → devolver mock
  if (!anthropic) {
    console.log(`[${agente}] API key no configurada → usando mock`)
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500))
    return generateMockResult(agente, input)
  }

  // Con API key → llamar a Claude con system + user separados
  try {
    const systemPrompt = getSystemPrompt(agente)
    const userPrompt = buildPrompt(agente, input)

    console.log(`[${agente}] Ejecutando con Claude API (system + user + knowledge + skills)...`)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    // Extraer texto de la respuesta
    const textBlock = message.content.find((b) => b.type === 'text')
    const rawText = textBlock?.text ?? '{}'

    // Parsear JSON robusto — intenta múltiples estrategias
    let datos: Record<string, unknown>
    try {
      // Intento 1: JSON directo
      datos = JSON.parse(rawText)
    } catch {
      try {
        // Intento 2: extraer de code block ```json ... ```
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (jsonMatch) {
          datos = JSON.parse(jsonMatch[1].trim())
        } else {
          // Intento 3: buscar primer { hasta último }
          const first = rawText.indexOf('{')
          const last = rawText.lastIndexOf('}')
          if (first !== -1 && last > first) {
            datos = JSON.parse(rawText.slice(first, last + 1))
          } else {
            throw new Error('No JSON found')
          }
        }
      } catch {
        console.warn(`[${agente}] Respuesta no es JSON válido, guardando como raw`)
        datos = { respuesta_raw: rawText }
      }
    }

    // Calcular uso de tokens
    const usage = calcUsage(
      message.usage.input_tokens,
      message.usage.output_tokens,
      'claude-sonnet-4-6'
    )

    // Extraer tareas ejecutables si las hay
    const tareas = extraerTareas(datos)

    // Generar resumen a partir de los datos
    const resumen = generarResumen(agente, datos, input)

    const tareasInfo = tareas.length > 0
      ? ` ${tareas.length} tareas generadas (${tareas.filter(t => t.tipo === 'auto').length} auto, ${tareas.filter(t => t.tipo === 'revision').length} revisión, ${tareas.filter(t => t.tipo === 'manual').length} manual).`
      : ''

    console.log(`[${agente}] ✓ Completado. Tokens: ${usage.input_tokens}in/${usage.output_tokens}out = $${usage.coste_total.toFixed(4)}. ${resumen}${tareasInfo}`)

    return {
      agente,
      estado: 'completada',
      datos,
      resumen,
      usage,
      tareas: tareas.length > 0 ? tareas : undefined,
    }
  } catch (error) {
    console.error(`[${agente}] ✗ Error:`, error)
    return {
      agente,
      estado: 'error',
      datos: { error: error instanceof Error ? error.message : 'Error desconocido' },
      resumen: `Error al ejecutar ${agente}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    }
  }
}

// ── Resumen legible a partir de los datos del agente ────────

function generarResumen(
  agente: Agente,
  datos: Record<string, unknown>,
  input: AgentInput
): string {
  const nombre = input.perfilGbp?.nombre_gbp ?? input.cliente.negocio

  const resumenMap: Record<Agente, () => string> = {
    auditor_gbp: () => {
      const p = (datos.puntuacion as number) ?? 0
      const probs = (datos.problemas as string[])?.length ?? 0
      return `Auditoría GBP de ${nombre}: puntuación ${p}/100. ${probs} problemas detectados.`
    },
    optimizador_nap: () => {
      const c = (datos.consistencia_pct as number) ?? 0
      return `NAP de ${nombre}: ${c}% consistente.`
    },
    keywords_locales: () => {
      const kws = (datos.keywords as unknown[])?.length ?? 0
      return `${kws} keywords locales identificadas para ${nombre}.`
    },
    gestor_resenas: () => {
      const total = (datos.total as number) ?? 0
      return `Reseñas de ${nombre}: ${total} analizadas.`
    },
    redactor_posts_gbp: () => {
      const posts = (datos.posts as unknown[])?.length ?? 0
      return `${posts} posts GBP generados para ${nombre}.`
    },
    generador_schema: () => {
      const schemas = (datos.schemas as unknown[])?.length ?? 0
      return `${schemas} schemas JSON-LD generados para ${nombre}.`
    },
    creador_faq_geo: () => {
      const faqs = (datos.faqs as unknown[])?.length ?? 0
      return `${faqs} FAQs GEO generadas para ${nombre}.`
    },
    generador_chunks: () => {
      const chunks = (datos.chunks as unknown[])?.length ?? 0
      return `${chunks} chunks de contenido generados para ${nombre}.`
    },
    tldr_entidad: () => `TL;DR de entidad generado para ${nombre}.`,
    monitor_ias: () => {
      const presencia = (datos.presencia_global as string) ?? 'N/A'
      return `Monitor IA de ${nombre}: ${presencia}`
    },
    generador_reporte: () => `Reporte mensual generado para ${nombre}.`,
    prospector_web: () => {
      const score = (datos.web_score as number) ?? 0
      const veredicto = (datos.veredicto as string) ?? 'desconocido'
      return `Prospección web de ${nombre}: score ${score}/100 (${veredicto}).${(datos.necesita_demo as boolean) ? ' Demo generada.' : ''}`
    },
    supervisor: () => `Análisis completo ejecutado para ${nombre}.`,
    vigilante_mercado: () => `Vigilante de mercado — ejecución autónoma diaria.`,
  }

  return resumenMap[agente]()
}

// ── Extraer tareas ejecutables del JSON del agente ──────────

function extraerTareas(datos: Record<string, unknown>): TareaGenerada[] {
  const rawTareas = datos.tareas as unknown[]
  if (!Array.isArray(rawTareas)) return []

  const validTypes = ['auto', 'revision', 'manual'] as const
  const validPrioridades = ['critica', 'alta', 'media', 'baja'] as const
  const validCategorias = ['mejora', 'correccion', 'creacion', 'verificacion'] as const

  return rawTareas
    .filter((t): t is Record<string, unknown> => t !== null && typeof t === 'object')
    .map((t) => ({
      titulo: String(t.titulo ?? 'Tarea sin título'),
      descripcion: String(t.descripcion ?? ''),
      categoria: validCategorias.includes(t.categoria as typeof validCategorias[number])
        ? (t.categoria as typeof validCategorias[number])
        : 'mejora',
      tipo: validTypes.includes(t.tipo as typeof validTypes[number])
        ? (t.tipo as typeof validTypes[number])
        : 'revision',
      prioridad: validPrioridades.includes(t.prioridad as typeof validPrioridades[number])
        ? (t.prioridad as typeof validPrioridades[number])
        : 'media',
      campo_gbp: t.campo_gbp ? String(t.campo_gbp) : null,
      valor_actual: t.valor_actual ? String(t.valor_actual) : null,
      valor_propuesto: t.valor_propuesto ? String(t.valor_propuesto) : null,
      accion_api: undefined,
    }))
}
