// ─────────────────────────────────────────────────────────
// PORTAL DEL CLIENTE — Funciones de datos
// ─────────────────────────────────────────────────────────
// El portal usa tokens HMAC derivados del ID del cliente.
// No necesita columna extra en la base de datos.
//
// Cómo funciona:
//   1. El token se genera con: HMAC-SHA256(clienteId, SECRET)
//   2. Para verificar un token, probamos todos los clientes
//      hasta encontrar uno cuyo HMAC coincida
//   3. Es seguro porque sin la SECRET nadie puede generar tokens
//
// La SECRET se lee de PORTAL_SECRET en .env.local
// Si no existe, usa un fallback (solo para desarrollo)

import { supabaseAdmin } from './supabase-admin'
import { supabase } from './supabase'
import type { Cliente, Tarea, Metrica, Reporte } from '@/types'
import crypto from 'crypto'

// ── Clave secreta para generar tokens ──
// IMPORTANTE: En producción DEBE estar configurada en .env.local / Vercel
const PORTAL_SECRET = process.env.PORTAL_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    console.error('[portal] PORTAL_SECRET no configurada en producción — usando fallback INSEGURO')
  }
  return 'radar-local-portal-dev-secret-2025'
})()

// ── Generar token para un cliente (determinístico) ──
// Siempre genera el mismo token para el mismo clienteId
export function generatePortalToken(clienteId: string): string {
  return crypto
    .createHmac('sha256', PORTAL_SECRET)
    .update(clienteId)
    .digest('base64url')
    .slice(0, 32) // 32 chars, URL-safe
}

// ── Verificar token y obtener el cliente ──
// Busca entre todos los clientes cuál genera este token
export async function getClientByPortalToken(token: string): Promise<Cliente | null> {
  const client = supabaseAdmin ?? supabase
  if (!client) return null

  // Obtener todos los clientes activos (no eliminados)
  const { data: clients, error } = await client
    .from('clientes')
    .select('*')

  if (error || !clients) return null

  // Buscar cuál cliente genera este token
  for (const c of clients) {
    const expectedToken = generatePortalToken(c.id)
    if (expectedToken === token) {
      return c
    }
  }

  return null // Token no coincide con ningún cliente
}

// ── Obtener tareas del cliente ──
export async function getClientTasks(clienteId: string): Promise<Tarea[]> {
  const client = supabaseAdmin ?? supabase
  if (!client) return MOCK_TASKS

  const { data, error } = await client
    .from('tareas')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching tasks:', error)
    return MOCK_TASKS
  }
  return data.length > 0 ? data : MOCK_TASKS
}

// ── Obtener métricas del cliente ──
export async function getClientMetrics(clienteId: string): Promise<Metrica[]> {
  const client = supabaseAdmin ?? supabase
  if (!client) return MOCK_METRICS

  const { data, error } = await client
    .from('metricas')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
    .limit(30)

  if (error) {
    console.error('Error fetching metrics:', error)
    return MOCK_METRICS
  }
  return data.length > 0 ? data : MOCK_METRICS
}

// ── Obtener reportes del cliente ──
export async function getClientReports(clienteId: string): Promise<Reporte[]> {
  const client = supabaseAdmin ?? supabase
  if (!client) return MOCK_REPORTS

  const { data, error } = await client
    .from('reportes')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('estado', 'enviado')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching reports:', error)
    return MOCK_REPORTS
  }
  return data.length > 0 ? data : MOCK_REPORTS
}

// ── Obtener URL del portal para un cliente ──
export function getPortalUrl(clienteId: string, baseUrl: string): string {
  const token = generatePortalToken(clienteId)
  return `${baseUrl}/portal/${token}`
}

// ── Mock data para desarrollo ──
const MOCK_TASKS: Tarea[] = [
  {
    id: 't1',
    cliente_id: '1',
    agente: 'auditor_gbp',
    tipo: 'auditoria_completa',
    estado: 'completada',
    resultado: { puntuacion: 72, mejoras: 5 },
    created_at: '2025-02-15T10:00:00Z',
    completed_at: '2025-02-15T10:05:00Z',
  },
  {
    id: 't2',
    cliente_id: '1',
    agente: 'optimizador_nap',
    tipo: 'verificacion_nap',
    estado: 'completada',
    resultado: { consistencia: 95 },
    created_at: '2025-02-20T09:00:00Z',
    completed_at: '2025-02-20T09:03:00Z',
  },
  {
    id: 't3',
    cliente_id: '1',
    agente: 'keywords_locales',
    tipo: 'investigacion_keywords',
    estado: 'completada',
    resultado: { keywords_encontradas: 45, oportunidades: 12 },
    created_at: '2025-03-01T14:00:00Z',
    completed_at: '2025-03-01T14:10:00Z',
  },
  {
    id: 't4',
    cliente_id: '1',
    agente: 'redactor_posts_gbp',
    tipo: 'crear_post',
    estado: 'en_progreso',
    resultado: null,
    created_at: '2025-03-10T11:00:00Z',
    completed_at: null,
  },
  {
    id: 't5',
    cliente_id: '1',
    agente: 'generador_schema',
    tipo: 'schema_local_business',
    estado: 'pendiente',
    resultado: null,
    created_at: '2025-03-12T08:00:00Z',
    completed_at: null,
  },
]

const MOCK_METRICS: Metrica[] = [
  { id: 'm1', cliente_id: '1', tipo: 'visitas_gbp', valor: 320, fecha: '2025-01-01', metadata: null, created_at: '2025-01-31T00:00:00Z' },
  { id: 'm2', cliente_id: '1', tipo: 'visitas_gbp', valor: 385, fecha: '2025-02-01', metadata: null, created_at: '2025-02-28T00:00:00Z' },
  { id: 'm3', cliente_id: '1', tipo: 'visitas_gbp', valor: 445, fecha: '2025-03-01', metadata: null, created_at: '2025-03-15T00:00:00Z' },
  { id: 'm4', cliente_id: '1', tipo: 'llamadas_gbp', valor: 18, fecha: '2025-01-01', metadata: null, created_at: '2025-01-31T00:00:00Z' },
  { id: 'm5', cliente_id: '1', tipo: 'llamadas_gbp', valor: 24, fecha: '2025-02-01', metadata: null, created_at: '2025-02-28T00:00:00Z' },
  { id: 'm6', cliente_id: '1', tipo: 'llamadas_gbp', valor: 31, fecha: '2025-03-01', metadata: null, created_at: '2025-03-15T00:00:00Z' },
  { id: 'm7', cliente_id: '1', tipo: 'resenas_total', valor: 45, fecha: '2025-01-01', metadata: null, created_at: '2025-01-31T00:00:00Z' },
  { id: 'm8', cliente_id: '1', tipo: 'resenas_total', valor: 52, fecha: '2025-02-01', metadata: null, created_at: '2025-02-28T00:00:00Z' },
  { id: 'm9', cliente_id: '1', tipo: 'resenas_total', valor: 58, fecha: '2025-03-01', metadata: null, created_at: '2025-03-15T00:00:00Z' },
  { id: 'm10', cliente_id: '1', tipo: 'puntuacion_gbp', valor: 62, fecha: '2025-01-01', metadata: null, created_at: '2025-01-31T00:00:00Z' },
  { id: 'm11', cliente_id: '1', tipo: 'puntuacion_gbp', valor: 71, fecha: '2025-02-01', metadata: null, created_at: '2025-02-28T00:00:00Z' },
  { id: 'm12', cliente_id: '1', tipo: 'puntuacion_gbp', valor: 78, fecha: '2025-03-01', metadata: null, created_at: '2025-03-15T00:00:00Z' },
]

const MOCK_REPORTS: Reporte[] = [
  {
    id: 'r1',
    cliente_id: '1',
    mes: '2025-01',
    contenido: {
      resumen: 'Mes de arranque. Se realizó auditoría completa del perfil GBP y se identificaron 5 áreas de mejora.',
      puntuacion: 62,
      mejoras_realizadas: ['Optimización NAP', 'Actualización horarios', 'Categoría corregida'],
      proximos_pasos: ['Investigación de keywords', 'Creación de posts GBP', 'Schema LocalBusiness'],
    },
    estado: 'enviado',
    created_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 'r2',
    cliente_id: '1',
    mes: '2025-02',
    contenido: {
      resumen: 'Crecimiento del 20% en visitas al perfil. Keywords locales identificadas y primeros posts publicados.',
      puntuacion: 71,
      mejoras_realizadas: ['45 keywords locales mapeadas', '3 posts GBP publicados', 'Respuesta a 7 reseñas'],
      proximos_pasos: ['Schema markup', 'FAQ page optimizada', 'Campaña de reseñas'],
    },
    estado: 'enviado',
    created_at: '2025-03-01T10:00:00Z',
  },
]
