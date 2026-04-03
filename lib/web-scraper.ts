// ─────────────────────────────────────────────────────────
// WEB SCRAPER — Obtiene y limpia el HTML de una web
// ─────────────────────────────────────────────────────────
// Usado por el prospector_web para analizar webs de negocios.
// Funciona en serverless (solo fetch, sin Puppeteer).

export interface ScrapedWeb {
  url: string
  finalUrl: string
  status: number
  ok: boolean
  title: string
  metaDescription: string
  html: string           // HTML limpio (truncado a ~15k chars para no saturar tokens)
  textContent: string    // Solo texto visible (truncado a ~8k chars)
  emails: string[]
  phones: string[]
  socialLinks: string[]
  hasSSL: boolean
  loadTimeMs: number
  error?: string
}

const MAX_HTML_LENGTH = 15_000
const MAX_TEXT_LENGTH = 8_000
const FETCH_TIMEOUT = 10_000

export async function scrapeWebsite(url: string): Promise<ScrapedWeb> {
  // Normalizar URL
  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = `https://${normalizedUrl}`
  }

  const result: ScrapedWeb = {
    url: normalizedUrl,
    finalUrl: normalizedUrl,
    status: 0,
    ok: false,
    title: '',
    metaDescription: '',
    html: '',
    textContent: '',
    emails: [],
    phones: [],
    socialLinks: [],
    hasSSL: normalizedUrl.startsWith('https'),
    loadTimeMs: 0,
  }

  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RadarLocal/1.0; +https://radar-local.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-ES,es;q=0.9',
      },
      redirect: 'follow',
    })

    clearTimeout(timeout)

    result.status = response.status
    result.ok = response.ok
    result.finalUrl = response.url
    result.loadTimeMs = Date.now() - startTime

    if (!response.ok) {
      result.error = `HTTP ${response.status}`
      return result
    }

    const html = await response.text()
    result.html = html.slice(0, MAX_HTML_LENGTH)

    // Extraer title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    result.title = titleMatch?.[1]?.trim() ?? ''

    // Extraer meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)
    result.metaDescription = descMatch?.[1]?.trim() ?? ''

    // Extraer texto visible (quitar tags, scripts, styles)
    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    result.textContent = textContent.slice(0, MAX_TEXT_LENGTH)

    // Extraer emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = html.match(emailRegex) ?? []
    result.emails = [...new Set(emails)].filter(e =>
      !e.includes('example.com') && !e.includes('wixpress') && !e.includes('sentry')
    ).slice(0, 5)

    // Extraer teléfonos españoles
    const phoneRegex = /(?:\+34[\s.-]?)?(?:6\d{2}|7[1-9]\d|9\d{2})[\s.-]?\d{3}[\s.-]?\d{3}/g
    const phones = html.match(phoneRegex) ?? []
    result.phones = [...new Set(phones.map(p => p.replace(/[\s.-]/g, '')))].slice(0, 3)

    // Extraer links sociales / WhatsApp
    const socialPatterns = [
      /https?:\/\/(?:wa\.me|api\.whatsapp\.com)\/\d+/gi,
      /https?:\/\/(?:www\.)?instagram\.com\/[\w.]+/gi,
      /https?:\/\/(?:www\.)?facebook\.com\/[\w.]+/gi,
      /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[\w.-]+/gi,
    ]
    for (const pattern of socialPatterns) {
      const matches = html.match(pattern) ?? []
      result.socialLinks.push(...matches)
    }
    result.socialLinks = [...new Set(result.socialLinks)].slice(0, 10)

  } catch (e) {
    result.loadTimeMs = Date.now() - startTime
    if (e instanceof DOMException && e.name === 'AbortError') {
      result.error = 'Timeout (>10s)'
    } else {
      result.error = e instanceof Error ? e.message : 'Error desconocido'
    }
  }

  return result
}
