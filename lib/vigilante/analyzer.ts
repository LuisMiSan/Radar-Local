// Analyzer: Claude analiza los resultados del scan y genera propuestas
// Usa prompt caching para el contexto del negocio (estable entre llamadas)

import Anthropic from '@anthropic-ai/sdk'
import type { ResultadoScan } from './scanner'
import type { ImpactoVigilante, TipoCambioVigilante, AreaAfectada, DiffPropuesto } from '@/types'

const client = new Anthropic({
  apiKey: process.env.RADAR_ANTHROPIC_KEY,
})

// Contexto del negocio — estable, se cachea
const CONTEXTO_NEGOCIO = `Eres el Agente Vigilante de Radar Local, una plataforma SaaS española de posicionamiento local que ayuda a negocios a aparecer en el Map Pack de Google y en las respuestas de IA (Gemini, ChatGPT, Perplexity).

STACK TÉCNICO:
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind
- Backend: Supabase (PostgreSQL), Vercel (serverless)
- IA: Claude API (Anthropic) — modelo claude-sonnet-4-6 para 11 agentes
- Email: Resend | Búsqueda: Google Places API | Protocolo: A2A
- SDK: @anthropic-ai/sdk ^0.78.0, @supabase/supabase-js ^2.98.0

MODELO DE NEGOCIO:
- SaaS B2B: 2 packs (Visibilidad Local ~€99/mes, Autoridad Maps+IA ~€199/mes)
- 11 agentes IA: auditor GBP, NAP, keywords, reseñas, posts, schema, FAQs, chunks, TL;DR, monitor IAs, reporte
- Supervisor paralelo con 4 grupos de ejecución
- White label API (protocolo A2A) para agencias
- Onboarding automatizado al activar cliente

ÁREAS CRÍTICAS A VIGILAR:
1. Google Business Profile: cambios en API, algoritmo Map Pack, nuevas features
2. LLMs/IA: cambios en cómo Gemini/ChatGPT/Perplexity citan negocios locales
3. Stack: deprecaciones en Next.js, Supabase, Anthropic SDK, CVEs
4. Negocio: nuevos competidores, cambios en pricing de herramientas, tendencias
5. SEO Local: actualizaciones de algoritmo, nuevos factores de ranking`

export interface CambioAnalizado {
  titulo: string
  fuente: string
  url?: string
  resumen: string
  impacto_estimado: ImpactoVigilante
  area_afectada: AreaAfectada
  propuesta: string
  tipo_cambio: TipoCambioVigilante
  diff_propuesto?: DiffPropuesto
  relevante: boolean  // false = descartar, no guardar
}

export async function analyzeResults(
  scanResults: ResultadoScan[]
): Promise<CambioAnalizado[]> {
  // Construir el resumen de hallazgos para el análisis
  const hallazgos = scanResults
    .filter((s) => s.resultados.length > 0)
    .map((s) => {
      const items = s.resultados
        .slice(0, 4)
        .map((r) => `  - [${r.title}](${r.url})\n    ${r.description}`)
        .join('\n')
      return `### ${s.fuente.nombre} (área: ${s.fuente.area})\n${items}`
    })
    .join('\n\n')

  if (!hallazgos.trim()) return []

  const prompt = `Analiza estos hallazgos de búsqueda del día de hoy y determina cuáles son relevantes para Radar Local.

HALLAZGOS:
${hallazgos}

Para cada hallazgo RELEVANTE (ignora los irrelevantes o duplicados), devuelve un JSON array con este schema exacto:
[
  {
    "titulo": "string corto descriptivo",
    "fuente": "nombre de la fuente",
    "url": "url del artículo más relevante",
    "resumen": "2-3 frases explicando qué cambió y por qué importa a Radar Local",
    "impacto_estimado": "critico|importante|info",
    "area_afectada": "gbp|llm|stack|negocio|seo|seguridad|general",
    "propuesta": "acción concreta que Radar Local debería tomar, explicada claramente",
    "tipo_cambio": "knowledge|prompt|code|config|manual",
    "diff_propuesto": null,
    "relevante": true
  }
]

CRITERIOS:
- "critico": afecta directamente al producto o genera riesgo legal/seguridad (ej: API deprecation en <30 días, CVE activo, cambio algorítmico mayor)
- "importante": debe atenderse en días/semanas (ej: nueva feature de GBP, cambio en cómo LLMs rankean negocios)
- "info": interesante pero no urgente (ej: tendencia de mercado, paper nuevo)

tipo_cambio:
- "knowledge": actualizar archivos .md de conocimiento de los agentes
- "prompt": actualizar system prompt de un agente específico
- "code": cambio en código TypeScript (incluir diff_propuesto si puedes)
- "config": cambio en configuración (Vercel env, Supabase config)
- "manual": acción que LuisMi debe hacer manualmente (ej: crear cuenta, pagar, contactar)

Si un hallazgo NO es relevante para Radar Local, no lo incluyas.
Si no hay nada relevante hoy, devuelve [].
Responde SOLO con el JSON array, sin markdown, sin explicaciones.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: CONTEXTO_NEGOCIO,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    // Extraer JSON aunque venga con markdown
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    const parsed = JSON.parse(jsonMatch[0]) as CambioAnalizado[]
    return parsed.filter((c) => c.relevante !== false)
  } catch (err) {
    console.error('[vigilante] Error en análisis Claude:', err)
    return []
  }
}
