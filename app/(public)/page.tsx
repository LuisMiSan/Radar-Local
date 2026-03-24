'use client'

import { useState, useRef, useEffect } from 'react'
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
  Mic,
  MicOff,
  ChevronDown,
  Moon,
  Sun,
  Globe,
} from 'lucide-react'

// Sugerencias de categoría para autocompletar
const CATEGORIAS_SUGERIDAS = [
  'Clínica dental',
  'Fisioterapia',
  'Veterinaria',
  'Peluquería',
  'Restaurante',
  'Clínica estética',
  'Óptica',
  'Gimnasio',
  'Taller mecánico',
  'Abogado',
  'Asesoría fiscal',
  'Inmobiliaria',
  'Farmacia',
  'Podología',
  'Psicología',
  'Fontanería',
  'Electricista',
  'Floristería',
  'Panadería',
  'Autoescuela',
]

// Prefijos internacionales con banderas
const PREFIJOS = [
  { code: '+34', flag: '🇪🇸', country: 'España' },
  { code: '+351', flag: '🇵🇹', country: 'Portugal' },
  { code: '+33', flag: '🇫🇷', country: 'Francia' },
  { code: '+39', flag: '🇮🇹', country: 'Italia' },
  { code: '+44', flag: '🇬🇧', country: 'Reino Unido' },
  { code: '+49', flag: '🇩🇪', country: 'Alemania' },
  { code: '+52', flag: '🇲🇽', country: 'México' },
  { code: '+54', flag: '🇦🇷', country: 'Argentina' },
  { code: '+56', flag: '🇨🇱', country: 'Chile' },
  { code: '+57', flag: '🇨🇴', country: 'Colombia' },
  { code: '+1', flag: '🇺🇸', country: 'EEUU' },
]

// Textos en múltiples idiomas
const TEXTOS = {
  es: {
    auditoria_gratuita: 'Auditoría gratuita en 30 segundos',
    titulo: 'Descubre por qué tus competidores aparecen antes que tú en Google Maps',
    titulo_accent: 'aparecen antes',
    desc: 'Analizamos tu perfil de Google Business y descubrimos los gaps que te impiden estar en el Top 3 de Maps y en las respuestas de ChatGPT y Gemini.',
    sin_compromiso: 'Sin compromiso',
    resultados_inmediatos: 'Resultados inmediatos',
    comparativa: 'Comparativa vs competidores',
    auditoria_form: 'Auditoría gratuita',
    analiza_posicion: 'Analiza tu posición en Google Maps vs tu competencia',
    nombre_negocio: 'Nombre del negocio',
    nombre_negocio_placeholder: 'Ej: Clínica Dental Sonrisa',
    categoria: 'Categoría / Sector',
    categoria_placeholder: 'Escribe o dicta tu sector...',
    direccion: 'Dirección',
    direccion_placeholder: 'Ej: Calle Mayor 15, Madrid',
    zona: 'Zona / Barrio',
    zona_placeholder: 'Ej: Chamberí, Madrid',
    datos_contacto: 'Datos de contacto',
    nombre_completo: 'Nombre completo',
    nombre_completo_placeholder: 'Ej: María García López',
    puesto: 'Puesto que ocupa',
    puesto_placeholder: 'Ej: Propietario, Director, Gerente...',
    telefono: 'Teléfono',
    telefono_placeholder: '612 345 678',
    email: 'Email',
    email_placeholder: 'tu@email.com',
    competidores: '¿Contra quién compites?',
    competidores_opcional: '(opcional)',
    competidores_desc: 'Si quieres, dinos contra quién compites y compararemos vuestros perfiles. Si los dejas en blanco, solo auditaremos tu negocio.',
    competidor1: 'Competidor 1',
    competidor1_placeholder: 'Ej: Clínica Dental Plus',
    competidor2: 'Competidor 2',
    competidor2_placeholder: 'Ej: Centro Salud Dental',
    completar_campos: 'Completa todos los campos obligatorios',
    analizando: 'Analizando...',
    analizar_negocio: 'Analizar mi negocio gratis',
    descubriras: 'Lo que descubrirás en tu auditoría',
    compara_negocio: 'Analizamos tu negocio y lo comparamos con tu competencia directa',
    puntuacion_maps: 'Puntuación Maps',
    puntuacion_desc: 'Tu score vs competidores. Sabrás exactamente por qué te superan en Google Maps.',
    gaps_detectados: 'Gaps detectados',
    gaps_desc: 'Identificamos las áreas donde pierdes visibilidad: fotos, reseñas, posts, NAP, schema...',
    plan_accion: 'Plan de acción',
    plan_desc: 'Recomendaciones priorizadas por impacto para subir al Top 3 de Maps en tu zona.',
    admin: 'Admin',
    footer: 'Radar Local Agency © {year} — Posicionamiento Map Pack + GEO/AEO para negocios locales',
  },
  en: {
    auditoria_gratuita: 'Free audit in 30 seconds',
    titulo: 'Discover why your competitors appear before you on Google Maps',
    titulo_accent: 'appear before you',
    desc: 'We analyze your Google Business profile and discover the gaps preventing you from being in the Top 3 of Maps and ChatGPT and Gemini responses.',
    sin_compromiso: 'No commitment',
    resultados_inmediatos: 'Immediate results',
    comparativa: 'Comparison vs competitors',
    auditoria_form: 'Free audit',
    analiza_posicion: 'Analyze your position on Google Maps vs your competition',
    nombre_negocio: 'Business name',
    nombre_negocio_placeholder: 'E.g: Smile Dental Clinic',
    categoria: 'Category / Industry',
    categoria_placeholder: 'Type or dictate your industry...',
    direccion: 'Address',
    direccion_placeholder: 'E.g: Main Street 15, London',
    zona: 'Area / District',
    zona_placeholder: 'E.g: Westminster, London',
    datos_contacto: 'Contact information',
    nombre_completo: 'Full name',
    nombre_completo_placeholder: 'E.g: John Smith',
    puesto: 'Your position',
    puesto_placeholder: 'E.g: Owner, Director, Manager...',
    telefono: 'Phone',
    telefono_placeholder: '(555) 123-4567',
    email: 'Email',
    email_placeholder: 'your@email.com',
    competidores: 'Who are your competitors?',
    competidores_opcional: '(optional)',
    competidores_desc: 'Tell us who you compete with and we\'ll compare your profiles. Leave blank to audit only your business.',
    competidor1: 'Competitor 1',
    competidor1_placeholder: 'E.g: Dental Clinic Plus',
    competidor2: 'Competitor 2',
    competidor2_placeholder: 'E.g: Dental Health Center',
    completar_campos: 'Complete all required fields',
    analizando: 'Analyzing...',
    analizar_negocio: 'Analyze my business for free',
    descubriras: 'What you\'ll discover in your audit',
    compara_negocio: 'We analyze your business and compare it with your direct competition',
    puntuacion_maps: 'Maps Score',
    puntuacion_desc: 'Your score vs competitors. You\'ll know exactly why they surpass you on Google Maps.',
    gaps_detectados: 'Detected gaps',
    gaps_desc: 'We identify the areas where you lose visibility: photos, reviews, posts, NAP, schema...',
    plan_accion: 'Action plan',
    plan_desc: 'Prioritized recommendations by impact to reach the Top 3 of Maps in your area.',
    admin: 'Admin',
    footer: 'Radar Local Agency © {year} — Map Pack positioning + GEO/AEO for local businesses',
  }
}

export default function LandingPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    try {
      // Cargar preferencias del localStorage
      const savedLang = (localStorage.getItem('radar-language') || 'es') as 'es' | 'en'
      const savedDark = localStorage.getItem('radar-dark') === 'true'
      setLanguage(savedLang)
      setIsDark(savedDark)

      // Aplicar dark mode al documento
      if (savedDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (error) {
      console.error('[Landing Page] Error loading preferences:', error)
      // Fallback to defaults
      setLanguage('es')
      setIsDark(false)
    }
  }, [])

  const toggleDarkMode = () => {
    console.log('toggleDarkMode called, current isDark:', isDark)
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('radar-dark', newDark.toString())
    console.log('Dark mode set to:', newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    console.log('Dark class on document:', document.documentElement.classList.contains('dark'))
  }

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es'
    setLanguage(newLang)
    localStorage.setItem('radar-language', newLang)
  }

  const t = (key: keyof typeof TEXTOS['es']): string => TEXTOS[language][key] || key

  const [form, setForm] = useState({
    nombre_negocio: '',
    direccion: '',
    zona: '',
    categoria: '',
    nombre_contacto: '',
    puesto: '',
    telefono: '',
    email: '',
    competidor1: '',
    competidor2: '',
  })

  const [prefijo, setPrefijo] = useState('+34')
  const [showPrefijos, setShowPrefijos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSugerencias, setShowSugerencias] = useState(false)
  const [listeningField, setListeningField] = useState<string | null>(null)
  const prefijoRef = useRef<HTMLDivElement>(null)

  // Filtrar sugerencias según lo que escribe el usuario
  const sugerenciasFiltradas = form.categoria.length > 0
    ? CATEGORIAS_SUGERIDAS.filter(c =>
        c.toLowerCase().includes(form.categoria.toLowerCase())
      )
    : CATEGORIAS_SUGERIDAS

  const prefijoActual = PREFIJOS.find(p => p.code === prefijo) ?? PREFIJOS[0]

  // Dictado por voz para cualquier campo
  function startVoiceInput(field: string) {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError(language === 'es' ? 'Tu navegador no soporta dictado por voz. Usa Chrome o Edge.' : 'Your browser does not support voice input. Use Chrome or Edge.')
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)()
    recognition.lang = language === 'es' ? 'es-ES' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListeningField(field)
    recognition.onend = () => setListeningField(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = event.results[0][0].transcript
      // Para email, limpiar espacios y poner en minúsculas
      if (field === 'email') {
        transcript = transcript.replace(/\s+/g, '').toLowerCase()
          .replace(/arroba/gi, '@')
          .replace(/punto/gi, '.')
      }
      // Para teléfono, extraer solo números
      if (field === 'telefono') {
        transcript = transcript.replace(/[^0-9]/g, '')
      }
      setForm(prev => ({ ...prev, [field]: transcript }))
    }
    recognition.onerror = () => setListeningField(null)
    recognition.start()
  }

  // Componente de botón de micrófono reutilizable
  function MicButton({ field }: { field: string }) {
    const isActive = listeningField === field
    return (
      <button
        type="button"
        onClick={() => startVoiceInput(field)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
          isActive
            ? 'bg-red-100 text-red-500 animate-pulse'
            : 'text-neutral-400 hover:text-accent hover:bg-accent/10'
        }`}
        title="Dictar por voz"
      >
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
        body: JSON.stringify({
          ...form,
          telefono: `${prefijo} ${form.telefono}`,
        }),
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
      {/* Nav */}
      <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-primary dark:text-accent text-lg">Radar Local</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-accent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </button>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-accent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Admin Link */}
            <a
              href="/admin"
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-accent transition-colors"
            >
              {t('admin')}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary dark:from-neutral-900 to-primary-700 dark:to-neutral-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
              <Zap className="w-4 h-4 text-accent" />
              {t('auditoria_gratuita')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {t('titulo').split(t('titulo_accent')).map((part, idx, arr) => idx === arr.length - 1 ? part : (
                <span key={idx}>{part}<span className="text-accent">{t('titulo_accent')}</span></span>
              ))}
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl">
              {t('desc')}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {t('sin_compromiso')}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {t('resultados_inmediatos')}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {t('comparativa')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario de auditoría */}
      <section className="relative -mt-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary dark:text-accent">
                  {t('auditoria_form')}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t('analiza_posicion')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Datos del negocio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {t('nombre_negocio')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.nombre_negocio}
                      onChange={(e) =>
                        setForm({ ...form, nombre_negocio: e.target.value })
                      }
                      placeholder={t('nombre_negocio_placeholder')}
                      className={inputClass}
                    />
                    <MicButton field="nombre_negocio" />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {t('categoria')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.categoria}
                      onChange={(e) => {
                        setForm({ ...form, categoria: e.target.value })
                        setShowSugerencias(true)
                      }}
                      onFocus={() => setShowSugerencias(true)}
                      onBlur={() => setTimeout(() => setShowSugerencias(false), 200)}
                      placeholder={t('categoria_placeholder')}
                      className={inputClass}
                    />
                    <MicButton field="categoria" />
                  </div>
                  {/* Sugerencias desplegables */}
                  {showSugerencias && sugerenciasFiltradas.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {sugerenciasFiltradas.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onMouseDown={() => {
                            setForm({ ...form, categoria: cat.toLowerCase() })
                            setShowSugerencias(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-accent/5 dark:hover:bg-accent/20 hover:text-accent transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {t('direccion')} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) =>
                      setForm({ ...form, direccion: e.target.value })
                    }
                    placeholder={t('direccion_placeholder')}
                    className={inputClass}
                  />
                  <MicButton field="direccion" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {t('zona')} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.zona}
                    onChange={(e) =>
                      setForm({ ...form, zona: e.target.value })
                    }
                    placeholder={t('zona_placeholder')}
                    className={inputClass}
                  />
                  <MicButton field="zona" />
                </div>
              </div>

              {/* Datos de contacto */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-2">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  {t('datos_contacto')} *
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      {t('nombre_completo')} *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.nombre_contacto}
                        onChange={(e) =>
                          setForm({ ...form, nombre_contacto: e.target.value })
                        }
                        placeholder={t('nombre_completo_placeholder')}
                        className={inputClass}
                      />
                      <MicButton field="nombre_contacto" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      {t('puesto')} *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.puesto}
                        onChange={(e) =>
                          setForm({ ...form, puesto: e.target.value })
                        }
                        placeholder={t('puesto_placeholder')}
                        className={inputClass}
                      />
                      <MicButton field="puesto" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      {t('telefono')} *
                    </label>
                    <div className="flex gap-2">
                      {/* Selector de prefijo */}
                      <div className="relative" ref={prefijoRef}>
                        <button
                          type="button"
                          onClick={() => setShowPrefijos(!showPrefijos)}
                          className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors whitespace-nowrap"
                        >
                          <span className="text-base">{prefijoActual.flag}</span>
                          <span>{prefijoActual.code}</span>
                          <ChevronDown className="w-3 h-3 text-neutral-400" />
                        </button>
                        {showPrefijos && (
                          <div className="absolute z-20 left-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-y-auto w-52">
                            {PREFIJOS.map((p) => (
                              <button
                                key={p.code}
                                type="button"
                                onClick={() => {
                                  setPrefijo(p.code)
                                  setShowPrefijos(false)
                                }}
                                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent/5 dark:hover:bg-accent/20 transition-colors ${
                                  prefijo === p.code ? 'bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent font-medium' : 'text-neutral-700 dark:text-neutral-300'
                                }`}
                              >
                                <span className="text-base">{p.flag}</span>
                                <span>{p.country}</span>
                                <span className="text-neutral-400 dark:text-neutral-500 ml-auto">{p.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Input teléfono */}
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          value={form.telefono}
                          onChange={(e) =>
                            setForm({ ...form, telefono: e.target.value })
                          }
                          placeholder={t('telefono_placeholder')}
                          className={inputClass}
                        />
                        <MicButton field="telefono" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      {t('email')} *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder={t('email_placeholder')}
                        className={inputClass}
                      />
                      <MicButton field="email" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Competidores */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                  </div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {t('competidores')} <span className="text-neutral-400 dark:text-neutral-500 font-normal">({t('competidores_opcional')})</span>
                  </p>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {t('competidores_desc')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      {t('competidor1')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.competidor1}
                        onChange={(e) =>
                          setForm({ ...form, competidor1: e.target.value })
                        }
                        placeholder={t('competidor1_placeholder')}
                        className={inputClass}
                      />
                      <MicButton field="competidor1" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      {t('competidor2')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.competidor2}
                        onChange={(e) =>
                          setForm({ ...form, competidor2: e.target.value })
                        }
                        placeholder={t('competidor2_placeholder')}
                        className={inputClass}
                      />
                      <MicButton field="competidor2" />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950 rounded-lg px-4 py-2">
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
                    {t('analizando')}
                  </>
                ) : (
                  <>
                    {t('analizar_negocio')}
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
        <h2 className="text-2xl font-bold text-accent dark:text-accent text-center mb-4">
          {t('descubriras')}
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-xl mx-auto">
          {t('compara_negocio')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: BarChart3,
              titleKey: 'puntuacion_maps',
              descKey: 'puntuacion_desc',
            },
            {
              icon: Eye,
              titleKey: 'gaps_detectados',
              descKey: 'gaps_desc',
            },
            {
              icon: Star,
              titleKey: 'plan_accion',
              descKey: 'plan_desc',
            },
          ].map((item) => (
            <div
              key={item.titleKey}
              className="text-center p-6 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-accent/30 dark:hover:border-accent/30 transition-colors bg-white dark:bg-neutral-900"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 dark:bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{t(item.titleKey as keyof typeof TEXTOS['es'])}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t(item.descKey as keyof typeof TEXTOS['es'])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-neutral-500 dark:text-neutral-500">
          {t('footer').replace('{year}', new Date().getFullYear().toString())}
        </div>
      </footer>
    </div>
  )
}
