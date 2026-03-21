import 'server-only'
import { supabaseAdmin } from './supabase-admin'

// ══════════════════════════════════════════════════════════════
// SISTEMA DE ROLES — Control de acceso por rol de admin
//
// Roles:
//   super_admin → acceso total (dueño de la agencia)
//   auditorias  → comercial (pipeline, clientes, presupuestos)
//   gestion     → técnico (agentes, tareas, ejecución, gastos)
// ══════════════════════════════════════════════════════════════

export type AdminRole = 'super_admin' | 'auditorias' | 'gestion'

export interface AdminProfile {
  id: string
  email: string
  nombre: string
  rol: AdminRole
  activo: boolean
  created_at: string
  updated_at: string
}

// ── Permisos por ruta ─────────────────────────────────────

// Qué roles pueden acceder a cada sección del admin
export const ROUTE_PERMISSIONS: Record<string, AdminRole[]> = {
  '/admin':           ['super_admin', 'auditorias', 'gestion'],  // Dashboard
  '/admin/pipeline':  ['super_admin', 'auditorias'],
  '/admin/clientes':  ['super_admin', 'auditorias', 'gestion'],
  '/admin/agentes':   ['super_admin', 'gestion'],
  '/admin/tareas':    ['super_admin', 'gestion'],
  '/admin/analisis':  ['super_admin', 'gestion'],
  '/admin/reportes':  ['super_admin', 'auditorias', 'gestion'],
  '/admin/gastos':    ['super_admin', 'gestion'],
}

// ── Labels y colores para UI ──────────────────────────────

export const ROL_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  auditorias: 'Auditorías',
  gestion: 'Gestión',
}

export const ROL_COLORS: Record<AdminRole, { bg: string; text: string }> = {
  super_admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
  auditorias: { bg: 'bg-blue-100', text: 'text-blue-700' },
  gestion: { bg: 'bg-green-100', text: 'text-green-700' },
}

export const ROL_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: 'Acceso total al sistema',
  auditorias: 'Pipeline, clientes, auditorías y presupuestos',
  gestion: 'Agentes, tareas de ejecución, reportes y gastos',
}

// ── Obtener perfil de admin por user ID ───────────────────

export async function getAdminProfile(userId: string): Promise<AdminProfile | null> {
  if (!supabaseAdmin) {
    // Sin Supabase → devolver super_admin por defecto (desarrollo)
    return {
      id: userId,
      email: 'dev@radarlocal.es',
      nombre: 'Dev Admin',
      rol: 'super_admin',
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  const { data, error } = await supabaseAdmin
    .from('admin_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    // Si no tiene perfil admin → crearlo como super_admin (primer usuario)
    // En producción, cambiar esto para que sea un rol más restrictivo
    return null
  }

  return data as AdminProfile
}

// ── Crear perfil de admin (auto-registro del primer login) ──

export async function createAdminProfile(
  userId: string,
  email: string,
  nombre: string = '',
  rol: AdminRole = 'super_admin'
): Promise<AdminProfile | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('admin_profiles')
    .upsert({
      id: userId,
      email,
      nombre,
      rol,
      activo: true,
    })
    .select()
    .single()

  if (error) {
    console.error('[roles] Error creando perfil admin:', error)
    return null
  }

  console.log(`[roles] Perfil admin creado: ${email} → ${rol}`)
  return data as AdminProfile
}

// ── Verificar si un rol puede acceder a una ruta ──────────

export function canAccessRoute(rol: AdminRole, pathname: string): boolean {
  // super_admin siempre puede acceder
  if (rol === 'super_admin') return true

  // Buscar la ruta más específica que coincida
  const matchingRoutes = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname === route || pathname.startsWith(route + '/'))
    .sort((a, b) => b.length - a.length) // Más específica primero

  if (matchingRoutes.length === 0) {
    // Ruta no definida → solo super_admin
    return false
  }

  const allowedRoles = ROUTE_PERMISSIONS[matchingRoutes[0]]
  return allowedRoles.includes(rol)
}

// ── Obtener rutas permitidas para un rol ──────────────────

export function getPermittedRoutes(rol: AdminRole): string[] {
  if (rol === 'super_admin') return Object.keys(ROUTE_PERMISSIONS)

  return Object.entries(ROUTE_PERMISSIONS)
    .filter(([, roles]) => roles.includes(rol))
    .map(([route]) => route)
}

// ── Listar todos los admins ───────────────────────────────

export async function listAdmins(): Promise<AdminProfile[]> {
  if (!supabaseAdmin) return []

  const { data, error } = await supabaseAdmin
    .from('admin_profiles')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[roles] Error listando admins:', error)
    return []
  }

  return data as AdminProfile[]
}

// ── Actualizar rol de un admin ────────────────────────────

export async function updateAdminRole(
  userId: string,
  newRole: AdminRole
): Promise<AdminProfile | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('admin_profiles')
    .update({ rol: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('[roles] Error actualizando rol:', error)
    return null
  }

  return data as AdminProfile
}
