// Monitor externo — obtiene datos reales de presencia en IAs y buscadores
// Estrategia: intenta A2A externo → fallback a API directa → fallback a null
//
// Variables de entorno necesarias (opcionales — si no están, se omite la fuente):
//   PERPLEXITY_API_KEY   → consultas reales a Perplexity Sonar
//   BRAVE_SEARCH_API_KEY → menciones reales en Brave Search (proxy ChatGPT/Bing)
//   BING_SEARCH_API_KEY  → índice Bing (visibilidad ChatGPT)

import { a2aClient } from './client'
import { randomUUID } from 'crypto'

export interface MencionReal {
  plataforma: string
  mencionado: boolean
  url_encontrada?: string
  snippet?: string
  posicion?: number
  fuente: 'a2a-externo' | 'api-directa' | 'inferencia'
}

export interface DatosMonitorExterno {
  negocio: string
  menciones: MencionReal[]
  timestamp: string
}

// ── Perplexity Sonar API ─────────────────────────────────────

async function checkPerplexity(negocio: string, localidad: string): Promise<MencionReal> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) return { plataforma: 'Perplexity', mencionado: false, fuente: 'inferencia' }

  // Primero intentar A2A si hay un agente Perplexity registrado
  const perplexityUrl = a2aClient.resolveAgent('perplexity-search')
  if (perplexityUrl) {
    try {
      const result = await a2aClient.sendTask(perplexityUrl, {
        id: randomUUID(),
        message: {
          role: 'user',
          parts: [{ type: 'data', data: { query: `${negocio} ${localidad}`, source: 'perplexity' } }],
        },
      })
      const data = result.artifacts?.[0]?.parts?.[0]?.data
      if (data) {
        return {
          plataforma: 'Perplexity',
          mencionado: (data.mencionado as boolean) ?? false,
          snippet: data.snippet as string | undefined,
          fuente: 'a2a-externo',
        }
      }
    } catch (e) {
      console.warn('[monitor-externo] Perplexity A2A falló, usando API directa:', e)
    }
  }

  // Fallback: API directa de Perplexity Sonar
  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: `¿Conoces el negocio llamado "${negocio}" en ${localidad}? Si lo conoces, describe brevemente qué es y dónde está. Si no lo conoces, di exactamente "No tengo información sobre este negocio".`,
          },
        ],
        max_tokens: 300,
        search_recency_filter: 'month',
      }),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) throw new Error(`Perplexity API error ${res.status}`)

    const data = (await res.json()) as { choices: { message: { content: string } }[] }
    const respuesta = data.choices?.[0]?.message?.content ?? ''
    const mencionado = !respuesta.toLowerCase().includes('no tengo información')

    return {
      plataforma: 'Perplexity',
      mencionado,
      snippet: mencionado ? respuesta.slice(0, 300) : undefined,
      fuente: 'api-directa',
    }
  } catch (e) {
    console.error('[monitor-externo] Perplexity error:', e)
    return { plataforma: 'Perplexity', mencionado: false, fuente: 'inferencia' }
  }
}

// ── Brave Search API (proxy de indexación / menciones web) ───

async function checkBraveSearch(negocio: string, localidad: string): Promise<MencionReal> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY
  if (!apiKey) return { plataforma: 'Brave/ChatGPT', mencionado: false, fuente: 'inferencia' }

  // Intentar A2A externo primero
  const braveUrl = a2aClient.resolveAgent('brave-search')
  if (braveUrl) {
    try {
      const result = await a2aClient.sendTask(braveUrl, {
        id: randomUUID(),
        message: {
          role: 'user',
          parts: [{ type: 'data', data: { query: `"${negocio}" ${localidad}` } }],
        },
      })
      const data = result.artifacts?.[0]?.parts?.[0]?.data
      if (data) {
        return {
          plataforma: 'Brave/ChatGPT',
          mencionado: (data.mencionado as boolean) ?? false,
          url_encontrada: data.url as string | undefined,
          snippet: data.snippet as string | undefined,
          posicion: data.posicion as number | undefined,
          fuente: 'a2a-externo',
        }
      }
    } catch (e) {
      console.warn('[monitor-externo] Brave A2A falló, usando API directa:', e)
    }
  }

  // Fallback: Brave Search API
  try {
    const query = encodeURIComponent(`"${negocio}" ${localidad}`)
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${query}&count=5&country=es&lang=es`, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) throw new Error(`Brave API error ${res.status}`)

    const data = (await res.json()) as {
      web?: { results?: { title: string; url: string; description: string }[] }
    }
    const results = data.web?.results ?? []
    const match = results.find(
      (r) =>
        r.title.toLowerCase().includes(negocio.toLowerCase()) ||
        r.description.toLowerCase().includes(negocio.toLowerCase())
    )

    return {
      plataforma: 'Brave/ChatGPT',
      mencionado: !!match,
      url_encontrada: match?.url,
      snippet: match?.description?.slice(0, 250),
      posicion: match ? results.indexOf(match) + 1 : undefined,
      fuente: 'api-directa',
    }
  } catch (e) {
    console.error('[monitor-externo] Brave error:', e)
    return { plataforma: 'Brave/ChatGPT', mencionado: false, fuente: 'inferencia' }
  }
}

// ── Bing Search API (visibilidad directa para ChatGPT) ───────

async function checkBing(negocio: string, localidad: string): Promise<MencionReal> {
  const apiKey = process.env.BING_SEARCH_API_KEY
  if (!apiKey) return { plataforma: 'Bing/ChatGPT', mencionado: false, fuente: 'inferencia' }

  try {
    const query = encodeURIComponent(`"${negocio}" ${localidad}`)
    const res = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?q=${query}&mkt=es-ES&count=5`,
      {
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
        signal: AbortSignal.timeout(10_000),
      }
    )

    if (!res.ok) throw new Error(`Bing API error ${res.status}`)

    const data = (await res.json()) as {
      webPages?: { value?: { name: string; url: string; snippet: string }[] }
    }
    const results = data.webPages?.value ?? []
    const match = results.find(
      (r) =>
        r.name.toLowerCase().includes(negocio.toLowerCase()) ||
        r.snippet.toLowerCase().includes(negocio.toLowerCase())
    )

    return {
      plataforma: 'Bing/ChatGPT',
      mencionado: !!match,
      url_encontrada: match?.url,
      snippet: match?.snippet?.slice(0, 250),
      posicion: match ? results.indexOf(match) + 1 : undefined,
      fuente: 'api-directa',
    }
  } catch (e) {
    console.error('[monitor-externo] Bing error:', e)
    return { plataforma: 'Bing/ChatGPT', mencionado: false, fuente: 'inferencia' }
  }
}

// ── Punto de entrada principal ───────────────────────────────

export async function fetchDatosMonitorExterno(
  negocio: string,
  localidad: string
): Promise<DatosMonitorExterno> {
  // Ejecutar todas las verificaciones en paralelo
  const [perplexity, brave, bing] = await Promise.all([
    checkPerplexity(negocio, localidad),
    checkBraveSearch(negocio, localidad),
    checkBing(negocio, localidad),
  ])

  const menciones = [perplexity, brave, bing]
  const fuentesReales = menciones.filter((m) => m.fuente !== 'inferencia')

  if (fuentesReales.length > 0) {
    console.log(`[monitor-externo] ${fuentesReales.length} fuentes reales obtenidas para "${negocio}"`)
  } else {
    console.log(`[monitor-externo] Sin APIs configuradas — el agente usará inferencia`)
  }

  return {
    negocio,
    menciones,
    timestamp: new Date().toISOString(),
  }
}
