// Lógica de auditoría gratuita — mock-first
// Compara el negocio del prospecto vs 2 competidores cercanos

export interface AuditInput {
  nombre_negocio: string
  direccion: string
  zona: string
  categoria: string // ej: "clinica dental", "fisioterapia", "veterinaria"
  telefono?: string
  email?: string
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

export interface AuditResult {
  id: string
  negocio: {
    nombre: string
    direccion: string
    zona: string
    categoria: string
    puntuacion: number
  }
  competidores: AuditCompetidor[]
  gaps: AuditGap[]
  recomendacion_pack: 'visibilidad_local' | 'autoridad_maps_ia'
  created_at: string
}

// Almacenamiento temporal en memoria (mock — sin DB)
// Usamos globalThis para que el Map sobreviva hot-module reloads en Next.js dev mode
const g = globalThis as unknown as { _radarAuditStore?: Map<string, AuditResult> }
if (!g._radarAuditStore) g._radarAuditStore = new Map<string, AuditResult>()
const AUDIT_STORE = g._radarAuditStore

export async function runAudit(input: AuditInput): Promise<AuditResult> {
  // Simular latencia de procesamiento
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))

  const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  // Puntuación base del negocio (simulada según categoría)
  const puntuacionBase = 30 + Math.floor(Math.random() * 25)

  // Generar 2 competidores simulados con mejor puntuación
  const competidores = generarCompetidores(input.categoria, input.zona)

  // Detectar gaps
  const gaps = generarGaps(puntuacionBase)

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
    competidores,
    gaps,
    recomendacion_pack,
    created_at: new Date().toISOString(),
  }

  // Guardar en memoria
  AUDIT_STORE.set(id, result)

  return result
}

export async function getAuditById(id: string): Promise<AuditResult | null> {
  return AUDIT_STORE.get(id) ?? null
}

// --- Helpers de generación mock ---

function generarCompetidores(
  categoria: string,
  zona: string
): AuditCompetidor[] {
  const nombres: Record<string, string[]> = {
    'clinica dental': ['Dental Plus', 'Clínica Sonríe'],
    fisioterapia: ['FisioVital', 'Centro Fisio Salud'],
    veterinaria: ['Clínica Veterinaria Luna', 'VetSalud 24h'],
    peluqueria: ['Estilo & Corte', 'Hair Studio Pro'],
    restaurante: ['La Buena Mesa', 'Sabores del Barrio'],
  }

  const nombresCategoria = nombres[categoria.toLowerCase()] ?? [
    `${categoria} Premium`,
    `${categoria} Centro`,
  ]

  return [
    {
      nombre: `${nombresCategoria[0]} (${zona})`,
      puntuacion: 68 + Math.floor(Math.random() * 15),
      ventajas: [
        'Perfil GBP completo con fotos actualizadas',
        'Responde a todas las reseñas en <24h',
        'Posts semanales en Google Business',
      ],
      debilidades: [
        'Sin schema markup en web',
        'No aparece en búsquedas por voz',
      ],
    },
    {
      nombre: `${nombresCategoria[1]} (${zona})`,
      puntuacion: 60 + Math.floor(Math.random() * 18),
      ventajas: [
        'NAP consistente en directorios',
        'Buena puntuación de reseñas (4.6★)',
        'Categoría GBP bien configurada',
      ],
      debilidades: [
        'Pocas fotos en perfil',
        'Sin FAQ optimizadas para IA',
        'Web sin contenido local',
      ],
    },
  ]
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
