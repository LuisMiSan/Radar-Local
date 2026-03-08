import { supabase } from './supabase'
import type { Cliente } from '@/types'

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
    estado: 'inactivo',
    notas: 'Lead — pendiente de cerrar venta.',
    created_at: '2025-03-01T15:00:00Z',
    updated_at: '2025-03-01T15:00:00Z',
  },
]

// ---- Funciones de datos ----

export async function getClients(): Promise<Cliente[]> {
  if (!supabase) return MOCK_CLIENTS

  const { data, error } = await supabase
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
  if (!supabase) return MOCK_CLIENTS.find((c) => c.id === id) ?? null

  const { data, error } = await supabase
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
  if (!supabase) return null

  const { data, error } = await supabase
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
  if (!supabase) return null

  const { data, error } = await supabase
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
