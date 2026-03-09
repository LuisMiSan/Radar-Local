import type { Agente, Cliente, Pack, PerfilGBP } from '@/types'

// Entrada para todos los agentes
export interface AgentInput {
  cliente: Cliente
  perfilGbp: PerfilGBP | null
}

// Resultado de ejecución de un agente
export interface AgentResult {
  agente: Agente
  estado: 'completada' | 'error'
  datos: Record<string, unknown>
  resumen: string
}

// Firma de una función runner de agente
export type AgentRunner = (input: AgentInput) => Promise<AgentResult>

// Categorías de agentes (NO SEO genérico)
export type AgentCategory = 'map_pack' | 'geo_aeo' | 'reporte'

// Metadata de configuración de cada agente
export interface AgentConfig {
  id: Agente
  nombre: string
  descripcion: string
  icono: string
  packs: Pack[]
  categoria: AgentCategory
}
