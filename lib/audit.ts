// Audit logic - Google Places API + Supabase con fallback in-memory
import { supabase } from './supabase'
import { searchPlace, searchCompetitors, normalizePlaceData, calculateGBPScore } from './google-places'
import type { PlaceData } from './google-places'

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

// ─── Generar gaps basados en datos reales ───
function generateGapsFromData(
  mainData: PlaceData | null,
  categoria: string,
  competidores: { data: PlaceData | null; score: number }[]
): GapAuditoria[] {
  // Si no hay datos reales, usar gaps por categoría
  if (!mainData) {
    const categoryKey = categoria?.toLowerCase() || 'default'
    const categoryGaps = GAPS_POR_CATEGORIA[categoryKey] || GAPS_POR_CATEGORIA.default
    const gapCount = getRandomInt(4, 5)
    return categoryGaps.sort(() => Math.random() - 0.5).slice(0, gapCount)
  }

  const gaps: GapAuditoria[] = []
  const bestComp = competidores.reduce((best, c) => (c.data && (!best.data || c.score > best.score)) ? c : best, competidores[0])

  // Fotos
  if (mainData.fotos_count < 10) {
    const compFotos = bestComp?.data?.fotos_count || 20
    gaps.push({
      area: 'Fotos GBP',
      icono: 'Camera',
      impacto: mainData.fotos_count < 5 ? 'critica' : 'alta',
      descripcion: `Solo ${mainData.fotos_count} fotos en tu perfil.${compFotos > mainData.fotos_count ? ` Tu competidor tiene ${compFotos}.` : ''} Google recomienda 20+.`,
      accion_recomendada: 'Subir fotos profesionales del negocio, equipo y servicios/productos.',
    })
  }

  // Reseñas
  const compResenas = bestComp?.data?.resenas_count || 50
  if (mainData.resenas_count < compResenas || mainData.resenas_count < 20) {
    gaps.push({
      area: 'Reseñas',
      icono: 'Star',
      impacto: mainData.resenas_count < 10 ? 'critica' : 'alta',
      descripcion: `${mainData.resenas_count} reseñas con rating ${mainData.rating}/5.${compResenas > mainData.resenas_count ? ` Competidor: ${compResenas} reseñas.` : ''} Más reseñas = más visibilidad.`,
      accion_recomendada: 'Solicitar reseñas a clientes satisfechos. Responder a todas las existentes.',
    })
  }

  // Posts GBP (la API no devuelve posts, siempre es un gap)
  gaps.push({
    area: 'Posts GBP',
    icono: 'FileText',
    impacto: 'alta',
    descripcion: 'Sin actividad de posts detectada. Google recompensa perfiles actualizados semanalmente.',
    accion_recomendada: 'Publicar ofertas, novedades, tips de industria — mínimo 2 posts/semana.',
  })

  // Descripción
  if (!mainData.tiene_descripcion) {
    gaps.push({
      area: 'Descripción y categorías',
      icono: 'Code',
      impacto: 'media',
      descripcion: 'Sin descripción editorial en Google. Esto reduce la relevancia en búsquedas por voz.',
      accion_recomendada: 'Crear descripción con keywords naturales, especialidades y diferenciales.',
    })
  }

  // Horarios
  if (!mainData.horarios_completos) {
    gaps.push({
      area: 'Horarios',
      icono: 'Eye',
      impacto: 'media',
      descripcion: 'Horarios incompletos o no configurados. Google penaliza perfiles sin horarios verificados.',
      accion_recomendada: 'Completar horarios regulares + horarios especiales (festivos, vacaciones).',
    })
  }

  // Web
  if (!mainData.tiene_web) {
    gaps.push({
      area: 'Web vinculada',
      icono: 'Search',
      impacto: 'media',
      descripcion: 'No hay web vinculada al perfil. Los perfiles con web generan más confianza y clics.',
      accion_recomendada: 'Vincular web del negocio al perfil de Google Business Profile.',
    })
  }

  // Rating bajo
  if (mainData.rating > 0 && mainData.rating < 4.0) {
    gaps.push({
      area: 'Rating bajo',
      icono: 'Star',
      impacto: 'critica',
      descripcion: `Rating actual: ${mainData.rating}/5. Google da prioridad a negocios con 4.0+. Los usuarios filtran por estrellas.`,
      accion_recomendada: 'Mejorar experiencia del cliente. Solicitar reseñas positivas. Responder profesionalmente a negativas.',
    })
  }

  // Asegurar mínimo 3 gaps
  if (gaps.length < 3) {
    const categoryKey = categoria?.toLowerCase() || 'default'
    const extraGaps = GAPS_POR_CATEGORIA[categoryKey] || GAPS_POR_CATEGORIA.default
    extraGaps.forEach(g => {
      if (gaps.length < 4 && !gaps.find(existing => existing.area === g.area)) {
        gaps.push(g)
      }
    })
  }

  return gaps.slice(0, 6) // Máximo 6 gaps
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

  // ─── 1. Buscar negocio principal en Google Places ───
  const mainPlace = await searchPlace(formData.nombre_negocio, formData.zona)
  const mainData: PlaceData | null = mainPlace ? normalizePlaceData(mainPlace) : null
  const clientScore = mainData ? calculateGBPScore(mainData) : getRandomInt(25, 65)

  // ─── 2. Buscar competidores ───
  // Si el usuario proporcionó nombres, buscarlos directamente
  // Si no, buscar por categoría + zona
  const competidoresData: { name: string; data: PlaceData | null; score: number }[] = []

  const comp1Name = formData.competidor1 && formData.competidor1 !== 'Competidor 1' ? formData.competidor1 : null
  const comp2Name = formData.competidor2 && formData.competidor2 !== 'Competidor 2' ? formData.competidor2 : null

  if (comp1Name || comp2Name) {
    // Buscar competidores específicos por nombre
    if (comp1Name) {
      const p = await searchPlace(comp1Name, formData.zona)
      const d = p ? normalizePlaceData(p) : null
      competidoresData.push({ name: d?.nombre || comp1Name, data: d, score: d ? calculateGBPScore(d) : getCompetitorScore(clientScore) })
    }
    if (comp2Name) {
      const p = await searchPlace(comp2Name, formData.zona)
      const d = p ? normalizePlaceData(p) : null
      competidoresData.push({ name: d?.nombre || comp2Name, data: d, score: d ? calculateGBPScore(d) : getCompetitorScore(clientScore) })
    }
  } else {
    // Buscar competidores automáticamente por categoría
    const autoComps = await searchCompetitors(formData.categoria, formData.zona, formData.nombre_negocio, 2)
    autoComps.forEach(p => {
      const d = normalizePlaceData(p)
      competidoresData.push({ name: d.nombre, data: d, score: calculateGBPScore(d) })
    })
  }

  // Fallback si no se encontraron competidores
  if (competidoresData.length === 0) {
    competidoresData.push(
      { name: 'Competidor 1 (zona)', data: null, score: getCompetitorScore(clientScore) },
      { name: 'Competidor 2 (zona)', data: null, score: getCompetitorScore(clientScore) }
    )
  }

  // ─── 3. Construir ventajas/debilidades de competidores con datos reales ───
  function buildCompetitor(comp: typeof competidoresData[0]): CompetidorAuditoria {
    const diff = comp.score - clientScore
    const ventajas: string[] = []
    const debilidades: string[] = []

    if (comp.data && mainData) {
      // Comparar datos reales
      if (comp.score > clientScore) ventajas.push(`${diff} puntos más en puntuación`)
      if (comp.data.fotos_count > (mainData.fotos_count || 0)) ventajas.push(`Más fotos (${comp.data.fotos_count} vs ${mainData.fotos_count})`)
      if (comp.data.resenas_count > (mainData.resenas_count || 0)) ventajas.push(`${comp.data.resenas_count} reseñas (verificadas)`)
      if (comp.data.rating > (mainData.rating || 0)) ventajas.push(`Rating ${comp.data.rating}/5 vs ${mainData.rating}/5`)
      if (comp.data.tiene_web && !mainData.tiene_web) ventajas.push('Tiene web vinculada')

      if (!comp.data.horarios_completos) debilidades.push('Horarios incompletos')
      if (!comp.data.tiene_descripcion) debilidades.push('Sin descripción editorial')
      if (comp.data.fotos_count < 5) debilidades.push('Pocas fotos')
      if (comp.data.resenas_count < 10) debilidades.push('Pocas reseñas')
    } else {
      // Fallback simulado
      ventajas.push(`${Math.abs(diff)} puntos más en puntuación`)
      ventajas.push(`Más fotos (${getRandomInt(15, 30)} vs ${getRandomInt(2, 8)})`)
      debilidades.push('Datos no verificados')
    }

    // Asegurar al menos 1 ventaja y 1 debilidad
    if (ventajas.length === 0) ventajas.push('Presencia activa en Maps')
    if (debilidades.length === 0) debilidades.push('Atributos incompletos')

    return {
      nombre: comp.data?.google_maps_url || comp.name,
      puntuacion: comp.score,
      ventajas: ventajas.slice(0, 3),
      debilidades: debilidades.slice(0, 2),
      diferencia_puntos: diff,
    }
  }

  const competidores = competidoresData.map(buildCompetitor)

  // ─── 4. Generar gaps basados en datos reales ───
  const gaps = generateGapsFromData(mainData, formData.categoria, competidoresData)

  // ─── 5. Pack recomendado ───
  const recomendacion_pack = clientScore < 50 ? 'visibilidad_local' : 'autoridad_maps_ia'

  // ─── 6. Resumen ───
  const mediaCompetidores = competidoresData.length > 0
    ? Math.round(competidoresData.reduce((acc, c) => acc + c.score, 0) / competidoresData.length)
    : clientScore + 20

  const dataSource = mainData ? 'datos reales de Google Maps' : 'estimación basada en tu categoría'

  const result: AuditResult = {
    id,
    negocio: {
      nombre: mainData?.nombre || formData.nombre_negocio,
      direccion: mainData?.direccion || formData.direccion,
      zona: formData.zona,
      categoria: formData.categoria,
      puntuacion: clientScore,
      fotos_count: mainData?.fotos_count || getRandomInt(2, 8),
      resenas_count: mainData?.resenas_count || getRandomInt(1, 20),
      posts_gbp: 0, // Google Places API no devuelve posts
      horarios_completos: mainData?.horarios_completos ?? Math.random() > 0.5,
    },
    competidores,
    gaps,
    recomendacion_pack,
    resumen: `Análisis basado en ${dataSource}. Tu negocio tiene ${clientScore}/100 puntos. ${mediaCompetidores > clientScore ? `Tus competidores promedian ${mediaCompetidores} puntos — estás ${mediaCompetidores - clientScore} puntos por debajo.` : 'Estás por encima de la media de tu zona.'} Prioridad: ${gaps[0]?.area.toLowerCase() || 'optimización general'}.`,
    created_at: new Date().toISOString(),
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
      puntuacion: clientScore,
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
