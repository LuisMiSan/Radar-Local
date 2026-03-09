import type { Agente } from '@/types'
import { anthropic } from '@/lib/anthropic'
import type { AgentInput, AgentResult } from './types'
import { buildPrompt } from './prompts'
import { generateMockResult } from './mock-data'

// Runner genérico: ejecuta cualquier agente con API real o mock
export async function runAgentExecution(
  agente: Agente,
  input: AgentInput
): Promise<AgentResult> {
  // Sin API key → devolver mock
  if (!anthropic) {
    // Simular delay de API (300-800ms)
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500))
    return generateMockResult(agente, input)
  }

  // Con API key → llamar a Claude
  try {
    const prompt = buildPrompt(agente, input)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    // Extraer texto de la respuesta
    const textBlock = message.content.find((b) => b.type === 'text')
    const rawText = textBlock?.text ?? '{}'

    // Parsear JSON de la respuesta
    let datos: Record<string, unknown>
    try {
      datos = JSON.parse(rawText)
    } catch {
      // Si no es JSON válido, envolver el texto como resultado
      datos = { respuesta_raw: rawText }
    }

    // Generar resumen a partir de los datos
    const resumen = generarResumen(agente, datos, input)

    return {
      agente,
      estado: 'completada',
      datos,
      resumen,
    }
  } catch (error) {
    console.error(`Error ejecutando agente ${agente}:`, error)
    return {
      agente,
      estado: 'error',
      datos: { error: error instanceof Error ? error.message : 'Error desconocido' },
      resumen: `Error al ejecutar ${agente}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    }
  }
}

// Genera resumen legible a partir de los datos del agente
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
  }

  return resumenMap[agente]()
}
