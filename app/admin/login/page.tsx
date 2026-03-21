'use client'

// ─────────────────────────────────────────────────────────
// Página de Login — /admin/login
// ─────────────────────────────────────────────────────────
// Formulario de email + contraseña para acceder al panel admin.
// Usa Supabase Auth para autenticar.
// Si el login es exitoso, redirige a /admin (o a donde venía).
//
// NOTA: Envuelto en Suspense porque useSearchParams() lo requiere
// en Next.js 14 para static generation.

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Si venía de otra página admin, redirigir ahí después del login
  const redirectTo = searchParams.get('redirect') ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Crear cliente Supabase del navegador
      const supabase = createSupabaseBrowser()

      // Intentar login con email + contraseña
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Mensajes de error en español
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email o contraseña incorrectos')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Debes confirmar tu email antes de acceder')
        } else {
          setError(authError.message)
        }
        return
      }

      // Login exitoso → redirigir al admin
      router.push(redirectTo)
      router.refresh() // Forzar refresh para que middleware detecte la sesión
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <span className="text-2xl font-bold text-white">Radar Local</span>
          </div>
          <p className="text-white/60 text-sm">Panel de administración</p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-primary">Iniciar sesión</h1>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@radarlocal.es"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar al panel'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Acceso restringido a administradores
        </p>
      </div>
    </div>
  )
}

// Wrapper con Suspense — necesario porque useSearchParams()
// requiere Suspense en Next.js 14 para poder hacer static generation
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
