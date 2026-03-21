'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import type { AdminRole } from '@/lib/roles'

// ══════════════════════════════════════════════════════════════
// Hook useAdminRole — Accede al rol del admin desde cualquier componente
//
// Uso:
//   const { rol, nombre, loading } = useAdminRole()
//   if (rol === 'super_admin') { ... }
//   if (canAccess('/admin/gastos')) { ... }
// ══════════════════════════════════════════════════════════════

interface AdminContext {
  rol: AdminRole
  nombre: string
  email: string
  loading: boolean
  canAccess: (route: string) => boolean
}

// Permisos por ruta (duplicado del servidor para no importar 'server-only')
const ROUTE_PERMISSIONS: Record<string, AdminRole[]> = {
  '/admin':           ['super_admin', 'auditorias', 'gestion'],
  '/admin/pipeline':  ['super_admin', 'auditorias'],
  '/admin/clientes':  ['super_admin', 'auditorias', 'gestion'],
  '/admin/agentes':   ['super_admin', 'gestion'],
  '/admin/tareas':    ['super_admin', 'gestion'],
  '/admin/analisis':  ['super_admin', 'gestion'],
  '/admin/reportes':  ['super_admin', 'auditorias', 'gestion'],
  '/admin/gastos':    ['super_admin', 'gestion'],
}

function checkAccess(rol: AdminRole, pathname: string): boolean {
  if (rol === 'super_admin') return true

  const matchingRoutes = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname === route || pathname.startsWith(route + '/'))
    .sort((a, b) => b.length - a.length)

  if (matchingRoutes.length === 0) return false

  const allowedRoles = ROUTE_PERMISSIONS[matchingRoutes[0]]
  return allowedRoles.includes(rol)
}

// ── Context para compartir entre componentes ──────────────

const AdminRoleContext = createContext<AdminContext>({
  rol: 'gestion',
  nombre: '',
  email: '',
  loading: true,
  canAccess: () => false,
})

export function useAdminRole() {
  return useContext(AdminRoleContext)
}

export { AdminRoleContext }

// ── Hook interno que carga el perfil ──────────────────────

export function useAdminProfileLoader(): AdminContext {
  const [rol, setRol] = useState<AdminRole>('super_admin') // Default super_admin hasta que cargue
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const res = await fetch('/api/admin/profile')
        if (res.ok) {
          const data = await res.json()
          if (mounted) {
            setRol(data.rol ?? 'super_admin')
            setNombre(data.nombre ?? '')
            setEmail(data.email ?? '')
          }
        } else {
          console.warn('[useAdminRole] API respondió con status:', res.status)
          // Si falla la API, mantener super_admin por defecto (desarrollo)
        }
      } catch (err) {
        console.error('Error cargando perfil admin:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()
    return () => { mounted = false }
  }, [])

  const canAccess = (route: string) => checkAccess(rol, route)

  return { rol, nombre, email, loading, canAccess }
}
