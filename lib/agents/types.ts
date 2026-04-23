import type { Agente, Cliente, Pack, PerfilGBP, TipoEjecucion, PrioridadTarea, CategoriaEjecucion } from '@/types'
import type { PlaceData } from '@/lib/google-places'

// Entrada para todos los agentes
export interface AgentInput {
  cliente: Cliente
  perfilGbp: PerfilGBP | null
  previousResults?: AgentResult[]
  modo?: 'auditoria' | 'ejecucion'
  // Datos reales de Google Places API (verificados)
  googlePlacesData?: PlaceData | null
  googlePlacesScore?: number | null
  competidoresData?: { nombre: string; data: PlaceData; score: number }[]
  // Memoria del agente (historial de ejecuciones previas)
  memoryContext?: string
  // Informe del mes anterior (para comparativa en generador_reporte)
  informeAnterior?: Record<string, unknown> | null
  // HTML scrapeado de la web del negocio (para prospector_web)
  webScrapedData?: { url: string; html: string; status: number; redirectUrl?: string } | null
  // Datos reales de presencia en IAs externas (para monitor_ias) — vía A2A o API directa
  datosMonitorExterno?: import('@/lib/a2a/external-monitor').DatosMonitorExterno | null
}

// Uso de tokens de la API
export interface TokenUsage {
  input_tokens: number
  output_tokens: number
  model: string
  coste_input: number   // USD
  coste_output: number  // USD
  coste_total: number   // USD
}

// ══════════════════════════════════════════════════════════════
// NUEVO: Tarea ejecutable que genera un agente
// El agente no solo dice "esto está mal", genera la tarea para arreglarlo
// ══════════════════════════════════════════════════════════════

export interface TareaGenerada {
  titulo: string                    // "Reescribir descripción del GBP"
  descripcion: string               // "La descripción actual es genérica..."
  categoria: CategoriaEjecucion     // mejora | correccion | creacion | verificacion
  tipo: TipoEjecucion              // auto | revision | manual
  prioridad: PrioridadTarea        // critica | alta | media | baja
  campo_gbp: string | null         // campo del GBP que afecta
  valor_actual: string | null      // valor actual
  valor_propuesto: string | null   // lo que el agente propone como solución
  accion_api?: Record<string, unknown>  // datos para API de GBP (futuro)
}

// Resultado de ejecución de un agente (EVOLUCIONADO)
export interface AgentResult {
  agente: Agente
  estado: 'completada' | 'error'
  datos: Record<string, unknown>
  resumen: string
  usage?: TokenUsage
  tareas?: TareaGenerada[]         // NUEVO: tareas ejecutables que generó
}

// Firma de una función runner de agente
export type AgentRunner = (input: AgentInput) => Promise<AgentResult>

// Categorías de agentes (NO SEO genérico)
export type AgentCategory = 'map_pack' | 'geo_aeo' | 'reporte' | 'prospector' | 'supervisor'

// Metadata de configuración de cada agente
export interface AgentConfig {
  id: Agente
  nombre: string
  descripcion: string
  icono: string
  packs: Pack[]
  categoria: AgentCategory
}
