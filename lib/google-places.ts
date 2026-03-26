// ─────────────────────────────────────────────────────────
// Google Places API (New) — Datos reales de negocios
// ─────────────────────────────────────────────────────────
import 'server-only'
import { registrarGastoGooglePlaces } from './gastos'

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || ''
const BASE_URL = 'https://places.googleapis.com/v1/places'

// Tipos de respuesta de la API
export interface PlaceResult {
  displayName: { text: string }
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  photos?: { name: string }[]
  regularOpeningHours?: {
    openNow?: boolean
    weekdayDescriptions?: string[]
  }
  businessStatus?: string
  types?: string[]
  editorialSummary?: { text: string }
  websiteUri?: string
}

// Datos extraídos y normalizados
export interface PlaceData {
  nombre: string
  direccion: string
  rating: number        // 0-5
  resenas_count: number
  fotos_count: number
  google_maps_url: string
  horarios_completos: boolean
  tiene_web: boolean
  tiene_descripcion: boolean
  business_status: string
}

// ─────────────────────────────────────────────────────────
// Buscar un negocio por texto (nombre + zona)
// ─────────────────────────────────────────────────────────
export async function searchPlace(query: string, zona?: string): Promise<PlaceResult | null> {
  if (!API_KEY) {
    console.warn('[Google Places] No API key — usando datos simulados')
    return null
  }

  try {
    const fullQuery = zona ? `${query} ${zona}` : query

    const res = await fetch(`${BASE_URL}:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': [
          'places.displayName',
          'places.formattedAddress',
          'places.rating',
          'places.userRatingCount',
          'places.googleMapsUri',
          'places.photos',
          'places.regularOpeningHours',
          'places.businessStatus',
          'places.types',
          'places.editorialSummary',
          'places.websiteUri',
        ].join(','),
      },
      body: JSON.stringify({
        textQuery: fullQuery,
        languageCode: 'es',
        maxResultCount: 1,
      }),
    })

    const data = await res.json()

    if (data.error) {
      console.error('[Google Places] API error:', data.error.message)
      return null
    }

    const result = data.places?.[0] || null

    // Registrar gasto (no bloquea)
    registrarGastoGooglePlaces('negocio_principal', fullQuery)
      .catch(e => console.error('[Google Places] Error registrando gasto:', e))

    return result
  } catch (error) {
    console.error('[Google Places] Fetch error:', error)
    return null
  }
}

// ─────────────────────────────────────────────────────────
// Buscar competidores por categoría + zona
// ─────────────────────────────────────────────────────────
export async function searchCompetitors(
  categoria: string,
  zona: string,
  excludeName?: string,
  maxResults: number = 5
): Promise<PlaceResult[]> {
  if (!API_KEY) return []

  try {
    const res = await fetch(`${BASE_URL}:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': [
          'places.displayName',
          'places.formattedAddress',
          'places.rating',
          'places.userRatingCount',
          'places.googleMapsUri',
          'places.photos',
          'places.regularOpeningHours',
          'places.websiteUri',
        ].join(','),
      },
      body: JSON.stringify({
        textQuery: `${categoria} ${zona}`,
        languageCode: 'es',
        maxResultCount: maxResults + 2, // pedir extras por si hay que excluir
      }),
    })

    const data = await res.json()
    if (data.error || !data.places) return []

    // Registrar gasto (no bloquea)
    registrarGastoGooglePlaces('competidores_auto', `${categoria} ${zona}`)
      .catch(e => console.error('[Google Places] Error registrando gasto:', e))

    // Filtrar el propio negocio si aparece
    const filtered = excludeName
      ? data.places.filter((p: PlaceResult) =>
          !p.displayName?.text?.toLowerCase().includes(excludeName.toLowerCase())
        )
      : data.places

    return filtered.slice(0, maxResults)
  } catch (error) {
    console.error('[Google Places] Competitors error:', error)
    return []
  }
}

// ─────────────────────────────────────────────────────────
// Normalizar datos de la API a nuestro formato
// ─────────────────────────────────────────────────────────
export function normalizePlaceData(place: PlaceResult): PlaceData {
  // Debug: log raw displayName para diagnosticar nombres incorrectos
  if (!place.displayName?.text) {
    console.warn('[Google Places] normalizePlaceData: displayName.text is missing!', 'displayName:', JSON.stringify(place.displayName), 'googleMapsUri:', place.googleMapsUri)
  }
  return {
    nombre: place.displayName?.text || 'Desconocido',
    direccion: place.formattedAddress || '',
    rating: place.rating || 0,
    resenas_count: place.userRatingCount || 0,
    fotos_count: place.photos?.length || 0,
    google_maps_url: place.googleMapsUri || '',
    horarios_completos: !!(place.regularOpeningHours?.weekdayDescriptions?.length),
    tiene_web: !!place.websiteUri,
    tiene_descripcion: !!place.editorialSummary?.text,
    business_status: place.businessStatus || 'UNKNOWN',
  }
}

// ─────────────────────────────────────────────────────────
// Calcular puntuación GBP (0-100) basada en datos reales
// ─────────────────────────────────────────────────────────
export function calculateGBPScore(data: PlaceData): number {
  let score = 0

  // Rating (máx 25 puntos) — 5.0 = 25, 4.0 = 20, 3.0 = 15
  score += Math.min(25, Math.round((data.rating / 5) * 25))

  // Reseñas (máx 25 puntos) — escala logarítmica
  // 0 reseñas = 0, 10 = 10, 50 = 18, 100+ = 25
  if (data.resenas_count > 0) {
    score += Math.min(25, Math.round(Math.log10(data.resenas_count + 1) * 12.5))
  }

  // Fotos (máx 20 puntos) — Google recomienda 20+
  // 0 = 0, 5 = 5, 10 = 10, 20+ = 20
  score += Math.min(20, data.fotos_count)

  // Horarios completos (10 puntos)
  if (data.horarios_completos) score += 10

  // Tiene web (10 puntos)
  if (data.tiene_web) score += 10

  // Tiene descripción (10 puntos)
  if (data.tiene_descripcion) score += 10

  return Math.min(100, score)
}
