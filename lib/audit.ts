// Audit logic - Supabase con fallback in-memory
import { supabase } from './supabase'

// Types from landing form
export interface AuditFormData {
  nombre_negocio: string
  categoria: string
  direccion: string
  zona: string
  telefono?: string
  email?: string
  nombre_contacto?: string
  puesto?: string
  competidor1?: string
  competidor2?: string
}

// Audit result types
export interface NegocioAuditado {
  nombre: string
  direccion: string
  zona: string
  categoria: string
  puntuacion: number // 0-100
  fotos_count: number
  resenas_count: number
  posts_gbp: number
  horarios_completos: boolean
}

export interface CompetidorAuditoria {
  nombre: string
  puntuacion: number // 0-100
  ventajas: string[]
  debilidades: string[]
  diferencia_puntos: number
}

export interface GapAuditoria {
  area: string // "Fotos GBP", "Reseñas", etc.
  icono: 'Camera' | 'Star' | 'FileText' | 'Code' | 'Eye' | 'MapPin' | 'Search'
  impacto: 'critica' | 'alta' | 'media' | 'baja'
  descripcion: string
  accion_recomendada: string
}

export interface AuditResult {
  id: string
  negocio: NegocioAuditado
  competidores: CompetidorAuditoria[]
  gaps: GapAuditoria[]
  recomendacion_pack: 'visibilidad_local' | 'autoridad_maps_ia'
  resumen: string
  created_at: string
  // Datos del contacto (desde el formulario)
  email?: string
  nombre_contacto?: string
  puesto?: string
  telefono?: string
}

// Mock gaps by category
const GAPS_POR_CATEGORIA: Record<string, GapAuditoria[]> = {
  'clínica dental': [
    {
      area: 'Fotos GBP',
      icono: 'Camera',
      impacto: 'critica',
      descripcion: 'Solo 8 fotos en tu perfil. Google recomienda 20+. Falta galería de tratamientos.',
      accion_recomendada: 'Añadir 12+ fotos de clínica, personal, sonrisas antes/después',
    },
    {
      area: 'Reseñas',
      icono: 'Star',
      impacto: 'alta',
      descripcion: 'Solo 6 reseñas. Competidores tienen 40+. Puntuación: 4.2/5 vs 4.8/5.',
      accion_recomendada: 'Solicitar reseñas a últimos 50 pacientes. Responder a todas.',
    },
    {
      area: 'Posts GBP',
      icono: 'FileText',
      impacto: 'alta',
      descripcion: 'Sin posts. Competidores publican 2/semana. Google da prioridad a perfiles activos.',
      accion_recomendada: 'Crear posts sobre promociones, tips de salud bucodental, horarios especiales.',
    },
    {
      area: 'Descripción',
      icono: 'Code',
      impacto: 'media',
      descripcion: 'Genérica: "Clínica dental con 20 años". Falta especialidades y diferenciales.',
      accion_recomendada: 'Destacar: implantes, estética, cirugía, atención a miedosos, pago flexible.',
    },
    {
      area: 'Atributos GBP',
      icono: 'Eye',
      impacto: 'media',
      descripcion: 'Faltan atributos: "Citas online", "Estacionamiento", "Pago con tarjeta".',
      accion_recomendada: 'Activar todos los atributos disponibles en Google.',
    },
  ],
  restaurante: [
    {
      area: 'Fotos GBP',
      icono: 'Camera',
      impacto: 'critica',
      descripcion: 'Solo 5 fotos. Falta galería de platos, local, ambiente.',
      accion_recomendada: 'Añadir 20+ fotos profesionales de platos estrella, local, mesas, barra.',
    },
    {
      area: 'Menú en GBP',
      icono: 'FileText',
      impacto: 'critica',
      descripcion: 'No hay menú adjunto. Google muestra menús en Maps cuando los hay.',
      accion_recomendada: 'Subir PDF del menú o crear menú digital en Google.',
    },
    {
      area: 'Reseñas',
      icono: 'Star',
      impacto: 'alta',
      descripcion: 'Solo 12 reseñas, puntuación 4.1/5. Competidor principal: 58 reseñas, 4.7/5.',
      accion_recomendada: 'Solicitar reseñas en cada mesa. Responder amablemente a todas.',
    },
    {
      area: 'Posts GBP',
      icono: 'Code',
      impacto: 'alta',
      descripcion: 'Sin posts sobre ofertas, menú del día, eventos especiales.',
      accion_recomendada: 'Publicar menú del día, ofertas happy hour, eventos, novedades.',
    },
    {
      area: 'Horarios actualizados',
      icono: 'Eye',
      impacto: 'media',
      descripcion: 'Cierres estacionales o especiales no registrados.',
      accion_recomendada: 'Actualizar horarios con cierres navideños y vacaciones.',
    },
  ],
  default: [
    {
      area: 'Fotos GBP',
      icono: 'Camera',
      impacto: 'alta',
      descripcion: 'Perfil con pocas fotos (<5). Google prioriza perfiles visuales.',
      accion_recomendada: 'Subir 15+ fotos profesionales del negocio, equipo, productos/servicios.',
    },
    {
      area: 'Reseñas',
      icono: 'Star',
      impacto: 'alta',
      descripcion: 'Pocas reseñas o puntuación baja respecto a competencia.',
      accion_recomendada: 'Solicitar reseñas activamente. Responder a todas con profesionalismo.',
    },
    {
      area: 'Posts GBP',
      icono: 'FileText',
      impacto: 'alta',
      descripcion: 'Sin actividad de posts. Google recompensa perfiles actualizados.',
      accion_recomendada: 'Publicar ofertas, novedades, eventos, tips de industria 2/semana.',
    },
    {
      area: 'Descripción y categorías',
      icono: 'Code',
      impacto: 'media',
      descripcion: 'Descripción genérica o categorías mal elegidas.',
      accion_recomendada: 'Optimizar descripción con diferenciales. Seleccionar categorías exactas.',
    },
  ],
}

// Mock audit store (in-memory for dev)
// Usar globalThis para que persista entre recargas de HMR en dev
const globalForAudit = globalThis as typeof globalThis & {
  _radarAuditStore?: Map<string, AuditResult>
}
if (!globalForAudit._radarAuditStore) {
  globalForAudit._radarAuditStore = new Map<string, AuditResult>()
}
const AUDIT_STORE = globalForAudit._radarAuditStore

function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getCompetitorScore(clientScore: number): number {
  // Competitors always score 10-30 points higher
  return Math.min(100, clientScore + getRandomInt(10, 30))
}

export async function runAudit(formData: AuditFormData): Promise<AuditResult> {
  const id = generateAuditId()
  
  // Client baseline score based on category
  const clientBaseScore = getRandomInt(25, 65)
  
  // Competitors score higher
  const competitor1Score = getCompetitorScore(clientBaseScore)
  const competitor2Score = getCompetitorScore(clientBaseScore)
  
  // Select gaps based on category
  const categoryKey = formData.categoria?.toLowerCase() || 'default'
  const categoryGaps = GAPS_POR_CATEGORIA[categoryKey] || GAPS_POR_CATEGORIA.default
  
  // Randomly select 4-5 gaps
  const gapCount = getRandomInt(4, 5)
  const gaps = categoryGaps
    .sort(() => Math.random() - 0.5)
    .slice(0, gapCount)
  
  // Determine recommended pack based on client score
  const recomendacion_pack = clientBaseScore < 50 ? 'visibilidad_local' : 'autoridad_maps_ia'
  
  const result: AuditResult = {
    id,
    negocio: {
      nombre: formData.nombre_negocio,
      direccion: formData.direccion,
      zona: formData.zona,
      categoria: formData.categoria,
      puntuacion: clientBaseScore,
      fotos_count: getRandomInt(2, 8),
      resenas_count: getRandomInt(1, 20),
      posts_gbp: getRandomInt(0, 5),
      horarios_completos: Math.random() > 0.5,
    },
    competidores: [
      {
        nombre: formData.competidor1 || 'Competidor 1 (Maps)',
        puntuacion: competitor1Score,
        ventajas: [
          `${competitor1Score - clientBaseScore} puntos más en puntuación`,
          `Más fotos (${getRandomInt(15, 30)} vs ${getRandomInt(2, 8)})`,
          `${getRandomInt(2, 5)} posts mensuales (actualizados)`,
        ],
        debilidades: Math.random() > 0.5 ? ['Reseñas desactualizadas', 'Horarios incorrectos'] : ['Descripción genérica'],
        diferencia_puntos: competitor1Score - clientBaseScore,
      },
      {
        nombre: formData.competidor2 || 'Competidor 2 (Maps)',
        puntuacion: competitor2Score,
        ventajas: [
          `${competitor2Score - clientBaseScore} puntos más en puntuación`,
          `${getRandomInt(30, 60)} reseñas (verificadas)`,
          `Presencia activa (posts semanales)`,
        ],
        debilidades: Math.random() > 0.5 ? ['Ubicación menos central', 'Horario más limitado'] : ['Atributos incompletos'],
        diferencia_puntos: competitor2Score - clientBaseScore,
      },
    ],
    gaps,
    recomendacion_pack,
    resumen: `Tu negocio tiene una puntuación de ${clientBaseScore}/100 en Google Maps. Tus competidores obtienen ${Math.round((competitor1Score + competitor2Score) / 2)} puntos. Con un enfoque en ${gaps[0]?.area.toLowerCase() || 'mejora'}, podrías escalar rápidamente.`,
    created_at: new Date().toISOString(),
    // Guardar datos de contacto del formulario
    email: formData.email,
    nombre_contacto: formData.nombre_contacto,
    puesto: formData.puesto,
    telefono: formData.telefono,
  }

  // Guardar en Supabase si disponible, sino in-memory
  if (supabase) {
    const { error } = await supabase.from('auditorias').insert({
      id,
      nombre_negocio: formData.nombre_negocio,
      direccion: formData.direccion,
      zona: formData.zona,
      categoria: formData.categoria,
      puntuacion: clientBaseScore,
      competidores: result.competidores,
      gaps: result.gaps,
      recomendacion_pack,
      email: formData.email || '',
      nombre_contacto: formData.nombre_contacto || '',
      puesto: formData.puesto || '',
      telefono: formData.telefono || '',
    })
    if (error) {
      console.error('[audit] Error guardando en Supabase:', error)
      // Fallback a in-memory
      AUDIT_STORE.set(id, result)
    }
  } else {
    AUDIT_STORE.set(id, result)
  }

  return result
}

// Reconstruir AuditResult desde fila de Supabase
function rowToAuditResult(row: Record<string, unknown>): AuditResult {
  const competidores = row.competidores as CompetidorAuditoria[]
  const gaps = row.gaps as GapAuditoria[]
  const puntuacion = row.puntuacion as number

  return {
    id: row.id as string,
    negocio: {
      nombre: row.nombre_negocio as string,
      direccion: row.direccion as string,
      zona: row.zona as string,
      categoria: row.categoria as string,
      puntuacion,
      fotos_count: 0,
      resenas_count: 0,
      posts_gbp: 0,
      horarios_completos: false,
    },
    competidores,
    gaps,
    recomendacion_pack: row.recomendacion_pack as 'visibilidad_local' | 'autoridad_maps_ia',
    resumen: `Tu negocio tiene una puntuación de ${puntuacion}/100 en Google Maps.`,
    created_at: (row.created_at as string) || new Date().toISOString(),
    email: (row.email as string) || '',
    nombre_contacto: (row.nombre_contacto as string) || '',
    puesto: (row.puesto as string) || '',
    telefono: (row.telefono as string) || '',
  }
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
      return rowToAuditResult(data)
    }
    if (error) {
      console.error('[audit] Error leyendo de Supabase:', error)
    }
  }

  // Fallback a in-memory
  return AUDIT_STORE.get(id) || null
}

export async function saveAudit(result: AuditResult): Promise<string> {
  if (supabase) {
    const { error } = await supabase.from('auditorias').upsert({
      id: result.id,
      nombre_negocio: result.negocio.nombre,
      direccion: result.negocio.direccion,
      zona: result.negocio.zona,
      categoria: result.negocio.categoria,
      puntuacion: result.negocio.puntuacion,
      competidores: result.competidores,
      gaps: result.gaps,
      recomendacion_pack: result.recomendacion_pack,
      email: result.email || '',
      nombre_contacto: result.nombre_contacto || '',
      puesto: result.puesto || '',
      telefono: result.telefono || '',
    })
    if (error) {
      console.error('[audit] Error en saveAudit Supabase:', error)
      AUDIT_STORE.set(result.id, result)
    }
  } else {
    AUDIT_STORE.set(result.id, result)
  }
  return result.id
}
