import 'server-only'
import { getClientGoogleToken } from './google-auth'

// ══════════════════════════════════════════════════════════════
// Google Business Profile API Client
// ══════════════════════════════════════════════════════════════
// Documentacion: https://developers.google.com/my-business/reference/rest

const GBP_API = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const ACCOUNTS_API = 'https://mybusinessaccountmanagement.googleapis.com/v1'

// ── Tipos ────────────────────────────────────────────────────

export interface GbpAccount {
  name: string        // accounts/123456
  accountName: string // Nombre visible
  type: string        // PERSONAL, LOCATION_GROUP, etc.
}

export interface GbpLocation {
  name: string                 // locations/abc123
  title: string                // Nombre del negocio
  categories?: {
    primaryCategory?: { displayName: string; categoryId: string }
    additionalCategories?: { displayName: string; categoryId: string }[]
  }
  storefrontAddress?: {
    addressLines?: string[]
    locality?: string          // Ciudad
    administrativeArea?: string // Provincia/Comunidad
    postalCode?: string
    regionCode?: string        // ES
  }
  phoneNumbers?: {
    primaryPhone?: string
    additionalPhones?: string[]
  }
  websiteUri?: string
  regularHours?: {
    periods?: {
      openDay: string
      openTime: { hours: number; minutes: number }
      closeDay: string
      closeTime: { hours: number; minutes: number }
    }[]
  }
  profile?: {
    description?: string
  }
  metadata?: {
    mapsUri?: string
    newReviewUri?: string
  }
  serviceItems?: { structuredServiceItem?: { serviceTypeId: string; description: string } }[]
}

export interface GbpUpdateResult {
  ok: boolean
  campo: string
  antes: string | null
  despues: string | null
  error?: string
}

// ── Helper: llamar a la API ─────────────────────────────────

async function gbpFetch(
  url: string,
  accessToken: string,
  options?: { method?: string; body?: unknown }
): Promise<unknown> {
  const res = await fetch(url, {
    method: options?.method ?? 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`GBP API error (${res.status}): ${error}`)
  }

  return res.json()
}

// ── Listar cuentas de GBP ───────────────────────────────────

export async function listAccounts(clienteId: string): Promise<GbpAccount[]> {
  const token = await getClientGoogleToken(clienteId)
  if (!token) throw new Error('Cliente no tiene Google conectado')

  const data = await gbpFetch(`${ACCOUNTS_API}/accounts`, token) as { accounts?: GbpAccount[] }
  return data.accounts ?? []
}

// ── Listar ubicaciones de una cuenta ────────────────────────

export async function listLocations(clienteId: string, accountName: string): Promise<GbpLocation[]> {
  const token = await getClientGoogleToken(clienteId)
  if (!token) throw new Error('Cliente no tiene Google conectado')

  const data = await gbpFetch(
    `${GBP_API}/${accountName}/locations?readMask=name,title,categories,storefrontAddress,phoneNumbers,websiteUri,regularHours,profile,metadata,serviceItems`,
    token
  ) as { locations?: GbpLocation[] }
  return data.locations ?? []
}

// ── Obtener una ubicacion ───────────────────────────────────

export async function getLocation(clienteId: string, locationName: string): Promise<GbpLocation> {
  const token = await getClientGoogleToken(clienteId)
  if (!token) throw new Error('Cliente no tiene Google conectado')

  return await gbpFetch(
    `${GBP_API}/${locationName}?readMask=name,title,categories,storefrontAddress,phoneNumbers,websiteUri,regularHours,profile,metadata,serviceItems`,
    token
  ) as GbpLocation
}

// ── Actualizar campos del perfil GBP ────────────────────────

export async function updateLocation(
  clienteId: string,
  locationName: string,
  updates: Partial<GbpLocation>,
  updateMask: string
): Promise<GbpLocation> {
  const token = await getClientGoogleToken(clienteId)
  if (!token) throw new Error('Cliente no tiene Google conectado')

  return await gbpFetch(
    `${GBP_API}/${locationName}?updateMask=${updateMask}`,
    token,
    { method: 'PATCH', body: updates }
  ) as GbpLocation
}

// ══════════════════════════════════════════════════════════════
// Funciones de alto nivel — las que usan los agentes
// ══════════════════════════════════════════════════════════════

// Actualizar descripcion del GBP
export async function updateDescription(
  clienteId: string,
  locationName: string,
  description: string
): Promise<GbpUpdateResult> {
  try {
    const before = await getLocation(clienteId, locationName)
    await updateLocation(
      clienteId,
      locationName,
      { profile: { description } },
      'profile.description'
    )
    return {
      ok: true,
      campo: 'descripcion',
      antes: before.profile?.description ?? null,
      despues: description,
    }
  } catch (error) {
    return {
      ok: false,
      campo: 'descripcion',
      antes: null,
      despues: description,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

// Actualizar telefono
export async function updatePhone(
  clienteId: string,
  locationName: string,
  phone: string
): Promise<GbpUpdateResult> {
  try {
    const before = await getLocation(clienteId, locationName)
    await updateLocation(
      clienteId,
      locationName,
      { phoneNumbers: { primaryPhone: phone } },
      'phoneNumbers.primaryPhone'
    )
    return {
      ok: true,
      campo: 'telefono',
      antes: before.phoneNumbers?.primaryPhone ?? null,
      despues: phone,
    }
  } catch (error) {
    return {
      ok: false,
      campo: 'telefono',
      antes: null,
      despues: phone,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

// Actualizar web
export async function updateWebsite(
  clienteId: string,
  locationName: string,
  url: string
): Promise<GbpUpdateResult> {
  try {
    const before = await getLocation(clienteId, locationName)
    await updateLocation(
      clienteId,
      locationName,
      { websiteUri: url },
      'websiteUri'
    )
    return {
      ok: true,
      campo: 'web',
      antes: before.websiteUri ?? null,
      despues: url,
    }
  } catch (error) {
    return {
      ok: false,
      campo: 'web',
      antes: null,
      despues: url,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

// Actualizar titulo/nombre del negocio
export async function updateTitle(
  clienteId: string,
  locationName: string,
  title: string
): Promise<GbpUpdateResult> {
  try {
    const before = await getLocation(clienteId, locationName)
    await updateLocation(
      clienteId,
      locationName,
      { title },
      'title'
    )
    return {
      ok: true,
      campo: 'nombre',
      antes: before.title ?? null,
      despues: title,
    }
  } catch (error) {
    return {
      ok: false,
      campo: 'nombre',
      antes: null,
      despues: title,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

// ── Leer perfil completo (para los agentes) ─────────────────

export async function readFullProfile(
  clienteId: string,
  locationName: string
): Promise<{
  nombre: string
  descripcion: string | null
  telefono: string | null
  web: string | null
  direccion: string | null
  categoria_principal: string | null
  categorias_secundarias: string[]
  horarios: Record<string, string> | null
  url_maps: string | null
}> {
  const loc = await getLocation(clienteId, locationName)

  const addr = loc.storefrontAddress
  const direccion = addr
    ? [addr.addressLines?.join(', '), addr.postalCode, addr.locality, addr.administrativeArea]
        .filter(Boolean)
        .join(', ')
    : null

  const horarios: Record<string, string> = {}
  if (loc.regularHours?.periods) {
    for (const p of loc.regularHours.periods) {
      const open = `${String(p.openTime.hours).padStart(2, '0')}:${String(p.openTime.minutes ?? 0).padStart(2, '0')}`
      const close = `${String(p.closeTime.hours).padStart(2, '0')}:${String(p.closeTime.minutes ?? 0).padStart(2, '0')}`
      horarios[p.openDay.toLowerCase()] = `${open}-${close}`
    }
  }

  return {
    nombre: loc.title,
    descripcion: loc.profile?.description ?? null,
    telefono: loc.phoneNumbers?.primaryPhone ?? null,
    web: loc.websiteUri ?? null,
    direccion,
    categoria_principal: loc.categories?.primaryCategory?.displayName ?? null,
    categorias_secundarias: loc.categories?.additionalCategories?.map(c => c.displayName) ?? [],
    horarios: Object.keys(horarios).length > 0 ? horarios : null,
    url_maps: loc.metadata?.mapsUri ?? null,
  }
}
