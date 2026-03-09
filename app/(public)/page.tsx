'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Search,
  BarChart3,
  Eye,
  Star,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react'

const CATEGORIAS = [
  'Clínica dental',
  'Fisioterapia',
  'Veterinaria',
  'Peluquería',
  'Restaurante',
  'Clínica estética',
  'Óptica',
  'Gimnasio',
  'Taller mecánico',
  'Otro',
]

export default function LandingPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre_negocio: '',
    direccion: '',
    zona: '',
    categoria: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.nombre_negocio || !form.direccion || !form.zona || !form.categoria) {
      setError('Completa todos los campos obligatorios')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al procesar')
      router.push(`/auditoria/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="bg-white border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-primary text-lg">Radar Local</span>
          </div>
          <a
            href="/admin"
            className="text-sm text-neutral-500 hover:text-primary transition-colors"
          >
            Admin
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
              <Zap className="w-4 h-4 text-accent" />
              Auditoría gratuita en 30 segundos
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Descubre por qué tus competidores
              <span className="text-accent"> aparecen antes</span> que tú en
              Google Maps
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl">
              Analizamos tu perfil de Google Business frente a tus 2 competidores
              más cercanos. Descubre los gaps que te impiden estar en el Top 3 de
              Maps y en las respuestas de ChatGPT y Gemini.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Sin compromiso
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Resultados inmediatos
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Comparativa vs competidores
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario de auditoría */}
      <section className="relative -mt-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  Auditoría gratuita
                </h2>
                <p className="text-sm text-neutral-500">
                  Analiza tu posición en Google Maps vs tu competencia
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nombre del negocio *
                  </label>
                  <input
                    type="text"
                    value={form.nombre_negocio}
                    onChange={(e) =>
                      setForm({ ...form, nombre_negocio: e.target.value })
                    }
                    placeholder="Ej: Clínica Dental Sonrisa"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({ ...form, categoria: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors bg-white"
                  >
                    <option value="">Selecciona categoría</option>
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c.toLowerCase()}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                  placeholder="Ej: Calle Mayor 15, Madrid"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Zona / Barrio *
                  </label>
                  <input
                    type="text"
                    value={form.zona}
                    onChange={(e) =>
                      setForm({ ...form, zona: e.target.value })
                    }
                    placeholder="Ej: Chamberí, Madrid"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    Analizar mi negocio gratis
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-primary text-center mb-4">
          Lo que descubrirás en tu auditoría
        </h2>
        <p className="text-neutral-500 text-center mb-12 max-w-xl mx-auto">
          Comparamos tu negocio con los 2 competidores más cercanos en tu zona
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: BarChart3,
              title: 'Puntuación Maps',
              desc: 'Tu score vs competidores. Sabrás exactamente por qué te superan en Google Maps.',
            },
            {
              icon: Eye,
              title: 'Gaps detectados',
              desc: 'Identificamos las áreas donde pierdes visibilidad: fotos, reseñas, posts, NAP, schema...',
            },
            {
              icon: Star,
              title: 'Plan de acción',
              desc: 'Recomendaciones priorizadas por impacto para subir al Top 3 de Maps en tu zona.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="text-center p-6 rounded-xl border border-neutral-100 hover:border-accent/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-50 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-neutral-400">
          Radar Local Agency &copy; {new Date().getFullYear()} &mdash;
          Posicionamiento Map Pack + GEO/AEO para negocios locales
        </div>
      </footer>
    </div>
  )
}
