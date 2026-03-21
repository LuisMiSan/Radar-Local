'use client'

// ─────────────────────────────────────────────────────────
// Layout del Admin — Sidebar + contenido + contexto de rol
// ─────────────────────────────────────────────────────────
// Este layout envuelve TODAS las páginas de /admin/*
// EXCEPTO /admin/login, que necesita verse sin sidebar.
// Provee el contexto de rol (AdminRoleContext) a todos los hijos.

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/ui/sidebar'
import { AdminRoleContext, useAdminProfileLoader } from '@/hooks/use-admin-role'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'
  const adminContext = useAdminProfileLoader()

  // Si es la página de login, no mostrar sidebar ni cargar rol
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminRoleContext.Provider value={adminContext}>
      <div className="min-h-screen bg-neutral-50">
        <Sidebar />
        {/* Contenido principal — offset por sidebar */}
        <div className="lg:pl-60 pl-16 transition-all duration-300">
          {children}
        </div>
      </div>
    </AdminRoleContext.Provider>
  )
}
