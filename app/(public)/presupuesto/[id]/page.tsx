'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  Check,
  Mail,
  ArrowLeft,
  TrendingUp,
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
} from 'lucide-react'
import type { Presupuesto } from '@/lib/presupuesto'

interface NegocioResumen {
  nombre: string
  zona: string
  categoria: string
  puntuacion: number
}

const PACK_LABELS: Record<string, string> = {
  visibilidad_local: 'Pack Visibilidad Local',
  autoridad_maps_ia: 'Pack Autoridad Maps + IA',
}

const PACK_SUBTITLES: Record<string, string> = {
  visibilidad_local: 'Posicionamiento Map Pack en Google Maps y Apple Maps',
  autoridad_maps_ia: 'Map Pack + Presencia en ChatGPT, Gemini y búsquedas por voz',
}

export default function PresupuestoPage() {
  const params = useParams()
  const auditId = params.id as string

  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [negocio, setNegocio] = useState<NegocioResumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estado envío email
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/presupuesto?audit_id=${auditId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al cargar presupuesto')
        setPresupuesto(data.presupuesto)
        setNegocio(data.negocio)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [auditId])

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    if (!email) {
      setEmailError('Introduce tu email')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/presupuesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audit_id: auditId, email }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setSent(true)
    } catch {
      setEmailError('Error al enviar. Inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Generando tu presupuesto personalizado...</p>
        </div>
      </div>
    )
  }

  if (error || !presupuesto) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-primary mb-2">Presupuesto no disponible</h2>
          <p className="text-neutral-500 text-sm mb-6">
            {error || 'No se pudo cargar el presupuesto. La auditoría puede haber caducado.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-accent font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Nueva auditoría gratuita
          </Link>
        </div>
      </div>
    )
  }

  const roi = presupuesto.roi_estimado
  const esAutoridad = presupuesto.pack_recomendado === 'autoridad_maps_ia'

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Nav */}
      <nav className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-primary text-lg">Radar Local</span>
          </div>
          <Link
            href={`/auditoria/${auditId}`}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la auditoría
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 md:py-16 space-y-8">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-1.5 text-sm text-accent font-medium mb-4">
            <Zap className="w-4 h-4" />
            Precio especial fundador · Solo primeros 10 clientes
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            Tu presupuesto personalizado
          </h1>
          {negocio && (
            <p className="text-neutral-500 text-lg">
              Para{' '}
              <span className="font-medium text-primary">{negocio.nombre}</span>
              {' '}·{' '}{negocio.zona}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pack recomendado */}
            <div className={`rounded-2xl p-8 text-white relative overflow-hidden ${esAutoridad ? 'bg-gradient-to-br from-primary to-primary/80' : 'bg-gradient-to-br from-blue-600 to-blue-500'}`}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-accent" fill="currentColor" />
                  <span className="text-sm text-white/70 font-medium">Pack recomendado</span>
                </div>
                <h2 className="text-2xl font-bold mb-1">
                  {PACK_LABELS[presupuesto.pack_recomendado]}
                </h2>
                <p className="text-white/70 text-sm mb-6">
                  {PACK_SUBTITLES[presupuesto.pack_recomendado]}
                </p>

                <div className="flex items-end gap-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">€{presupuesto.precio_fundador}</span>
                      <span className="text-white/70">/mes</span>
                    </div>
                    <p className="text-white/60 text-sm">Precio fundador (3 meses)</p>
                  </div>
                  <div className="text-right">
                    <span className="line-through text-white/40 text-sm">€{presupuesto.precio_mensual}/mes</span>
                    <p className="text-accent font-semibold text-sm">
                      Ahorras €{presupuesto.ahorro_mensual}/mes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI a 3 meses */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">ROI estimado a 3 meses</h3>
                  <p className="text-sm text-neutral-500">Retorno esperado basado en tu categoría</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { mes: 'Mes 1', data: roi.mes_1 },
                  { mes: 'Mes 2', data: roi.mes_2 },
                  { mes: 'Mes 3', data: roi.mes_3 },
                ].map(({ mes, data }) => (
                  <div key={mes} className="text-center p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                    <p className="text-xs text-neutral-400 mb-1">{mes}</p>
                    <p className="text-2xl font-bold text-green-600 mb-1">{data.roi}</p>
                    <p className="text-sm font-semibold text-primary mb-1">
                      €{data.retorno_estimado.toLocaleString('es-ES')}
                    </p>
                    <p className="text-xs text-neutral-400">{data.descripcion}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-neutral-400 mt-4 text-center">
                * Estimaciones basadas en resultados medios de clientes en tu categoría. El ROI real depende del punto de partida de tu negocio.
              </p>
            </div>

            {/* Qué incluye */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="font-semibold text-primary mb-4">¿Qué incluye el pack?</h3>
              <ul className="space-y-3">
                {presupuesto.incluye.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mejoras esperadas */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h3 className="font-semibold text-primary mb-4">Mejoras que conseguirás</h3>
              <ul className="space-y-3">
                {presupuesto.mejoras_esperadas.map((mejora) => (
                  <li key={mejora} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">{mejora}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Enviar por email */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-primary">Recibir por email</h3>
              </div>

              {sent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-medium text-primary text-sm mb-1">¡Enviado!</p>
                  <p className="text-xs text-neutral-500">
                    Revisa tu bandeja de entrada. Si no lo ves, mira la carpeta de spam.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-3">
                  <p className="text-sm text-neutral-500">
                    Te enviamos el presupuesto completo con el detalle del plan de acción.
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                  {emailError && (
                    <p className="text-xs text-red-600">{emailError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-accent hover:bg-accent-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar presupuesto
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Garantías */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
              <h3 className="font-semibold text-primary text-sm">Nuestras garantías</h3>
              {[
                { icon: Shield, text: 'Cancelación sin permanencia' },
                { icon: Clock, text: 'Onboarding en menos de 72h' },
                { icon: TrendingUp, text: 'Informe mensual de resultados' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm text-neutral-600">{text}</span>
                </div>
              ))}
            </div>

            {/* Plazas fundador */}
            <div className="rounded-2xl bg-gradient-to-br from-accent to-orange-500 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                <span className="font-semibold text-sm">Oferta fundador</span>
              </div>
              <p className="text-2xl font-bold mb-1">30% dto.</p>
              <p className="text-white/80 text-sm mb-4">
                Solo para los primeros 10 clientes. Precio bloqueado de por vida.
              </p>
              <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
                <p className="text-xs font-medium">Quedan pocas plazas disponibles</p>
              </div>
            </div>

            {/* CTA agendar llamada */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 text-center">
              <p className="text-sm text-neutral-500 mb-4">
                ¿Tienes dudas? Agendam una llamada de 15 min sin compromiso.
              </p>
              <a
                href="mailto:hola@radarlocal.es?subject=Quiero%20saber%20m%C3%A1s%20sobre%20Radar%20Local"
                className="inline-flex items-center gap-2 text-sm text-accent font-medium hover:underline"
              >
                <Mail className="w-4 h-4" />
                hola@radarlocal.es
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-neutral-400">
          Radar Local Agency &copy; {new Date().getFullYear()} &mdash;
          Posicionamiento Map Pack + GEO/AEO para negocios locales
        </div>
      </footer>
    </div>
  )
}
