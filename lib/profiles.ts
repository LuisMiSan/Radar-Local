import { supabase } from './supabase'
import type { PerfilGBP } from '@/types'

// ---- Datos mock ----
const MOCK_PROFILES: PerfilGBP[] = [
  {
    id: 'p1',
    cliente_id: '1',
    google_business_id: 'ChIJ_fake_1',
    nombre_gbp: 'Clínica Dental Sonrisa',
    categoria: 'Dentista',
    descripcion: 'Clínica dental especializada en implantología y ortodoncia en Gran Vía, Madrid.',
    horarios: { lunes: '09:00-20:00', martes: '09:00-20:00', miercoles: '09:00-20:00', jueves: '09:00-20:00', viernes: '09:00-14:00' },
    fotos_count: 12,
    resenas_count: 87,
    puntuacion: 4.6,
    nap_nombre: 'Clínica Dental Sonrisa',
    nap_direccion: 'C/ Gran Vía 45, 28013 Madrid',
    nap_telefono: '+34 612 345 678',
    url_maps: 'https://maps.google.com/?cid=fake1',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-03-01T14:30:00Z',
  },
  {
    id: 'p2',
    cliente_id: '2',
    google_business_id: 'ChIJ_fake_2',
    nombre_gbp: 'Fisioterapia López',
    categoria: 'Fisioterapeuta',
    descripcion: 'Centro de fisioterapia deportiva y rehabilitación en Barcelona.',
    horarios: { lunes: '08:00-21:00', martes: '08:00-21:00', miercoles: '08:00-21:00', jueves: '08:00-21:00', viernes: '08:00-15:00' },
    fotos_count: 5,
    resenas_count: 32,
    puntuacion: 4.2,
    nap_nombre: 'Fisioterapia López',
    nap_direccion: 'Av. Diagonal 120, 08018 Barcelona',
    nap_telefono: '+34 698 765 432',
    url_maps: 'https://maps.google.com/?cid=fake2',
    created_at: '2025-02-10T09:00:00Z',
    updated_at: '2025-02-28T11:00:00Z',
  },
  {
    id: 'p3',
    cliente_id: '3',
    google_business_id: 'ChIJ_fake_3',
    nombre_gbp: 'Veterinaria San Antón',
    categoria: 'Veterinario',
    descripcion: 'Clínica veterinaria con urgencias 24h en Alcalá, Madrid.',
    horarios: { lunes: '10:00-20:00', martes: '10:00-20:00', miercoles: '10:00-20:00', jueves: '10:00-20:00', viernes: '10:00-14:00', sabado: '10:00-13:00' },
    fotos_count: 3,
    resenas_count: 15,
    puntuacion: 3.8,
    nap_nombre: 'Veterinaria San Antón',
    nap_direccion: 'C/ Alcalá 78, 28009 Madrid',
    nap_telefono: '+34 655 111 222',
    url_maps: 'https://maps.google.com/?cid=fake3',
    created_at: '2025-01-20T08:30:00Z',
    updated_at: '2025-03-05T16:00:00Z',
  },
]

export async function getProfileByClient(clienteId: string): Promise<PerfilGBP | null> {
  if (!supabase) return MOCK_PROFILES.find((p) => p.cliente_id === clienteId) ?? null

  const { data, error } = await supabase
    .from('perfiles_gbp')
    .select('*')
    .eq('cliente_id', clienteId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return MOCK_PROFILES.find((p) => p.cliente_id === clienteId) ?? null
  }
  return data
}
