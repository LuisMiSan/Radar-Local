// Tipos globales del proyecto Radar Local Agency

// Packs de servicio
export type Pack = 'visibilidad_local' | 'autoridad_maps_ia'

// Estados del pipeline CRM (en orden de progresión)
// lead → contactado → llamada_info → propuesta_enviada → negociando → llamada_onboarding → activo → pausado → eliminado
export type EstadoCliente = 'lead' | 'contactado' | 'llamada_info' | 'propuesta_enviada' | 'negociando' | 'llamada_onboarding' | 'activo' | 'pausado' | 'eliminado'
export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'error'

// Niveles de autonomía — qué nivel de control humano requiere cada acción
// 🟢 auto_ejecutar: se ejecuta sin preguntar (posts, descripciones, schemas)
// 🟡 notificar: se ejecuta pero se notifica al admin (reseñas neutras, categorías secundarias)
// 🔴 aprobar: NO se ejecuta hasta que el admin lo apruebe (NAP, reseñas negativas, eliminaciones)
export type NivelAutonomia = 'auto_ejecutar' | 'notificar' | 'aprobar'

// Estados para tareas de ejecución (lo que los agentes HACEN, no solo reportan)
export type TipoEjecucion = 'auto' | 'revision' | 'manual'
export type PrioridadTarea = 'critica' | 'alta' | 'media' | 'baja'
export type EstadoEjecucion = 'pendiente' | 'aprobada' | 'ejecutando' | 'completada' | 'fallo' | 'rechazada' | 'omitida'
export type CategoriaEjecucion = 'mejora' | 'correccion' | 'creacion' | 'verificacion'
export type EstadoReporte = 'borrador' | 'enviado'

// Agentes IA disponibles
export type Agente =
  | 'auditor_gbp'
  | 'optimizador_nap'
  | 'keywords_locales'
  | 'gestor_resenas'
  | 'redactor_posts_gbp'
  | 'generador_schema'
  | 'creador_faq_geo'
  | 'generador_chunks'
  | 'tldr_entidad'
  | 'monitor_ias'
  | 'generador_reporte'
  | 'prospector_web'
  | 'supervisor'

// Tabla: clientes
export interface Cliente {
  id: string
  nombre: string
  negocio: string
  email: string | null
  telefono: string | null
  direccion: string | null
  web: string | null
  pack: Pack | null
  es_fundador: boolean
  estado: EstadoCliente
  notas: string | null
  created_at: string
  updated_at: string
}

// Tabla: perfiles_gbp
export interface PerfilGBP {
  id: string
  cliente_id: string
  google_business_id: string | null
  nombre_gbp: string | null
  categoria: string | null
  descripcion: string | null
  horarios: Record<string, unknown> | null
  fotos_count: number
  resenas_count: number
  puntuacion: number | null
  nap_nombre: string | null
  nap_direccion: string | null
  nap_telefono: string | null
  url_maps: string | null
  created_at: string
  updated_at: string
}

// Tabla: tareas
export interface Tarea {
  id: string
  cliente_id: string
  agente: string
  tipo: string
  estado: EstadoTarea
  resultado: Record<string, unknown> | null
  created_at: string
  completed_at: string | null
}

// Tabla: metricas
export interface Metrica {
  id: string
  cliente_id: string
  tipo: string
  valor: number | null
  fecha: string
  metadata: Record<string, unknown> | null
  created_at: string
}

// Tabla: reportes
export interface Reporte {
  id: string
  cliente_id: string
  mes: string
  contenido: Record<string, unknown> | null
  estado: EstadoReporte
  created_at: string
}

// Tabla: tareas_ejecucion (lo que los agentes EJECUTAN)
export interface TareaEjecucion {
  id: string
  cliente_id: string
  agente: Agente
  informe_id: string | null
  titulo: string
  descripcion: string
  categoria: CategoriaEjecucion
  tipo: TipoEjecucion          // auto | revision | manual
  prioridad: PrioridadTarea    // critica | alta | media | baja
  estado: EstadoEjecucion      // pendiente | aprobada | ejecutando | completada | fallo | rechazada | omitida
  campo_gbp: string | null     // qué campo del GBP afecta
  valor_actual: string | null  // valor actual
  valor_propuesto: string | null // lo que el agente propone
  accion_api: Record<string, unknown> | null  // datos para la API de GBP
  resultado: string | null     // qué pasó al ejecutar
  error: string | null         // detalle del error si falló
  aprobado_por: string | null
  aprobado_en: string | null
  ejecutado_en: string | null
  created_at: string
  updated_at: string
}

// Resumen de progreso por cliente (vista SQL)
export interface ResumenProgreso {
  cliente_id: string
  agente: Agente
  total_tareas: number
  completadas: number
  pendientes: number
  esperando_aprobacion: number
  en_ejecucion: number
  fallidas: number
  porcentaje_completado: number
}

// Helpers para labels en UI
export const PACK_LABELS: Record<Pack, string> = {
  visibilidad_local: 'Visibilidad Local',
  autoridad_maps_ia: 'Autoridad Maps + IA',
}

export const ESTADO_LABELS: Record<EstadoCliente, string> = {
  lead: 'Lead',
  contactado: 'Contactado',
  llamada_info: 'Llamada de información',
  propuesta_enviada: 'Propuesta enviada',
  negociando: 'Negociando',
  llamada_onboarding: 'Llamada de onboarding',
  activo: 'Activo',
  pausado: 'Pausado',
  eliminado: 'Eliminado',
}

// Colores para cada estado del pipeline (usado en UI)
export const ESTADO_COLORS: Record<EstadoCliente, { bg: string; text: string; dot: string }> = {
  lead: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  contactado: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  llamada_info: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  propuesta_enviada: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  negociando: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  llamada_onboarding: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  activo: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  pausado: { bg: 'bg-neutral-50', text: 'text-neutral-500', dot: 'bg-neutral-400' },
  eliminado: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

// Orden del pipeline para la vista Kanban
export const PIPELINE_ORDER: EstadoCliente[] = [
  'lead', 'contactado', 'llamada_info', 'propuesta_enviada', 'negociando', 'llamada_onboarding', 'activo', 'pausado', 'eliminado',
]

export const TIPO_EJECUCION_LABELS: Record<TipoEjecucion, string> = {
  auto: 'Automático',
  revision: 'Requiere aprobación',
  manual: 'Manual',
}

export const NIVEL_AUTONOMIA_LABELS: Record<NivelAutonomia, string> = {
  auto_ejecutar: '🟢 Auto-ejecutar',
  notificar: '🟡 Notificar',
  aprobar: '🔴 Requiere aprobación',
}

export const NIVEL_AUTONOMIA_COLORS: Record<NivelAutonomia, { bg: string; text: string; dot: string }> = {
  auto_ejecutar: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  notificar: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  aprobar: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

// ── Mapeo de autonomía por campo GBP ──────────────────────────
// Define qué nivel de control requiere cada tipo de cambio
export const AUTONOMIA_POR_CAMPO: Record<string, NivelAutonomia> = {
  // 🟢 Auto-ejecutar — sin consecuencias graves
  descripcion: 'auto_ejecutar',
  posts: 'auto_ejecutar',
  fotos_descripcion: 'auto_ejecutar',   // textos alt de fotos
  fotos: 'auto_ejecutar',               // subir fotos
  schema_jsonld: 'auto_ejecutar',
  faq: 'auto_ejecutar',
  chunks_contenido: 'auto_ejecutar',
  tldr_entidad: 'auto_ejecutar',
  atributos: 'auto_ejecutar',           // completar atributos
  atributos_secundarios: 'auto_ejecutar',
  respuesta_resena_positiva: 'auto_ejecutar',

  // 🟡 Notificar — se ejecuta pero avisa al admin
  respuesta_resena_neutra: 'notificar',
  categorias_secundarias: 'notificar',
  horarios: 'notificar',
  servicios: 'notificar',
  productos: 'notificar',

  // 🔴 Requiere aprobación — riesgo alto
  nombre: 'aprobar',
  direccion: 'aprobar',
  telefono: 'aprobar',
  categoria_principal: 'aprobar',
  respuesta_resena_negativa: 'aprobar',
  eliminacion: 'aprobar',
  web: 'aprobar',
  verificacion: 'aprobar',
}

// Helper: determinar nivel de autonomía de una tarea
export function getNivelAutonomia(
  tipo: TipoEjecucion,
  campoGbp: string | null,
  prioridad: PrioridadTarea
): NivelAutonomia {
  // Manual siempre requiere aprobación (intervención humana)
  if (tipo === 'manual') return 'aprobar'

  // Si tiene campo GBP específico, usar el mapeo
  if (campoGbp && AUTONOMIA_POR_CAMPO[campoGbp]) {
    return AUTONOMIA_POR_CAMPO[campoGbp]
  }

  // Prioridad crítica siempre necesita aprobación
  if (prioridad === 'critica') return 'aprobar'

  // Por defecto: auto se auto-ejecuta, revision necesita aprobación
  if (tipo === 'auto') return 'auto_ejecutar'
  return 'aprobar'
}

export const PRIORIDAD_LABELS: Record<PrioridadTarea, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export const PRIORIDAD_COLORS: Record<PrioridadTarea, { bg: string; text: string }> = {
  critica: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-700 dark:text-red-300' },
  alta: { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300' },
  media: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300' },
  baja: { bg: 'bg-neutral-50 dark:bg-neutral-900', text: 'text-neutral-600 dark:text-neutral-400' },
}

export const ESTADO_EJECUCION_LABELS: Record<EstadoEjecucion, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  ejecutando: 'Ejecutando...',
  completada: 'Completada',
  fallo: 'Falló',
  rechazada: 'Rechazada',
  omitida: 'Omitida',
}

export const ESTADO_EJECUCION_COLORS: Record<EstadoEjecucion, { bg: string; text: string; dot: string }> = {
  pendiente: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  aprobada: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  ejecutando: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  completada: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  fallo: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  rechazada: { bg: 'bg-neutral-50', text: 'text-neutral-500', dot: 'bg-neutral-400' },
  omitida: { bg: 'bg-neutral-50', text: 'text-neutral-400', dot: 'bg-neutral-300' },
}

export const AGENTE_LABELS: Record<Agente, string> = {
  auditor_gbp: 'Auditor GBP',
  optimizador_nap: 'Optimizador NAP',
  keywords_locales: 'Keywords Locales',
  gestor_resenas: 'Gestor Reseñas',
  redactor_posts_gbp: 'Redactor Posts GBP',
  generador_schema: 'Generador Schema',
  creador_faq_geo: 'Creador FAQ GEO',
  generador_chunks: 'Generador Chunks',
  tldr_entidad: 'TL;DR Entidad',
  monitor_ias: 'Monitor IAs',
  generador_reporte: 'Generador Reporte',
  prospector_web: 'Prospector Web',
  supervisor: 'Supervisor',
}
