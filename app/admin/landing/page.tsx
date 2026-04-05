'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Film,
  DollarSign,
  MessageSquare,
  HelpCircle,
  Check,
  AlertCircle,
  Eye,
} from 'lucide-react'

// ─── Types ───
interface Plan {
  id: string
  nombre: string
  subtitulo: string
  precio: number
  precioFundador: number
  features: string[]
  notIncluded: string[]
  popular: boolean
}

interface Testimonio {
  nombre: string
  negocio: string
  zona: string
  texto: string
  rating: number
  mejora: string
}

interface FAQ {
  pregunta: string
  respuesta: string
}

interface HeroConfig {
  titulo: string
  subtitulo: string
  badge: string
  videoUrl: string
}

interface LandingConfig {
  hero: HeroConfig
  planes: Plan[]
  testimonios: Testimonio[]
  faqs: FAQ[]
}

// ─── Default config (mirrors landing page) ───
const DEFAULT_CONFIG: LandingConfig = {
  hero: {
    titulo: 'Pon tu negocio en el Top 3 de Google Maps y en las respuestas de la IA',
    subtitulo: 'Posicionamiento local automatizado con inteligencia artificial. Map Pack + GEO/AEO para que te encuentren en Maps, ChatGPT, Gemini y busquedas por voz.',
    badge: '11 agentes IA trabajando para tu negocio',
    videoUrl: '/videos/hero.webm',
  },
  planes: [
    {
      id: 'visibilidad_local',
      nombre: 'Visibilidad Local',
      subtitulo: 'Map Pack — Aparece en el Top 3 de Google Maps',
      precio: 197,
      precioFundador: 138,
      features: [
        'Auditoria completa de Google Business Profile',
        'Optimizacion NAP (nombre, direccion, telefono)',
        'Gestion de resenas con IA',
        'Redaccion de posts GBP semanales',
        'Keywords locales optimizadas para Maps',
        'Informe mensual con metricas reales',
      ],
      notIncluded: [
        'Posicionamiento en ChatGPT/Gemini',
        'Schema markup avanzado',
        'Monitorizacion en IAs',
      ],
      popular: false,
    },
    {
      id: 'autoridad_maps_ia',
      nombre: 'Autoridad Maps + IA',
      subtitulo: 'Map Pack + GEO/AEO — Domina Maps Y los LLMs',
      precio: 397,
      precioFundador: 278,
      features: [
        'Todo lo del plan Visibilidad Local',
        'Schema JSON-LD para rich snippets',
        'FAQs optimizadas para busqueda por voz',
        'Chunks de contenido para LLMs',
        'Perfil de entidad (TLDR) para IAs',
        'Monitorizacion en ChatGPT, Gemini, Perplexity',
        'Informe comparativo mensual completo',
        'Prospector web automatizado',
      ],
      notIncluded: [],
      popular: true,
    },
  ],
  testimonios: [
    { nombre: 'Dra. Maria Lopez', negocio: 'Clinica Dental Sonrisa', zona: 'Chamberi, Madrid', texto: 'En 2 meses pasamos de no aparecer en Maps a estar en el Top 3. Las llamadas desde Google se triplicaron.', rating: 5, mejora: '+180% llamadas' },
    { nombre: 'Carlos Ruiz', negocio: 'Taller Ruiz', zona: 'Vallecas, Madrid', texto: 'Ahora cuando alguien le pregunta a Gemini por un taller en mi zona, me recomienda a mi.', rating: 5, mejora: 'Visible en Gemini' },
    { nombre: 'Ana Torres', negocio: 'Centro de Fisioterapia Activa', zona: 'Salamanca, Madrid', texto: 'El equipo gestiona todo: resenas, posts, optimizacion. Yo me dedico a mis pacientes.', rating: 5, mejora: '+95% visibilidad' },
  ],
  faqs: [
    { pregunta: 'Que es el Map Pack y por que importa?', respuesta: 'El Map Pack son los 3 primeros resultados en Google Maps. Estar ahi significa recibir el 75% de los clics.' },
    { pregunta: 'Cuanto tarda en verse resultados?', respuesta: 'Los cambios en GBP se reflejan en 1-2 semanas. Mejora en Maps en 30-60 dias. GEO/AEO en 2-3 meses.' },
    { pregunta: 'Necesito hacer algo yo?', respuesta: 'Lo gestionamos todo. 11 agentes IA trabajan de forma autonoma.' },
    { pregunta: 'Puedo cancelar cuando quiera?', respuesta: 'Si, sin permanencia. Trabajamos mes a mes.' },
  ],
}

type Tab = 'hero' | 'planes' | 'testimonios' | 'faqs'

export default function AdminLandingPage() {
  const [config, setConfig] = useState<LandingConfig>(DEFAULT_CONFIG)
  const [activeTab, setActiveTab] = useState<Tab>('hero')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadError, setLoadError] = useState('')

  // Load config from API on mount
  useEffect(() => {
    fetch('/api/landing-config')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.config) setConfig(data.config) })
      .catch(() => { /* use defaults */ })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/landing-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      if (!res.ok) throw new Error('Error guardando')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setLoadError('Error al guardar la configuracion')
      setTimeout(() => setLoadError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'hero', label: 'Hero', icon: Film },
    { id: 'planes', label: 'Planes y precios', icon: DollarSign },
    { id: 'testimonios', label: 'Testimonios', icon: MessageSquare },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Landing Page</h1>
          <p className="text-sm text-neutral-500 mt-1">Gestiona el contenido de la pagina publica</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-accent transition-colors px-4 py-2 border border-neutral-200 rounded-lg">
            <Eye className="w-4 h-4" /> Ver landing
          </a>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-accent hover:bg-accent-600 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4" /> {loadError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-neutral-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-primary'
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── HERO TAB ─── */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="font-semibold text-primary mb-4">Seccion Hero</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Badge (texto superior)</label>
                <input type="text" value={config.hero.badge}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, badge: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Titulo principal</label>
                <textarea value={config.hero.titulo}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, titulo: e.target.value } })}
                  rows={3} className="w-full px-4 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subtitulo</label>
                <textarea value={config.hero.subtitulo}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitulo: e.target.value } })}
                  rows={3} className="w-full px-4 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">URL del video hero</label>
                <input type="text" value={config.hero.videoUrl}
                  onChange={(e) => setConfig({ ...config, hero: { ...config.hero, videoUrl: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                <p className="text-xs text-neutral-400 mt-1">Ruta relativa (ej: /videos/hero.webm) o URL externa</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PLANES TAB ─── */}
      {activeTab === 'planes' && (
        <div className="space-y-6">
          {config.planes.map((plan, planIdx) => (
            <div key={plan.id} className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-primary">{plan.nombre}</h3>
                {plan.popular && <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">Popular</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
                  <input type="text" value={plan.nombre}
                    onChange={(e) => {
                      const planes = [...config.planes]
                      planes[planIdx] = { ...plan, nombre: e.target.value }
                      setConfig({ ...config, planes })
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Subtitulo</label>
                  <input type="text" value={plan.subtitulo}
                    onChange={(e) => {
                      const planes = [...config.planes]
                      planes[planIdx] = { ...plan, subtitulo: e.target.value }
                      setConfig({ ...config, planes })
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Precio mensual (&euro;)</label>
                  <input type="number" value={plan.precio}
                    onChange={(e) => {
                      const planes = [...config.planes]
                      planes[planIdx] = { ...plan, precio: Number(e.target.value) }
                      setConfig({ ...config, planes })
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Precio fundador (&euro;)</label>
                  <input type="number" value={plan.precioFundador}
                    onChange={(e) => {
                      const planes = [...config.planes]
                      planes[planIdx] = { ...plan, precioFundador: Number(e.target.value) }
                      setConfig({ ...config, planes })
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Caracteristicas incluidas</label>
                {plan.features.map((f, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <input type="text" value={f}
                      onChange={(e) => {
                        const planes = [...config.planes]
                        const features = [...plan.features]
                        features[fIdx] = e.target.value
                        planes[planIdx] = { ...plan, features }
                        setConfig({ ...config, planes })
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                    <button onClick={() => {
                      const planes = [...config.planes]
                      const features = plan.features.filter((_, i) => i !== fIdx)
                      planes[planIdx] = { ...plan, features }
                      setConfig({ ...config, planes })
                    }} className="text-neutral-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => {
                  const planes = [...config.planes]
                  planes[planIdx] = { ...plan, features: [...plan.features, ''] }
                  setConfig({ ...config, planes })
                }} className="flex items-center gap-1 text-sm text-accent hover:text-accent-600 transition-colors mt-1">
                  <Plus className="w-4 h-4" /> Anadir caracteristica
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input type="checkbox" checked={plan.popular}
                    onChange={(e) => {
                      const planes = config.planes.map((p, i) => ({ ...p, popular: i === planIdx ? e.target.checked : false }))
                      setConfig({ ...config, planes })
                    }}
                    className="rounded border-neutral-300 text-accent focus:ring-accent" />
                  Marcar como popular
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TESTIMONIOS TAB ─── */}
      {activeTab === 'testimonios' && (
        <div className="space-y-6">
          {config.testimonios.map((t, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-primary text-sm">Testimonio {idx + 1}</h3>
                <button onClick={() => {
                  setConfig({ ...config, testimonios: config.testimonios.filter((_, i) => i !== idx) })
                }} className="text-neutral-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Nombre</label>
                  <input type="text" value={t.nombre}
                    onChange={(e) => {
                      const testimonios = [...config.testimonios]
                      testimonios[idx] = { ...t, nombre: e.target.value }
                      setConfig({ ...config, testimonios })
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Negocio</label>
                  <input type="text" value={t.negocio}
                    onChange={(e) => {
                      const testimonios = [...config.testimonios]
                      testimonios[idx] = { ...t, negocio: e.target.value }
                      setConfig({ ...config, testimonios })
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Zona</label>
                  <input type="text" value={t.zona}
                    onChange={(e) => {
                      const testimonios = [...config.testimonios]
                      testimonios[idx] = { ...t, zona: e.target.value }
                      setConfig({ ...config, testimonios })
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-neutral-500 mb-1">Testimonio</label>
                <textarea value={t.texto}
                  onChange={(e) => {
                    const testimonios = [...config.testimonios]
                    testimonios[idx] = { ...t, texto: e.target.value }
                    setConfig({ ...config, testimonios })
                  }}
                  rows={2} className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Mejora destacada</label>
                  <input type="text" value={t.mejora}
                    onChange={(e) => {
                      const testimonios = [...config.testimonios]
                      testimonios[idx] = { ...t, mejora: e.target.value }
                      setConfig({ ...config, testimonios })
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Rating (1-5)</label>
                  <input type="number" min={1} max={5} value={t.rating}
                    onChange={(e) => {
                      const testimonios = [...config.testimonios]
                      testimonios[idx] = { ...t, rating: Number(e.target.value) }
                      setConfig({ ...config, testimonios })
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => {
            setConfig({
              ...config,
              testimonios: [...config.testimonios, { nombre: '', negocio: '', zona: '', texto: '', rating: 5, mejora: '' }],
            })
          }} className="flex items-center gap-2 text-sm text-accent hover:text-accent-600 transition-colors font-medium">
            <Plus className="w-4 h-4" /> Anadir testimonio
          </button>
        </div>
      )}

      {/* ─── FAQS TAB ─── */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          {config.faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-primary text-sm">FAQ {idx + 1}</h3>
                <button onClick={() => {
                  setConfig({ ...config, faqs: config.faqs.filter((_, i) => i !== idx) })
                }} className="text-neutral-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Pregunta</label>
                  <input type="text" value={faq.pregunta}
                    onChange={(e) => {
                      const faqs = [...config.faqs]
                      faqs[idx] = { ...faq, pregunta: e.target.value }
                      setConfig({ ...config, faqs })
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Respuesta</label>
                  <textarea value={faq.respuesta}
                    onChange={(e) => {
                      const faqs = [...config.faqs]
                      faqs[idx] = { ...faq, respuesta: e.target.value }
                      setConfig({ ...config, faqs })
                    }}
                    rows={3} className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => {
            setConfig({
              ...config,
              faqs: [...config.faqs, { pregunta: '', respuesta: '' }],
            })
          }} className="flex items-center gap-2 text-sm text-accent hover:text-accent-600 transition-colors font-medium">
            <Plus className="w-4 h-4" /> Anadir FAQ
          </button>
        </div>
      )}
    </div>
  )
}
