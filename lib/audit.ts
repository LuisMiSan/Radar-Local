// Lógica de auditoría gratuita — Supabase con fallback in-memory
// Compara el negocio del prospecto vs 2 competidores cercanos

import { supabase } from './supabase'
import { supabaseAdmin } from './supabase-admin'

export interface AuditInput {
  nombre_negocio: string
  direccion: string
  zona: string
  categoria: string // ej: "clinica dental", "fisioterapia", "veterinaria"
  nombre_contacto: string
  puesto: string
  telefono: string
  email: string
  competidor1?: string
  competidor2?: string
}

export interface AuditCompetidor {
  nombre: string
  puntuacion: number
  ventajas: string[]
  debilidades: string[]
}

export interface AuditGap {
  area: string
  impacto: 'alto' | 'medio' | 'bajo'
  descripcion: string
  icono: string
}

export interface AuditDimension {
  dimension: string
  tu_negocio: number
  competidor1: number
  competidor2: number
}

export interface AuditResult {
  id: string
  negocio: {
    nombre: string
    direccion: string
    zona: string
    categoria: string
    puntuacion: number
  }
  email: string
  nombre_contacto?: string
  puesto?: string
  telefono?: string
  competidores: AuditCompetidor[]
  gaps: AuditGap[]
  dimensiones: AuditDimension[]
  recomendacion_pack: 'visibilidad_local' | 'autoridad_maps_ia'
  created_at: string
}

// Almacenamiento fallback en memoria (si Supabase no disponible)
// Usamos declare global para tipar correctamente sin casteos inseguros
declare global {
  // eslint-disable-next-line no-var
  var _radarAuditStore: Map<string, AuditResult> | undefined
}
if (!globalThis._radarAuditStore) globalThis._radarAuditStore = new Map<string, AuditResult>()
const AUDIT_STORE = globalThis._radarAuditStore

// Emails del admin que pueden hacer auditorías ilimitadas
const ADMIN_EMAILS = [
  'iadivision@iadivision.es',
  'luismigsm@gmail.com',
  'luismigsm@hotmail.com',
]

/**
 * Verifica si ya existe una auditoría con los mismos datos de contacto.
 * Comprueba email, teléfono, nombre_contacto y puesto.
 * Los admins están exentos.
 */
export async function checkDuplicate(input: AuditInput): Promise<string | null> {
  if (ADMIN_EMAILS.includes(input.email.toLowerCase())) return null

  if (!supabaseAdmin) return null // sin Supabase no podemos verificar

  // Buscar por email O teléfono O (nombre_contacto + puesto)
  const { data, error } = await supabaseAdmin
    .from('auditorias')
    .select('id')
    .or(`email.eq.${input.email},telefono.eq.${input.telefono},and(nombre_contacto.eq.${input.nombre_contacto},puesto.eq.${input.puesto})`)
    .limit(1)

  if (error) {
    console.error('[audit] Error checking duplicate:', error.message)
    return null // en caso de error, permitir (fail open)
  }

  if (data && data.length > 0) {
    return 'Ya existe una auditoría con estos datos de contacto. Si necesitas otra auditoría, contacta con nosotros.'
  }

  return null
}

export async function runAudit(input: AuditInput): Promise<AuditResult> {
  // Simular latencia de procesamiento
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))

  const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  // Puntuación base del negocio (simulada según categoría)
  const puntuacionBase = 30 + Math.floor(Math.random() * 25)

  // Generar 2 competidores — usa nombres reales si el usuario los proporcionó
  const competidores = generarCompetidores(input.categoria, input.zona, input.competidor1, input.competidor2)

  // Detectar gaps
  const gaps = generarGaps(puntuacionBase)

  // Generar dimensiones para gráficos
  const dimensiones = generarDimensiones(puntuacionBase)

  // Recomendar pack según puntuación
  const recomendacion_pack =
    puntuacionBase < 40 ? 'autoridad_maps_ia' : 'visibilidad_local'

  const result: AuditResult = {
    id,
    negocio: {
      nombre: input.nombre_negocio,
      direccion: input.direccion,
      zona: input.zona,
      categoria: input.categoria,
      puntuacion: puntuacionBase,
    },
    email: input.email,
    competidores,
    gaps,
    dimensiones,
    recomendacion_pack,
    created_at: new Date().toISOString(),
  }

  // Persistir en Supabase si disponible, sino en memoria
  // IMPORTANTE: Usamos SOLO supabaseAdmin (service_role) para INSERT
  // La clave anon NO tiene permisos de escritura (bloqueada por RLS)
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from('auditorias').insert({
      id: result.id,
      nombre_negocio: result.negocio.nombre,
      direccion: result.negocio.direccion,
      zona: result.negocio.zona,
      categoria: result.negocio.categoria,
      nombre_contacto: input.nombre_contacto,
      puesto: input.puesto,
      telefono: input.telefono,
      email: input.email,
      puntuacion: result.negocio.puntuacion,
      competidores: result.competidores,
      gaps: result.gaps,
      dimensiones: result.dimensiones,
      recomendacion_pack: result.recomendacion_pack,
    })
    if (error) {
      console.error('[audit] Supabase insert error, fallback in-memory:', error.message)
      AUDIT_STORE.set(id, result)
    }
  } else {
    AUDIT_STORE.set(id, result)
  }

  return result
}

export async function getAuditById(id: string): Promise<AuditResult | null> {
  // Intentar Supabase primero
  if (supabase) {
    const { data, error } = await supabase
      .from('auditorias')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      return {
        id: data.id,
        negocio: {
          nombre: data.nombre_negocio,
          direccion: data.direccion,
          zona: data.zona,
          categoria: data.categoria,
          puntuacion: data.puntuacion,
        },
        email: data.email ?? '',
        nombre_contacto: data.nombre_contacto ?? undefined,
        puesto: data.puesto ?? undefined,
        telefono: data.telefono ?? undefined,
        competidores: data.competidores as AuditCompetidor[],
        gaps: data.gaps as AuditGap[],
        dimensiones: (data.dimensiones as AuditDimension[]) ?? [],
        recomendacion_pack: data.recomendacion_pack as AuditResult['recomendacion_pack'],
        created_at: data.created_at,
      }
    }
    // Si no se encuentra en Supabase, probar fallback
    if (error) {
      console.error('[audit] Supabase select error, fallback in-memory:', error.message)
    }
  }

  return AUDIT_STORE.get(id) ?? null
}

// --- Helpers de generación mock ---

function generarCompetidores(
  categoria: string,
  zona: string,
  competidor1?: string,
  competidor2?: string,
): AuditCompetidor[] {
  // Si el usuario proporcionó nombres, usarlos
  // Si no, generar nombres genéricos por categoría
  const nombresFallback: Record<string, string[]> = {
    'clinica dental': ['Dental Plus', 'Clínica Sonríe'],
    fisioterapia: ['FisioVital', 'Centro Fisio Salud'],
    veterinaria: ['Clínica Veterinaria Luna', 'VetSalud 24h'],
    peluqueria: ['Estilo & Corte', 'Hair Studio Pro'],
    restaurante: ['La Buena Mesa', 'Sabores del Barrio'],
  }

  const fallback = nombresFallback[categoria.toLowerCase()] ?? [
    `${categoria} Premium`,
    `${categoria} Centro`,
  ]

  const nombre1 = competidor1 || `${fallback[0]} (${zona})`
  const nombre2 = competidor2 || `${fallback[1]} (${zona})`

  return [
    {
      nombre: nombre1,
      puntuacion: 68 + Math.floor(Math.random() * 15),
      ventajas: [
        'Perfil GBP completo con fotos actualizadas semanalmente',
        'Responde a todas las reseñas en menos de 24h',
        'Publica posts semanales en Google Business',
        'Web optimizada con contenido local de calidad',
      ],
      debilidades: [
        'Sin schema markup en la web',
        'No aparece en búsquedas por voz ni en IAs',
      ],
    },
    {
      nombre: nombre2,
      puntuacion: 60 + Math.floor(Math.random() * 18),
      ventajas: [
        'NAP consistente en todos los directorios',
        'Buena puntuación de reseñas (4.6★)',
        'Categoría GBP correctamente configurada',
      ],
      debilidades: [
        'Pocas fotos en el perfil de Google',
        'Sin FAQ optimizadas para IAs generativas',
        'Web sin contenido local ni blog',
      ],
    },
  ]
}

function generarDimensiones(puntuacionBase: number): AuditDimension[] {
  // Generar puntuaciones por dimensión para cada actor
  // Tu negocio: débil en la mayoría, competidores más fuertes
  const dims = ['Fotos GBP', 'Reseñas', 'Posts GBP', 'Schema Web', 'NAP', 'SEO Local']
  return dims.map((dimension) => {
    // Tu negocio: puntuación baja correlacionada con la puntuación general
    const base = puntuacionBase
    const tuScore = Math.max(10, Math.min(95, base + Math.floor(Math.random() * 20) - 10))
    // Competidores: generalmente más altos
    const c1Score = Math.max(30, Math.min(95, 65 + Math.floor(Math.random() * 25)))
    const c2Score = Math.max(25, Math.min(90, 55 + Math.floor(Math.random() * 30)))
    return {
      dimension,
      tu_negocio: tuScore,
      competidor1: c1Score,
      competidor2: c2Score,
    }
  })
}

function generarGaps(puntuacion: number): AuditGap[] {
  const todosGaps: AuditGap[] = [
    {
      area: 'Fotos GBP',
      impacto: 'alto',
      descripcion:
        'Tu perfil tiene pocas fotos o desactualizadas. Los negocios con +10 fotos reciben 42% más solicitudes de ruta.',
      icono: 'Camera',
    },
    {
      area: 'Reseñas sin responder',
      impacto: 'alto',
      descripcion:
        'Hay reseñas sin respuesta. Google premia los negocios que responden activamente a sus reseñas.',
      icono: 'Star',
    },
    {
      area: 'Posts GBP inactivos',
      impacto: 'alto',
      descripcion:
        'No publicas posts en Google Business. Los negocios activos tienen 2x más visibilidad en Maps.',
      icono: 'FileText',
    },
    {
      area: 'Schema Markup',
      impacto: 'medio',
      descripcion:
        'Tu web no tiene schema LocalBusiness. Esto impide que Google entienda tu negocio para resultados enriquecidos.',
      icono: 'Code',
    },
    {
      area: 'Presencia en LLMs',
      impacto: 'medio',
      descripcion:
        'Tu negocio no aparece cuando se pregunta a ChatGPT o Gemini por tu categoría en tu zona.',
      icono: 'Eye',
    },
    {
      area: 'NAP inconsistente',
      impacto: 'medio',
      descripcion:
        'El nombre, dirección y teléfono no coinciden en todos los directorios. Esto confunde a Google.',
      icono: 'MapPin',
    },
    {
      area: 'Keywords locales',
      impacto: 'bajo',
      descripcion:
        'No estás optimizando para las búsquedas locales más frecuentes de tu zona y categoría.',
      icono: 'Search',
    },
  ]

  // Más gaps si peor puntuación
  const numGaps = puntuacion < 35 ? 6 : puntuacion < 45 ? 5 : 4
  return todosGaps.slice(0, numGaps)
}
