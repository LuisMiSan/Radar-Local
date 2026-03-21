// ─────────────────────────────────────────────────────────
// MIDDLEWARE — Guardia de seguridad + control de roles
// ─────────────────────────────────────────────────────────
// 1. Verifica que el usuario tiene sesión activa
// 2. Verifica que su rol puede acceder a la ruta solicitada
// 3. Si no puede → redirige a /admin (dashboard) con mensaje
//
// Los roles se verifican consultando la tabla admin_profiles.
// Si el usuario no tiene perfil, se crea como super_admin (primer usuario).

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Permisos por ruta (duplicado para middleware, no puede importar 'server-only')
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/admin':           ['super_admin', 'auditorias', 'gestion'],
  '/admin/pipeline':  ['super_admin', 'auditorias'],
  '/admin/clientes':  ['super_admin', 'auditorias', 'gestion'],
  '/admin/agentes':   ['super_admin', 'gestion'],
  '/admin/tareas':    ['super_admin', 'gestion'],
  '/admin/analisis':  ['super_admin', 'gestion'],
  '/admin/reportes':  ['super_admin', 'auditorias', 'gestion'],
  '/admin/gastos':    ['super_admin', 'gestion'],
}

function canAccessRoute(rol: string, pathname: string): boolean {
  if (rol === 'super_admin') return true

  const matchingRoutes = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname === route || pathname.startsWith(route + '/'))
    .sort((a, b) => b.length - a.length)

  if (matchingRoutes.length === 0) return false

  const allowedRoles = ROUTE_PERMISSIONS[matchingRoutes[0]]
  return allowedRoles.includes(rol)
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verificar sesión
  const { data: { session } } = await supabase.auth.getSession()

  const isLoginPage = request.nextUrl.pathname === '/admin/login'
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')

  // No proteger rutas API (tienen su propia autenticación)
  if (isApiRoute) return response

  // Sin sesión + ruta admin → login
  if (isAdminRoute && !isLoginPage && !session) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Con sesión + página login → dashboard
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Verificar rol si está en ruta admin (no login, no dashboard)
  if (isAdminRoute && !isLoginPage && session && request.nextUrl.pathname !== '/admin') {
    // Obtener rol del perfil admin usando service_role directamente
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() { /* no-op */ },
        },
      }
    )

    const { data: profile } = await supabaseAdmin
      .from('admin_profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    const rol = profile?.rol ?? 'super_admin' // Primer usuario = super_admin

    if (!canAccessRoute(rol, request.nextUrl.pathname)) {
      // No tiene permisos → redirigir al dashboard con aviso
      const dashboardUrl = new URL('/admin', request.url)
      dashboardUrl.searchParams.set('denied', '1')
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return response
}

export const config = {
  matcher: '/admin/:path*',
}
