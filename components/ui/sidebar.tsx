'use client'

// ─────────────────────────────────────────────────────────
// Sidebar del panel admin — con control de roles
// ─────────────────────────────────────────────────────────
// Solo muestra las secciones que el rol del usuario puede ver.
// super_admin ve todo, auditorias y gestion ven lo suyo.

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Bot,
  FileText,
  ChevronLeft,
  ChevronRight,
  Radar,
  LogOut,
  Kanban,
  Zap,
  DollarSign,
  ListChecks,
  Shield,
  Loader2,
  TrendingUp,
  Brain,
  BookOpen,
  Palette,
} from 'lucide-react'
import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useAdminRole } from '@/hooks/use-admin-role'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/agentes', label: 'Agentes', icon: Bot },
  { href: '/admin/historial', label: 'Memoria IA', icon: Brain },
  { href: '/admin/contenido', label: 'Contenido', icon: BookOpen },
  { href: '/admin/tareas', label: 'Tareas', icon: ListChecks },
  { href: '/admin/analisis', label: 'Análisis IA', icon: Zap },
  { href: '/admin/reportes', label: 'Reportes', icon: FileText },
  { href: '/admin/gastos', label: 'Gastos API', icon: DollarSign },
  { href: '/admin/evolucion', label: 'Evolución GBP', icon: TrendingUp },
  { href: '/admin/landing', label: 'Landing Page', icon: Palette },
]

// Iconos y colores por rol
const ROL_DISPLAY = {
  super_admin: { label: 'Super Admin', color: 'text-purple-300', bg: 'bg-purple-500/20' },
  auditorias: { label: 'Auditorías', color: 'text-blue-300', bg: 'bg-blue-500/20' },
  gestion: { label: 'Gestión', color: 'text-green-300', bg: 'bg-green-500/20' },
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const { rol, loading, canAccess } = useAdminRole()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  // Filtrar items según el rol del usuario
  // Mientras carga el rol, mostrar todos (evita flash de items faltantes)
  const visibleItems = loading ? navItems : navItems.filter((item) => canAccess(item.href))

  async function handleLogout() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const rolDisplay = ROL_DISPLAY[rol]

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-primary text-white flex flex-col transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-primary-700">
        <Radar className="w-6 h-6 text-accent shrink-0" />
        {!collapsed && (
          <span className="font-bold text-lg whitespace-nowrap">Radar Local</span>
        )}
      </div>

      {/* Badge de rol */}
      {!collapsed && !loading && (
        <div className="px-4 py-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${rolDisplay.bg}`}>
            <Shield className={`w-3.5 h-3.5 ${rolDisplay.color}`} />
            <span className={`text-xs font-medium ${rolDisplay.color}`}>
              {rolDisplay.label}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
          </div>
        ) : (
          visibleItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-accent/20 text-accent'
                    : 'text-neutral-400 hover:bg-primary-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })
        )}
      </nav>

      {/* Logout + Collapse */}
      <div className="border-t border-primary-700">
        {/* Botón de cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-lg text-neutral-400 hover:bg-red-500/20 hover:text-red-300 transition-colors w-[calc(100%-16px)]"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Cerrar sesión</span>}
        </button>

        {/* Botón colapsar sidebar */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-12 border-t border-primary-700 text-neutral-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
