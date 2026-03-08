// Tipos globales del proyecto Radar Local Agency

// Packs de servicio
export type Pack = 'visibilidad_local' | 'autoridad_maps_ia'

// Estados
export type EstadoCliente = 'activo' | 'inactivo' | 'pausado'
export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'error'
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

// Helpers para labels en UI
export const PACK_LABELS: Record<Pack, string> = {
  visibilidad_local: 'Visibilidad Local',
  autoridad_maps_ia: 'Autoridad Maps + IA',
}

export const ESTADO_LABELS: Record<EstadoCliente, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  pausado: 'Pausado',
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
}
