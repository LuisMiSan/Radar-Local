'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Search,
  Eye,
  Star,
  ArrowRight,
  CheckCircle2,
  Zap,
  Mic,
  MicOff,
  ChevronDown,
  Moon,
  Sun,
  TrendingUp,
  Check,
  X,
  Target,
} from 'lucide-react'

// ─── Category suggestions ───
const CATEGORIAS_SUGERIDAS = [
  'Clinica dental', 'Fisioterapia', 'Veterinaria', 'Peluqueria',
  'Restaurante', 'Clinica estetica', 'Optica', 'Gimnasio',
  'Taller mecanico', 'Abogado', 'Asesoria fiscal', 'Inmobiliaria',
  'Farmacia', 'Podologia', 'Psicologia', 'Fontaneria',
  'Electricista', 'Floristeria', 'Panaderia', 'Autoescuela',
]

// ─── Phone prefixes ───
const PREFIJOS = [
  { code: '+34', flag: '\u{1F1EA}\u{1F1F8}', country: 'Espana' },
  { code: '+351', flag: '\u{1F1F5}\u{1F1F9}', country: 'Portugal' },
  { code: '+33', flag: '\u{1F1EB}\u{1F1F7}', country: 'Francia' },
  { code: '+39', flag: '\u{1F1EE}\u{1F1F9}', country: 'Italia' },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', country: 'Reino Unido' },
  { code: '+49', flag: '\u{1F1E9}\u{1F1EA}', country: 'Alemania' },
  { code: '+52', flag: '\u{1F1F2}\u{1F1FD}', country: 'Mexico' },
  { code: '+54', flag: '\u{1F1E6}\u{1F1F7}', country: 'Argentina' },
  { code: '+56', flag: '\u{1F1E8}\u{1F1F1}', country: 'Chile' },
  { code: '+57', flag: '\u{1F1E8}\u{1F1F4}', country: 'Colombia' },
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', country: 'EEUU' },
]

// ─── Types for dynamic config ───
interface LandingConfig {
  hero?: { titulo?: string; subtitulo?: string; badge?: string; videoUrl?: string }
  planes?: typeof DEFAULT_PLANES
  testimonios?: typeof DEFAULT_TESTIMONIOS
  faqs?: typeof DEFAULT_FAQS
}

// ─── Pricing data ───
const DEFAULT_PLANES = [
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
]

// ─── Testimonials ───
const DEFAULT_TESTIMONIOS = [
  {
    nombre: 'Dra. Maria Lopez',
    negocio: 'Clinica Dental Sonrisa',
    zona: 'Chamberi, Madrid',
    texto: 'En 2 meses pasamos de no aparecer en Maps a estar en el Top 3. Las llamadas desde Google se triplicaron.',
    rating: 5,
    mejora: '+180% llamadas',
  },
  {
    nombre: 'Carlos Ruiz',
    negocio: 'Taller Ruiz',
    zona: 'Vallecas, Madrid',
    texto: 'Ahora cuando alguien le pregunta a Gemini por un taller en mi zona, me recomienda a mi. Eso antes era impensable.',
    rating: 5,
    mejora: 'Visible en Gemini',
  },
  {
    nombre: 'Ana Torres',
    negocio: 'Centro de Fisioterapia Activa',
    zona: 'Salamanca, Madrid',
    texto: 'El equipo gestiona todo: resenas, posts, optimizacion. Yo me dedico a mis pacientes y ellos a que me encuentren.',
    rating: 5,
    mejora: '+95% visibilidad',
  },
]

// ─── FAQs ───
const DEFAULT_FAQS = [
  {
    pregunta: 'Que es el Map Pack y por que importa?',
    respuesta: 'El Map Pack son los 3 primeros resultados que aparecen en Google Maps cuando alguien busca un servicio local. Estar ahi significa recibir el 75% de los clics. Nuestros agentes IA optimizan tu perfil para posicionarte en ese Top 3.',
  },
  {
    pregunta: 'Que es GEO/AEO y como me beneficia?',
    respuesta: 'GEO (Generative Engine Optimization) y AEO (Answer Engine Optimization) son las nuevas disciplinas para aparecer en las respuestas de ChatGPT, Gemini, Perplexity y busquedas por voz. Si tus competidores aparecen ahi y tu no, estas perdiendo clientes.',
  },
  {
    pregunta: 'Cuanto tarda en verse resultados?',
    respuesta: 'Los cambios en Google Business Profile se reflejan en 1-2 semanas. La mejora en posicionamiento Maps suele verse en 30-60 dias. El posicionamiento en IAs (GEO/AEO) puede tardar 2-3 meses en consolidarse.',
  },
  {
    pregunta: 'Necesito hacer algo yo o lo gestionais todo?',
    respuesta: 'Lo gestionamos todo. Nuestros 11 agentes IA trabajan de forma autonoma: auditan, optimizan, responden resenas, publican posts y monitorizan tu presencia. Solo te notificamos para cambios criticos que requieran tu aprobacion.',
  },
  {
    pregunta: 'Que pasa si no tengo perfil de Google Business?',
    respuesta: 'Te ayudamos a crearlo y optimizarlo desde cero. Muchos de nuestros clientes empezaron sin perfil y en 3 meses estaban en el Top 3 de su zona.',
  },
  {
    pregunta: 'Puedo cancelar cuando quiera?',
    respuesta: 'Si, sin permanencia. Trabajamos mes a mes. Si no ves resultados, puedes cancelar en cualquier momento. Aunque nuestros datos dicen que el 95% de clientes continuan despues del tercer mes.',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [dynamicConfig, setDynamicConfig] = useState<LandingConfig | null>(null)

  useEffect(() => {
    try {
      const savedDark = localStorage.getItem('radar-dark') === 'true'
      setIsDark(savedDark)
      if (savedDark) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch { /* ignore */ }

    // Load dynamic config
    fetch('/api/landing-config')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.config) setDynamicConfig(data.config) })
      .catch(() => { /* use defaults */ })
  }, [])

  // Merge dynamic config with defaults
  const heroConfig = {
    titulo: dynamicConfig?.hero?.titulo || 'Pon tu negocio en el Top 3 de Google Maps y en las respuestas de la IA',
    subtitulo: dynamicConfig?.hero?.subtitulo || 'Posicionamiento local automatizado con inteligencia artificial. Map Pack + GEO/AEO para que te encuentren en Maps, ChatGPT, Gemini y busquedas por voz.',
    badge: dynamicConfig?.hero?.badge || '11 agentes IA trabajando para tu negocio',
    videoUrl: dynamicConfig?.hero?.videoUrl || '/videos/hero.webm',
  }
  const PLANES = dynamicConfig?.planes || DEFAULT_PLANES
  const TESTIMONIOS = dynamicConfig?.testimonios || DEFAULT_TESTIMONIOS
  const FAQS = dynamicConfig?.faqs || DEFAULT_FAQS

  const toggleDarkMode = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('radar-dark', newDark.toString())
    if (newDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  const scrollToAudit = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ─── Audit form state ───
  const [form, setForm] = useState({
    nombre_negocio: '', direccion: '', zona: '', categoria: '',
    nombre_contacto: '', puesto: '', telefono: '', email: '',
    competidor1: '', competidor2: '',
  })
  const [prefijo, setPrefijo] = useState('+34')
  const [showPrefijos, setShowPrefijos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSugerencias, setShowSugerencias] = useState(false)
  const [listeningField, setListeningField] = useState<string | null>(null)
  const prefijoRef = useRef<HTMLDivElement>(null)

  const sugerenciasFiltradas = form.categoria.length > 0
    ? CATEGORIAS_SUGERIDAS.filter(c => c.toLowerCase().includes(form.categoria.toLowerCase()))
    : CATEGORIAS_SUGERIDAS

  const prefijoActual = PREFIJOS.find(p => p.code === prefijo) ?? PREFIJOS[0]

  function startVoiceInput(field: string) {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    if (!SpeechRecognition) { setError('Tu navegador no soporta dictado por voz. Usa Chrome o Edge.'); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)()
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setListeningField(field)
    recognition.onend = () => setListeningField(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = event.results[0][0].transcript
      if (field === 'email') transcript = transcript.replace(/\s+/g, '').toLowerCase().replace(/arroba/gi, '@').replace(/punto/gi, '.')
      if (field === 'telefono') transcript = transcript.replace(/[^0-9]/g, '')
      setForm(prev => ({ ...prev, [field]: transcript }))
    }
    recognition.onerror = () => setListeningField(null)
    recognition.start()
  }

  function MicButton({ field }: { field: string }) {
    const isActive = listeningField === field
    return (
      <button type="button" onClick={() => startVoiceInput(field)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
          isActive ? 'bg-red-100 text-red-500 animate-pulse' : 'text-neutral-400 hover:text-accent hover:bg-accent/10'
        }`} title="Dictar por voz">
        {isActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.nombre_negocio || !form.direccion || !form.zona || !form.categoria ||
        !form.nombre_contacto || !form.puesto || !form.telefono || !form.email) {
      setError('Completa todos los campos obligatorios')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, telefono: `${prefijo} ${form.telefono}` }),
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

  const inputClass = "w-full px-4 py-2.5 pr-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent dark:focus:border-accent focus:bg-white dark:focus:bg-neutral-700 transition-colors"

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-primary dark:text-accent text-lg">Radar Local</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
            <button onClick={scrollToAudit} className="hover:text-accent transition-colors">Auditoria gratis</button>
            <a href="#como-funciona" className="hover:text-accent transition-colors">Como funciona</a>
            <a href="#planes" className="hover:text-accent transition-colors">Planes</a>
            <a href="#faq" className="hover:text-accent transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode}
              className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-accent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a href="/admin" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-accent transition-colors">Admin</a>
          </div>
        </div>
      </nav>

      {/* ─── HERO with video ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Video background */}
        <div className="absolute inset-0">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={heroConfig.videoUrl} type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-primary/80 dark:bg-neutral-950/85" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm text-white/90 mb-8 border border-white/10">
            <Zap className="w-4 h-4 text-accent" />
            {heroConfig.badge}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
            {heroConfig.titulo}
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            {heroConfig.subtitulo}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button onClick={scrollToAudit}
              className="bg-accent hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors flex items-center gap-2 shadow-lg shadow-accent/20">
              Auditoria gratuita
              <ArrowRight className="w-5 h-5" />
            </button>
            <a href="#planes"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium px-8 py-4 rounded-xl text-lg transition-colors border border-white/20">
              Ver planes
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Sin compromiso
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Resultados en 30 dias
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Sin permanencia
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-medium">
            Potenciado por
          </p>
          <div className="flex flex-wrap items-center gap-6 md:gap-10 text-neutral-300 dark:text-neutral-700">
            <span className="text-sm font-semibold tracking-wide">Google Places API</span>
            <span className="hidden md:block w-px h-4 bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-sm font-semibold tracking-wide">Claude AI</span>
            <span className="hidden md:block w-px h-4 bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-sm font-semibold tracking-wide">Google Business Profile</span>
            <span className="hidden md:block w-px h-4 bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-sm font-semibold tracking-wide">Supabase</span>
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section id="como-funciona" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="md:flex md:items-end md:justify-between mb-20">
            <div>
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">Proceso simple</p>
              <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-white leading-tight">
                Como funciona<br className="hidden md:block" /> Radar Local
              </h2>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mt-4 md:mt-0 text-sm">
              De la auditoria al Top 3 en 3 pasos. Sin complicaciones.
            </p>
          </div>

          <div className="space-y-0">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Auditoria gratuita',
                desc: 'Analizamos tu perfil de Google Business vs tus competidores. Detectamos gaps en fotos, resenas, posts, NAP y mas.',
              },
              {
                step: '02',
                icon: Target,
                title: 'Plan personalizado',
                desc: 'Nuestros 11 agentes IA crean un plan de accion especifico para tu negocio y zona. Tu eliges el pack que mejor te encaje.',
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Resultados automaticos',
                desc: 'Los agentes trabajan 24/7: optimizan tu perfil, responden resenas, publican posts y te posicionan en Maps y LLMs.',
              },
            ].map((item) => (
              <div key={item.step} className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 border-t border-neutral-200 dark:border-neutral-800 py-10 md:py-14 first:border-t-0">
                <div className="md:col-span-1">
                  <span className="text-5xl md:text-6xl font-black text-neutral-100 dark:text-neutral-800 group-hover:text-accent/20 transition-colors">
                    {item.step}
                  </span>
                </div>
                <div className="md:col-span-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary dark:text-white">{item.title}</h3>
                </div>
                <div className="md:col-span-7 md:flex md:items-center">
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AUDIT FORM ─── */}
      <section ref={formRef} id="auditoria" className="py-20 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">Gratis y sin compromiso</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4">
              Analiza tu posicion en Google Maps
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Comparamos tu negocio con la competencia y te mostramos exactamente que mejorar.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Business data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nombre del negocio *</label>
                  <div className="relative">
                    <input type="text" value={form.nombre_negocio} onChange={(e) => setForm({ ...form, nombre_negocio: e.target.value })}
                      placeholder="Ej: Clinica Dental Sonrisa" className={inputClass} />
                    <MicButton field="nombre_negocio" />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Categoria / Sector *</label>
                  <div className="relative">
                    <input type="text" value={form.categoria}
                      onChange={(e) => { setForm({ ...form, categoria: e.target.value }); setShowSugerencias(true) }}
                      onFocus={() => setShowSugerencias(true)}
                      onBlur={() => setTimeout(() => setShowSugerencias(false), 200)}
                      placeholder="Escribe o dicta tu sector..." className={inputClass} />
                    <MicButton field="categoria" />
                  </div>
                  {showSugerencias && sugerenciasFiltradas.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {sugerenciasFiltradas.map((cat) => (
                        <button key={cat} type="button"
                          onMouseDown={() => { setForm({ ...form, categoria: cat.toLowerCase() }); setShowSugerencias(false) }}
                          className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-accent/5 dark:hover:bg-accent/20 hover:text-accent transition-colors">
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Direccion *</label>
                <div className="relative">
                  <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Ej: Calle Mayor 15, Madrid" className={inputClass} />
                  <MicButton field="direccion" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Zona / Barrio *</label>
                <div className="relative">
                  <input type="text" value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })}
                    placeholder="Ej: Chamberi, Madrid" className={inputClass} />
                  <MicButton field="zona" />
                </div>
              </div>

              {/* Contact data */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-2">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Datos de contacto *</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nombre completo *</label>
                    <div className="relative">
                      <input type="text" value={form.nombre_contacto} onChange={(e) => setForm({ ...form, nombre_contacto: e.target.value })}
                        placeholder="Ej: Maria Garcia Lopez" className={inputClass} />
                      <MicButton field="nombre_contacto" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Puesto que ocupa *</label>
                    <div className="relative">
                      <input type="text" value={form.puesto} onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                        placeholder="Ej: Propietario, Director, Gerente..." className={inputClass} />
                      <MicButton field="puesto" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Telefono *</label>
                    <div className="flex gap-2">
                      <div className="relative" ref={prefijoRef}>
                        <button type="button" onClick={() => setShowPrefijos(!showPrefijos)}
                          className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors whitespace-nowrap">
                          <span className="text-base">{prefijoActual.flag}</span>
                          <span>{prefijoActual.code}</span>
                          <ChevronDown className="w-3 h-3 text-neutral-400" />
                        </button>
                        {showPrefijos && (
                          <div className="absolute z-20 left-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-y-auto w-52">
                            {PREFIJOS.map((p) => (
                              <button key={p.code} type="button"
                                onClick={() => { setPrefijo(p.code); setShowPrefijos(false) }}
                                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent/5 dark:hover:bg-accent/20 transition-colors ${
                                  prefijo === p.code ? 'bg-accent/10 dark:bg-accent/20 text-accent font-medium' : 'text-neutral-700 dark:text-neutral-300'
                                }`}>
                                <span className="text-base">{p.flag}</span>
                                <span>{p.country}</span>
                                <span className="text-neutral-400 dark:text-neutral-500 ml-auto">{p.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative flex-1">
                        <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                          placeholder="612 345 678" className={inputClass} />
                        <MicButton field="telefono" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email *</label>
                    <div className="relative">
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="tu@email.com" className={inputClass} />
                      <MicButton field="email" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitors */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                  </div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Contra quien compites? <span className="text-neutral-400 dark:text-neutral-500 font-normal">(opcional)</span>
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Competidor 1</label>
                    <div className="relative">
                      <input type="text" value={form.competidor1} onChange={(e) => setForm({ ...form, competidor1: e.target.value })}
                        placeholder="Ej: Clinica Dental Plus" className={inputClass} />
                      <MicButton field="competidor1" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Competidor 2</label>
                    <div className="relative">
                      <input type="text" value={form.competidor2} onChange={(e) => setForm({ ...form, competidor2: e.target.value })}
                        placeholder="Ej: Centro Salud Dental" className={inputClass} />
                      <MicButton field="competidor2" />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950 rounded-lg px-4 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-accent hover:bg-accent-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analizando...</>
                ) : (
                  <>Analizar mi negocio gratis <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-20 md:py-24 bg-primary dark:bg-neutral-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
            {[
              { value: '11', label: 'Agentes IA', suffix: '' },
              { value: '95', label: 'Retencion clientes', suffix: '%' },
              { value: '3x', label: 'Mas llamadas (media)', suffix: '' },
              { value: '30', label: 'Dias hasta resultados', suffix: '' },
            ].map((stat) => (
              <div key={stat.label} className="relative pl-5 border-l-2 border-accent/40">
                <p className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
                  {stat.value}<span className="text-accent">{stat.suffix}</span>
                </p>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-3 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="planes" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="md:flex md:items-end md:justify-between mb-16">
            <div>
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">Planes</p>
              <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-white leading-tight">
                Elige tu nivel<br className="hidden md:block" /> de visibilidad
              </h2>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-xs">
                Dos planes disenados para negocios locales que quieren resultados reales. Sin permanencia.
              </p>
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mt-3">
                <Zap className="w-3.5 h-3.5" />
                30% descuento fundador
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {PLANES.map((plan) => (
              <div key={plan.id}
                className={`relative rounded-2xl p-8 md:p-10 transition-all ${
                  plan.popular
                    ? 'bg-primary dark:bg-accent/5 text-white ring-1 ring-accent/30 lg:scale-105 shadow-2xl shadow-primary/20 dark:shadow-accent/10'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800'
                }`}>
                {plan.popular && (
                  <span className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/15 px-3 py-1 rounded-full">
                    Mas popular
                  </span>
                )}

                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.popular ? 'text-accent' : 'text-accent'}`}>
                  {plan.nombre}
                </p>
                <p className={`text-sm mb-8 ${plan.popular ? 'text-white/50' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  {plan.subtitulo}
                </p>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-5xl font-black tracking-tight ${plan.popular ? 'text-white' : 'text-primary dark:text-white'}`}>
                    &euro;{plan.precioFundador}
                  </span>
                  <span className={`text-sm ${plan.popular ? 'text-white/40' : 'text-neutral-400'}`}>/mes</span>
                </div>
                <p className={`text-xs mb-8 ${plan.popular ? 'text-white/30' : 'text-neutral-400'}`}>
                  <s>&euro;{plan.precio}/mes</s> &middot; Precio fundador &middot; Solo primeros 10
                </p>

                <div className={`h-px mb-8 ${plan.popular ? 'bg-white/10' : 'bg-neutral-100 dark:bg-neutral-800'}`} />

                <ul className="space-y-3 mb-10">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-accent' : 'text-accent'}`} />
                      <span className={plan.popular ? 'text-white/80' : 'text-neutral-700 dark:text-neutral-300'}>{f}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <X className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-white/20' : 'text-neutral-300 dark:text-neutral-600'}`} />
                      <span className={plan.popular ? 'text-white/25' : 'text-neutral-400 dark:text-neutral-600'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={scrollToAudit}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all text-sm uppercase tracking-wider ${
                    plan.popular
                      ? 'bg-accent hover:bg-accent-600 text-white shadow-lg shadow-accent/20'
                      : 'bg-primary hover:bg-primary-700 text-white dark:bg-white dark:text-primary dark:hover:bg-neutral-100'
                  }`}>
                  Empezar ahora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 md:py-32 bg-neutral-50 dark:bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">Testimonios</p>
            <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-white">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {TESTIMONIOS.map((t, idx) => (
              <div key={t.nombre}
                className={`relative bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-100 dark:border-neutral-800 ${
                  idx === 0 ? 'md:col-span-7' : 'md:col-span-5'
                } flex flex-col justify-between`}>
                {/* Large decorative quote */}
                <span className="absolute top-6 right-8 text-7xl leading-none font-serif text-neutral-100 dark:text-neutral-800 select-none">&ldquo;</span>

                <div>
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className={`text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6 relative z-10 ${
                    idx === 0 ? 'text-lg' : 'text-sm'
                  }`}>
                    &ldquo;{t.texto}&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <p className="font-bold text-sm text-primary dark:text-white">{t.nombre}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{t.negocio} &middot; {t.zona}</p>
                  </div>
                  <span className="text-accent text-xs font-bold bg-accent/10 px-3 py-1.5 rounded-lg">
                    {t.mejora}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Left: header sticky */}
            <div className="md:col-span-4">
              <div className="md:sticky md:top-24">
                <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">FAQ</p>
                <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white leading-tight">
                  Preguntas frecuentes
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-4 hidden md:block">
                  Todo lo que necesitas saber antes de empezar.
                </p>
              </div>
            </div>
            {/* Right: accordion */}
            <div className="md:col-span-8">
              <div className="space-y-0">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
                    <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-start justify-between py-6 text-left group">
                      <div className="flex items-start gap-4">
                        <span className="text-xs font-bold text-neutral-300 dark:text-neutral-600 mt-1 tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="font-semibold text-primary dark:text-white pr-4 group-hover:text-accent transition-colors">
                          {faq.pregunta}
                        </span>
                      </div>
                      <div className={`w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0 transition-all ${
                        openFaq === idx ? 'bg-accent border-accent rotate-180' : 'group-hover:border-accent'
                      }`}>
                        <ChevronDown className={`w-4 h-4 ${openFaq === idx ? 'text-white' : 'text-neutral-400'}`} />
                      </div>
                    </button>
                    {openFaq === idx && (
                      <div className="pb-6 pl-10">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">{faq.respuesta}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="relative overflow-hidden">
        <div className="bg-primary dark:bg-neutral-950 py-24 md:py-32">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="md:flex md:items-center md:justify-between md:gap-12">
              <div className="mb-8 md:mb-0">
                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
                  Listo para dominar<br className="hidden md:block" /> tu zona?
                </h2>
                <p className="text-white/50 text-lg max-w-md">
                  Haz tu auditoria gratuita ahora y descubre por que tus competidores aparecen antes que tu.
                </p>
              </div>
              <div className="shrink-0">
                <button onClick={scrollToAudit}
                  className="bg-accent hover:bg-accent-600 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all inline-flex items-center gap-3 shadow-2xl shadow-accent/30 hover:shadow-accent/40 hover:-translate-y-0.5">
                  Auditoria gratuita
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-neutral-950 border-t border-neutral-800/50">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MapPin className="w-4.5 h-4.5 text-accent" />
                </div>
                <span className="font-bold text-white text-xl tracking-tight">Radar Local</span>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
                Posicionamiento local automatizado con IA. Ponemos tu negocio en el Top 3 de Google Maps y en las respuestas de ChatGPT, Gemini y busquedas por voz.
              </p>
            </div>
            <div className="md:col-span-3 md:col-start-8">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Servicio</h4>
              <ul className="space-y-2.5 text-sm text-neutral-400">
                <li><button onClick={scrollToAudit} className="hover:text-white transition-colors">Auditoria gratis</button></li>
                <li><a href="#planes" className="hover:text-white transition-colors">Planes y precios</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Contacto</h4>
              <ul className="space-y-2.5 text-sm text-neutral-400">
                <li>Madrid, Espana</li>
                <li>info@radarlocal.es</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800/50 pt-6 text-xs text-neutral-600">
            Radar Local Agency &copy; {new Date().getFullYear()} &mdash; Posicionamiento Map Pack + GEO/AEO para negocios locales
          </div>
        </div>
      </footer>
    </div>
  )
}
