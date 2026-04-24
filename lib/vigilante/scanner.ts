// Scanner: define fuentes y queries para el Agente Vigilante
// Cada fuente tiene queries específicas y freshness (pd=1 día, pw=1 semana)

import { braveSearchMulti, type BraveResult } from './brave-search'

export interface FuenteEscaneo {
  id: string
  nombre: string
  area: 'gbp' | 'llm' | 'stack' | 'negocio' | 'seo' | 'seguridad' | 'general'
  queries: string[]
  freshness: 'pd' | 'pw'
}

// Fuentes monitorizadas — ordenadas por relevancia para Radar Local
const FUENTES: FuenteEscaneo[] = [
  {
    id: 'google_gbp',
    nombre: 'Google Business Profile',
    area: 'gbp',
    queries: [
      'Google Business Profile update changes 2025',
      'Google My Business API deprecation announcement',
      'GBP new features algorithm local ranking',
      'Google Maps ranking factor update',
    ],
    freshness: 'pw',
  },
  {
    id: 'anthropic',
    nombre: 'Anthropic / Claude API',
    area: 'stack',
    queries: [
      'Anthropic Claude API breaking change deprecation 2025',
      'Claude API new model release pricing',
      'Anthropic SDK changelog update',
      'site:anthropic.com announcement API',
    ],
    freshness: 'pw',
  },
  {
    id: 'google_ai',
    nombre: 'Google AI / Gemini',
    area: 'llm',
    queries: [
      'Gemini local search ranking update 2025',
      'Google AI Overviews local business change',
      'Google SGE generative search local',
      'Gemini voice search ranking factor',
    ],
    freshness: 'pw',
  },
  {
    id: 'local_seo',
    nombre: 'Local SEO / Map Pack',
    area: 'seo',
    queries: [
      'local SEO ranking factor change 2025',
      'Google Map Pack algorithm update',
      'local pack ranking signal new',
      'site:searchengineland.com local SEO',
      'site:brightlocal.com Google Business',
    ],
    freshness: 'pw',
  },
  {
    id: 'nextjs_supabase',
    nombre: 'Next.js / Supabase',
    area: 'stack',
    queries: [
      'Next.js 16 breaking changes release',
      'Supabase deprecation breaking change 2025',
      'Next.js security vulnerability CVE',
    ],
    freshness: 'pw',
  },
  {
    id: 'ai_search',
    nombre: 'Búsqueda con IA (ChatGPT/Perplexity)',
    area: 'llm',
    queries: [
      'ChatGPT search local business ranking 2025',
      'Perplexity local business listing changes',
      'AI search engine local citation ranking',
      'AEO generative engine optimization update',
    ],
    freshness: 'pw',
  },
  {
    id: 'competidores',
    nombre: 'Competidores y mercado',
    area: 'negocio',
    queries: [
      'GBP management agency software Spain 2025',
      'local SEO SaaS platform new features',
      'BrightLocal Whitespark update competitor',
      'agencia posicionamiento local Google nuevo',
    ],
    freshness: 'pw',
  },
  {
    id: 'seguridad',
    nombre: 'Seguridad',
    area: 'seguridad',
    queries: [
      'Vercel security incident 2025',
      'Next.js CVE vulnerability 2025',
      'Supabase security breach 2025',
    ],
    freshness: 'pd',
  },
]

export interface ResultadoScan {
  fuente: FuenteEscaneo
  resultados: BraveResult[]
}

// Escanea todas las fuentes en paralelo (agrupadas para no saturar la API)
export async function scanAllSources(): Promise<ResultadoScan[]> {
  const BATCH_SIZE = 3 // máx 3 fuentes en paralelo

  const resultados: ResultadoScan[] = []

  for (let i = 0; i < FUENTES.length; i += BATCH_SIZE) {
    const batch = FUENTES.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.allSettled(
      batch.map(async (fuente) => {
        const resultados = await braveSearchMulti(fuente.queries, {
          count: 3,
          freshness: fuente.freshness,
        })
        return { fuente, resultados }
      })
    )
    batchResults.forEach((r) => {
      if (r.status === 'fulfilled') resultados.push(r.value)
    })
    // Pausa entre batches para respetar rate limits de Brave (1 req/s)
    if (i + BATCH_SIZE < FUENTES.length) {
      await new Promise((r) => setTimeout(r, 1200))
    }
  }

  return resultados
}
