// Cliente Brave Search API para el Agente Vigilante
// Docs: https://api.search.brave.com/app/documentation/web-search

export interface BraveResult {
  title: string
  url: string
  description: string
  published?: string
}

export async function braveSearch(
  query: string,
  opts: { count?: number; freshness?: 'pd' | 'pw' | 'pm' } = {}
): Promise<BraveResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY
  if (!apiKey) {
    console.warn('[vigilante] BRAVE_SEARCH_API_KEY no configurada')
    return []
  }

  const params = new URLSearchParams({
    q: query,
    count: String(opts.count ?? 5),
    ...(opts.freshness ? { freshness: opts.freshness } : {}),
  })

  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
        signal: AbortSignal.timeout(10_000),
      }
    )
    if (!res.ok) {
      console.error('[vigilante] Brave API error:', res.status, await res.text())
      return []
    }
    const data = await res.json()
    return (data.web?.results ?? []).map((r: Record<string, string>) => ({
      title: r.title ?? '',
      url: r.url ?? '',
      description: r.description ?? '',
      published: r.age ?? undefined,
    }))
  } catch (err) {
    console.error('[vigilante] Brave fetch error:', err)
    return []
  }
}

// Búsqueda en paralelo de múltiples queries
export async function braveSearchMulti(
  queries: string[],
  opts: { count?: number; freshness?: 'pd' | 'pw' | 'pm' } = {}
): Promise<BraveResult[]> {
  const results = await Promise.allSettled(
    queries.map((q) => braveSearch(q, opts))
  )

  // Deduplicar por URL
  const seen = new Set<string>()
  return results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((r) => {
      if (seen.has(r.url)) return false
      seen.add(r.url)
      return true
    })
}
