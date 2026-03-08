import { supabase } from './supabase'
import type { Tarea } from '@/types'

// ---- Datos mock ----
const MOCK_TASKS: Tarea[] = [
  {
    id: 't1',
    cliente_id: '1',
    agente: 'auditor_gbp',
    tipo: 'auditoria_inicial',
    estado: 'completada',
    resultado: { puntuacion: 72, items_revisados: 15, problemas: 4 },
    created_at: '2025-01-16T10:00:00Z',
    completed_at: '2025-01-16T10:05:00Z',
  },
  {
    id: 't2',
    cliente_id: '1',
    agente: 'optimizador_nap',
    tipo: 'correccion_nap',
    estado: 'completada',
    resultado: { consistencia: '100%', directorios_actualizados: 8 },
    created_at: '2025-01-17T09:00:00Z',
    completed_at: '2025-01-17T09:15:00Z',
  },
  {
    id: 't3',
    cliente_id: '1',
    agente: 'redactor_posts_gbp',
    tipo: 'post_mensual',
    estado: 'en_progreso',
    resultado: null,
    created_at: '2025-03-01T08:00:00Z',
    completed_at: null,
  },
  {
    id: 't4',
    cliente_id: '2',
    agente: 'auditor_gbp',
    tipo: 'auditoria_inicial',
    estado: 'completada',
    resultado: { puntuacion: 58, items_revisados: 15, problemas: 7 },
    created_at: '2025-02-11T10:00:00Z',
    completed_at: '2025-02-11T10:08:00Z',
  },
  {
    id: 't5',
    cliente_id: '2',
    agente: 'keywords_locales',
    tipo: 'investigacion_keywords',
    estado: 'pendiente',
    resultado: null,
    created_at: '2025-03-05T12:00:00Z',
    completed_at: null,
  },
  {
    id: 't6',
    cliente_id: '3',
    agente: 'generador_schema',
    tipo: 'json_ld_basico',
    estado: 'error',
    resultado: { error: 'Web no accesible' },
    created_at: '2025-02-20T14:00:00Z',
    completed_at: null,
  },
]

export async function getTasksByClient(clienteId: string): Promise<Tarea[]> {
  if (!supabase) return MOCK_TASKS.filter((t) => t.cliente_id === clienteId)

  const { data, error } = await supabase
    .from('tareas')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return MOCK_TASKS.filter((t) => t.cliente_id === clienteId)
  }
  return data ?? []
}
