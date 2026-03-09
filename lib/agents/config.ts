import type { AgentConfig } from './types'

// Registro de metadata de los 11 agentes
// Agentes 1-5: Map Pack (Pack Visibilidad Local + Autoridad Maps + IA)
// Agentes 6-10: GEO/AEO en LLMs (solo Pack Autoridad Maps + IA)
// Agente 11: Reporte (solo Pack Autoridad Maps + IA)

export const AGENT_CONFIGS: AgentConfig[] = [
  // ── Map Pack (Agentes 1-5) ──────────────────────────────
  {
    id: 'auditor_gbp',
    nombre: 'Auditor GBP',
    descripcion: 'Auditoría completa del perfil de Google Business Profile. Detecta problemas y oportunidades para mejorar posición en Map Pack.',
    icono: 'ClipboardCheck',
    packs: ['visibilidad_local', 'autoridad_maps_ia'],
    categoria: 'map_pack',
  },
  {
    id: 'optimizador_nap',
    nombre: 'Optimizador NAP',
    descripcion: 'Verifica consistencia de Nombre, Dirección y Teléfono en directorios. Clave para ranking en Maps.',
    icono: 'MapPin',
    packs: ['visibilidad_local', 'autoridad_maps_ia'],
    categoria: 'map_pack',
  },
  {
    id: 'keywords_locales',
    nombre: 'Keywords Locales',
    descripcion: 'Investigación de keywords con intención local y de voz. Identifica términos que activan Map Pack y resultados de IA.',
    icono: 'Search',
    packs: ['visibilidad_local', 'autoridad_maps_ia'],
    categoria: 'map_pack',
  },
  {
    id: 'gestor_resenas',
    nombre: 'Gestor Reseñas',
    descripcion: 'Análisis de reseñas y generación de respuestas optimizadas. Las reseñas impactan directamente el ranking en Maps.',
    icono: 'Star',
    packs: ['visibilidad_local', 'autoridad_maps_ia'],
    categoria: 'map_pack',
  },
  {
    id: 'redactor_posts_gbp',
    nombre: 'Redactor Posts GBP',
    descripcion: 'Crea posts para Google Business Profile optimizados para Map Pack. Contenido que mejora visibilidad local.',
    icono: 'PenTool',
    packs: ['visibilidad_local', 'autoridad_maps_ia'],
    categoria: 'map_pack',
  },

  // ── GEO/AEO en LLMs (Agentes 6-10) ─────────────────────
  {
    id: 'generador_schema',
    nombre: 'Generador Schema',
    descripcion: 'Genera JSON-LD (LocalBusiness, FAQPage, etc.) para que los LLMs entiendan y recomienden el negocio.',
    icono: 'Code',
    packs: ['autoridad_maps_ia'],
    categoria: 'geo_aeo',
  },
  {
    id: 'creador_faq_geo',
    nombre: 'Creador FAQ GEO',
    descripcion: 'Crea preguntas frecuentes optimizadas para aparecer en respuestas de Gemini, ChatGPT y Perplexity.',
    icono: 'HelpCircle',
    packs: ['autoridad_maps_ia'],
    categoria: 'geo_aeo',
  },
  {
    id: 'generador_chunks',
    nombre: 'Generador Chunks',
    descripcion: 'Genera bloques de contenido optimizados para ser citados por IAs generativas y búsquedas por voz.',
    icono: 'Layers',
    packs: ['autoridad_maps_ia'],
    categoria: 'geo_aeo',
  },
  {
    id: 'tldr_entidad',
    nombre: 'TL;DR Entidad',
    descripcion: 'Crea resumen de entidad del negocio para que los LLMs lo identifiquen y recomienden correctamente.',
    icono: 'FileText',
    packs: ['autoridad_maps_ia'],
    categoria: 'geo_aeo',
  },
  {
    id: 'monitor_ias',
    nombre: 'Monitor IAs',
    descripcion: 'Monitoriza menciones del negocio en Gemini, ChatGPT y Perplexity. Detecta presencia y posición en respuestas de IA.',
    icono: 'Eye',
    packs: ['autoridad_maps_ia'],
    categoria: 'geo_aeo',
  },

  // ── Reporte (Agente 11) ─────────────────────────────────
  {
    id: 'generador_reporte',
    nombre: 'Generador Reporte',
    descripcion: 'Genera reporte mensual consolidado con métricas de Map Pack y GEO/AEO. Visualiza progreso del cliente.',
    icono: 'BarChart3',
    packs: ['autoridad_maps_ia'],
    categoria: 'reporte',
  },
]

// Helper: obtener config por id
export function getAgentConfig(id: string): AgentConfig | undefined {
  return AGENT_CONFIGS.find((a) => a.id === id)
}

// Helper: agentes agrupados por categoría
export function getAgentsByCategory() {
  return {
    map_pack: AGENT_CONFIGS.filter((a) => a.categoria === 'map_pack'),
    geo_aeo: AGENT_CONFIGS.filter((a) => a.categoria === 'geo_aeo'),
    reporte: AGENT_CONFIGS.filter((a) => a.categoria === 'reporte'),
  }
}
