import { supabase } from './supabase'
import { supabaseAdmin } from './supabase-admin'
import type { Cliente, EstadoCliente } from '@/types'
import type { AuditResult } from './audit'
import { runOnboarding } from './onboarding'

// ---- Datos mock para desarrollo sin Supabase ----
const MOCK_CLIENTS: Cliente[] = [
  {
    id: '1',
    nombre: 'Dra. María García',
    negocio: 'Clínica Dental Sonrisa',
    email: 'maria@clinicasonrisa.es',
    telefono: '+34 612 345 678',
    direccion: 'C/ Gran Vía 45, Madrid',
    web: 'https://clinicasonrisa.es',
    pack: 'autoridad_maps_ia',
    es_fundador: true,
    estado: 'activo',
    notas: 'Cliente fundador. Alta prioridad.',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-03-01T14:30:00Z',
  },
  {
    id: '2',
    nombre: 'Carlos López',
    negocio: 'Fisioterapia López',
    email: 'carlos@fisiolopez.es',
    telefono: '+34 698 765 432',
    direccion: 'Av. Diagonal 120, Barcelona',
    web: 'https://fisiolopez.es',
    pack: 'visibilidad_local',
    es_fundador: false,
    estado: 'activo',
    notas: null,
    created_at: '2025-02-10T09:00:00Z',
    updated_at: '2025-02-28T11:00:00Z',
  },
  {
    id: '3',
    nombre: 'Ana Martínez',
    negocio: 'Veterinaria San Antón',
    email: 'ana@vetsananton.es',
    telefono: '+34 655 111 222',
    direccion: 'C/ Alcalá 78, Madrid',
    web: null,
    pack: 'visibilidad_local',
    es_fundador: true,
    estado: 'activo',
    notas: 'Interesada en upgrade a Autoridad Maps.',
    created_at: '2025-01-20T08:30:00Z',
    updated_at: '2025-03-05T16:00:00Z',
  },
  {
    id: '4',
    nombre: 'Pedro Sánchez',
    negocio: 'Taller Mecánico AutoFix',
    email: 'pedro@autofix.es',
    telefono: '+34 677 333 444',
    direccion: 'Polígono Industrial Sur 12, Valencia',
    web: 'https://autofix.es',
    pack: 'autoridad_maps_ia',
    es_fundador: false,
    estado: 'pausado',
    notas: 'Pausado temporalmente por vacaciones.',
    created_at: '2025-02-01T12:00:00Z',
    updated_at: '2025-03-01T10:00:00Z',
  },
  {
    id: '5',
    nombre: 'Laura Fernández',
    negocio: 'Centro Estético Bella',
    email: 'laura@centrobella.es',
    telefono: null,
    direccion: 'C/ Serrano 55, Madrid',
    web: 'https://centrobella.es',
    pack: null,
    es_fundador: false,
    estado: 'lead',
    notas: 'Lead — pendiente de cerrar venta.',
    created_at: '2025-03-01T15:00:00Z',
    updated_at: '2025-03-01T15:00:00Z',
  },
]

// ---- Funciones de datos ----

export async function getClients(): Promise<Cliente[]> {
  // Usamos supabaseAdmin porque la tabla clientes tiene SELECT restringido a service_role
  // (contiene datos sensibles: emails, teléfonos, direcciones)
  const client = supabaseAdmin ?? supabase
  if (!client) return MOCK_CLIENTS

  const { data, error } = await client
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return MOCK_CLIENTS
  }
  return data ?? MOCK_CLIENTS
}

export async function getClientById(id: string): Promise<Cliente | null> {
  const client = supabaseAdmin ?? supabase
  if (!client) return MOCK_CLIENTS.find((c) => c.id === id) ?? null

  const { data, error } = await client
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching client:', error)
    return MOCK_CLIENTS.find((c) => c.id === id) ?? null
  }
  return data
}

export async function createClient(
  client: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>
): Promise<Cliente | null> {
  // SOLO supabaseAdmin (service_role) para escritura — la clave anon NO puede escribir
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('clientes')
    .insert(client)
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    return null
  }
  return data
}

export async function updateClient(
  id: string,
  updates: Partial<Omit<Cliente, 'id' | 'created_at' | 'updated_at'>>
): Promise<Cliente | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('clientes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating client:', error)
    return null
  }
  return data
}

// ─────────────────────────────────────────────────────────
// AUTO-CONVERSIÓN: Crear lead desde auditoría
// ─────────────────────────────────────────────────────────
// Se llama automáticamente al completar una auditoría.
// Incluye todos los datos de contacto del formulario.
// Verifica si ya existe un lead con ese email para no duplicar.
export async function createLeadFromAudit(
  audit: AuditResult,
  contacto: {
    nombre_contacto: string
    puesto: string
    telefono: string
    email: string
  }
): Promise<Cliente | null> {
  if (!supabaseAdmin) return null

  // Verificar si ya existe un cliente con ese email
  const { data: existing } = await supabaseAdmin
    .from('clientes')
    .select('id')
    .eq('email', contacto.email)
    .maybeSingle()

  if (existing) {
    console.log('[CRM] Lead ya existe con email:', contacto.email)
    return null // No duplicar
  }

  // Crear nuevo lead con TODOS los datos de contacto
  const { data, error } = await supabaseAdmin
    .from('clientes')
    .insert({
      nombre: contacto.nombre_contacto,
      negocio: audit.negocio.nombre,
      email: contacto.email,
      telefono: contacto.telefono,
      direccion: audit.negocio.direccion,
      web: null,
      pack: null,
      pack_recomendado: audit.recomendacion_pack,
      es_fundador: false,
      estado: 'lead',
      notas: `Lead automático desde auditoría.\nPuesto: ${contacto.puesto}\nPuntuación: ${audit.negocio.puntuacion}/100\nPack recomendado: ${audit.recomendacion_pack}\nCategoría: ${audit.negocio.categoria}\nZona: ${audit.negocio.zona}`,
      audit_id: audit.id,
    })
    .select()
    .single()

  if (error) {
    console.error('[CRM] Error creando lead:', error)
    return null
  }

  console.log('[CRM] Nuevo lead creado:', data.id, contacto.email)
  return data
}

// ─────────────────────────────────────────────────────────
// CAMBIAR ESTADO del pipeline
// ─────────────────────────────────────────────────────────
// Actualiza el estado y añade nota con timestamp
export async function updateClientStatus(
  id: string,
  newStatus: EstadoCliente,
  nota?: string
): Promise<Cliente | null> {
  if (!supabaseAdmin) return null

  const updates: Record<string, unknown> = { estado: newStatus }

  // Si se proporciona nota, añadirla al campo notas
  if (nota) {
    const { data: current } = await supabaseAdmin
      .from('clientes')
      .select('notas')
      .eq('id', id)
      .single()

    const timestamp = new Date().toLocaleString('es-ES')
    const newNota = `[${timestamp}] → ${newStatus}: ${nota}`
    updates.notas = current?.notas
      ? `${current.notas}\n${newNota}`
      : newNota
  }

  const { data, error } = await supabaseAdmin
    .from('clientes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[CRM] Error cambiando estado:', error)
    return null
  }

  // Trigger onboarding automático al pasar a "activo"
  if (newStatus === 'activo' && data) {
    runOnboarding(data.id).catch(err =>
      console.error('[CRM] Error en onboarding automático:', err)
    )
  }

  return data
}

// Obtener clientes agrupados por estado (para vista Kanban)
export async function getClientsByStatus(): Promise<Record<EstadoCliente, Cliente[]>> {
  const allClients = await getClients()

  const grouped: Record<EstadoCliente, Cliente[]> = {
    lead: [],
    contactado: [],
    llamada_info: [],
    propuesta_enviada: [],
    negociando: [],
    llamada_onboarding: [],
    activo: [],
    pausado: [],
    eliminado: [],
  }

  for (const client of allClients) {
    const estado = client.estado as EstadoCliente
    if (grouped[estado]) {
      grouped[estado].push(client)
    } else {
      grouped.lead.push(client) // fallback
    }
  }

  return grouped
}
