'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  X,
  ArrowRight,
  Zap,
  MapPin,
  Bot,
  Shield,
  BarChart3,
  FileText,
  MessageSquare,
  Search,
  Globe,
  Sparkles,
  ChevronDown,
  Phone,
} from 'lucide-react'

// ─── Plan data ───
const PLANES = [
  {
    id: 'visibilidad_local',
    nombre: 'Visibilidad Local',
    tagline: 'Map Pack',
    subtitulo: 'Aparece en el Top 3 de Google Maps cuando tus clientes buscan cerca',
    precio: 197,
    precioFundador: 138,
    color: 'emerald',
    icon: MapPin,
    idealPara: 'Negocios que quieren aparecer en Google Maps y recibir mas llamadas y visitas.',
    features: [
      { text: 'Auditoria completa de Google Business Profile', category: 'diagnostico' },
      { text: 'Optimizacion NAP (nombre, direccion, telefono)', category: 'diagnostico' },
      { text: 'Investigacion de keywords locales', category: 'seo' },
      { text: 'Gestion de resenas con IA', category: 'engagement' },
      { text: 'Redaccion de posts GBP semanales', category: 'engagement' },
      { text: 'Informe mensual con metricas reales', category: 'reporting' },
    ],
    notIncluded: [
      'Posicionamiento en ChatGPT/Gemini/Perplexity',
      'Schema markup JSON-LD avanzado',
      'Monitorizacion en IAs',
      'FAQs optimizadas para voz',
      'Chunks de contenido para LLMs',
      'Perfil de entidad TLDR',
      'Prospector web automatizado',
    ],
    resultados: [
      { metric: '+65%', label: 'visitas al perfil GBP' },
      { metric: '+40%', label: 'llamadas desde Maps' },
      { metric: 'Top 3', label: 'en busquedas locales' },
    ],
    popular: false,
  },
  {
    id: 'autoridad_maps_ia',
    nombre: 'Autoridad Maps + IA',
    tagline: 'Map Pack + GEO/AEO',
    subtitulo: 'Domina Google Maps Y aparece cuando ChatGPT, Gemini o Siri recomiendan',
    precio: 397,
    precioFundador: 278,
    color: 'accent',
    icon: Bot,
    idealPara: 'Negocios que quieren liderar su zona tanto en Maps como en las respuestas de IAs.',
    features: [
      { text: 'Todo lo del plan Visibilidad Local', category: 'base' },
      { text: 'Schema JSON-LD para rich snippets', category: 'geo' },
      { text: 'FAQs optimizadas para busqueda por voz', category: 'geo' },
      { text: 'Chunks de contenido para LLMs', category: 'geo' },
      { text: 'Perfil de entidad (TLDR) para IAs', category: 'geo' },
      { text: 'Monitorizacion en ChatGPT, Gemini, Perplexity', category: 'monitoring' },
      { text: 'Informe comparativo mensual completo', category: 'reporting' },
      { text: 'Prospector web automatizado', category: 'growth' },
    ],
    notIncluded: [],
    resultados: [
      { metric: '+120%', label: 'visibilidad total' },
      { metric: '3x', label: 'menciones en IAs' },
      { metric: 'Top 1', label: 'recomendacion IA local' },
    ],
    popular: true,
  },
]

// ─── Feature comparison table ───
const COMPARATIVA = [
  {
    category: 'Diagnostico y optimizacion',
    icon: Search,
    features: [
      { name: 'Auditoria GBP completa', local: true, autoridad: true },
      { name: 'Optimizacion NAP', local: true, autoridad: true },
      { name: 'Investigacion keywords locales', local: true, autoridad: true },
    ],
  },
  {
    category: 'Engagement y contenido',
    icon: MessageSquare,
    features: [
      { name: 'Gestion de resenas con IA', local: true, autoridad: true },
      { name: 'Posts GBP semanales', local: true, autoridad: true },
      { name: 'FAQs optimizadas para voz', local: false, autoridad: true },
    ],
  },
  {
    category: 'GEO / AEO (Optimizacion para IAs)',
    icon: Bot,
    features: [
      { name: 'Schema JSON-LD avanzado', local: false, autoridad: true },
      { name: 'Chunks de contenido para LLMs', local: false, autoridad: true },
      { name: 'Perfil de entidad TLDR', local: false, autoridad: true },
      { name: 'Monitorizacion en ChatGPT/Gemini/Perplexity', local: false, autoridad: true },
    ],
  },
  {
    category: 'Crecimiento y reporting',
    icon: BarChart3,
    features: [
      { name: 'Informe mensual de metricas', local: true, autoridad: true },
      { name: 'Informe comparativo completo', local: false, autoridad: true },
      { name: 'Prospector web automatizado', local: false, autoridad: true },
      { name: 'Portal de cliente en tiempo real', local: true, autoridad: true },
    ],
  },
]

// ─── FAQs ───
const FAQS = [
  {
    q: 'Hay permanencia?',
    a: 'No. Puedes cancelar en cualquier momento. Trabajamos mes a mes porque confiamos en los resultados.',
  },
  {
    q: 'Cuanto tarda en verse resultados?',
    a: 'Las primeras mejoras se notan en 2-4 semanas (optimizaciones GBP, resenas, posts). El posicionamiento solido en Maps suele consolidarse en 2-3 meses.',
  },
  {
    q: 'Que es el precio fundador?',
    a: 'Es un 30% de descuento permanente para los primeros 10 clientes de cada plan. Una vez dentro, mantienes ese precio para siempre.',
  },
  {
    q: 'Necesito dar acceso a mi Google Business Profile?',
    a: 'Si, necesitamos acceso de gestor a tu perfil de GBP. Te guiamos paso a paso durante el onboarding.',
  },
  {
    q: 'Que diferencia hay entre SEO local y GEO/AEO?',
    a: 'SEO local (Maps) optimiza para que aparezcas en Google Maps. GEO/AEO optimiza para que ChatGPT, Gemini, Siri y otros asistentes de IA te recomienden cuando alguien pregunta.',
  },
  {
    q: 'Puedo cambiar de plan despues?',
    a: 'Si, puedes subir de Visibilidad Local a Autoridad Maps+IA en cualquier momento. La transicion es inmediata.',
  },
]

export default function PricingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">

      {/* ═══ HEADER NAV ═══ */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary dark:text-white font-bold text-lg">
            <MapPin className="w-5 h-5 text-accent" />
            Radar Local
          </Link>
          <Link href="/"
            className="text-sm text-neutral-500 hover:text-primary dark:hover:text-white transition-colors">
            Volver a inicio
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent dark:from-accent/[0.02]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" />
            30% descuento fundador — Solo primeros 10 clientes
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-primary dark:text-white leading-tight mb-5">
            Elige tu nivel de<br />
            <span className="text-accent">visibilidad local</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
            Dos planes claros, sin letra pequena. Resultados medibles desde el primer mes. Cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* ═══ PLAN CARDS ═══ */}
      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {PLANES.map((plan) => {
              const Icon = plan.icon
              return (
                <div key={plan.id}
                  className={`relative rounded-3xl transition-all ${
                    plan.popular
                      ? 'bg-primary dark:bg-neutral-900 text-white ring-2 ring-accent/40 shadow-2xl shadow-accent/10 lg:scale-[1.03]'
                      : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg shadow-neutral-200/50 dark:shadow-none'
                  }`}>

                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-accent text-white text-[11px] font-bold uppercase tracking-widest px-5 py-1.5 rounded-full shadow-lg shadow-accent/30">
                        Mas popular
                      </span>
                    </div>
                  )}

                  <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-5 h-5 ${plan.popular ? 'text-accent' : 'text-accent'}`} />
                          <span className="text-xs font-bold uppercase tracking-widest text-accent">
                            {plan.tagline}
                          </span>
                        </div>
                        <h2 className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-primary dark:text-white'}`}>
                          {plan.nombre}
                        </h2>
                      </div>
                    </div>

                    <p className={`text-sm mb-8 leading-relaxed ${plan.popular ? 'text-white/60' : 'text-neutral-500 dark:text-neutral-400'}`}>
                      {plan.subtitulo}
                    </p>

                    {/* Price */}
                    <div className="mb-2">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl md:text-6xl font-black tracking-tight ${plan.popular ? 'text-white' : 'text-primary dark:text-white'}`}>
                          &euro;{plan.precioFundador}
                        </span>
                        <span className={`text-base ${plan.popular ? 'text-white/40' : 'text-neutral-400'}`}>/mes</span>
                      </div>
                      <p className={`text-xs mt-1 ${plan.popular ? 'text-white/30' : 'text-neutral-400'}`}>
                        <s>&euro;{plan.precio}/mes</s> &middot; Precio fundador &middot; Permanente para ti
                      </p>
                    </div>

                    {/* Ideal para */}
                    <div className={`rounded-xl p-4 my-8 ${plan.popular ? 'bg-white/5' : 'bg-neutral-50 dark:bg-neutral-800/50'}`}>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${plan.popular ? 'text-accent' : 'text-accent'}`}>
                        Ideal para
                      </p>
                      <p className={`text-sm leading-relaxed ${plan.popular ? 'text-white/70' : 'text-neutral-600 dark:text-neutral-300'}`}>
                        {plan.idealPara}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className={`h-px mb-6 ${plan.popular ? 'bg-white/10' : 'bg-neutral-100 dark:bg-neutral-800'}`} />

                    {/* Features */}
                    <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${plan.popular ? 'text-white/50' : 'text-neutral-400'}`}>
                      Incluye
                    </p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((f) => (
                        <li key={f.text} className="flex items-start gap-3 text-sm">
                          <Check className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                          <span className={plan.popular ? 'text-white/80' : 'text-neutral-700 dark:text-neutral-300'}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Not included */}
                    {plan.notIncluded.length > 0 && (
                      <>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-4 mt-6 ${plan.popular ? 'text-white/30' : 'text-neutral-300 dark:text-neutral-600'}`}>
                          No incluido
                        </p>
                        <ul className="space-y-2.5 mb-8">
                          {plan.notIncluded.map((f) => (
                            <li key={f} className="flex items-start gap-3 text-sm">
                              <X className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-white/20' : 'text-neutral-300 dark:text-neutral-600'}`} />
                              <span className={plan.popular ? 'text-white/25' : 'text-neutral-400 dark:text-neutral-600'}>
                                {f}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Results preview */}
                    <div className={`grid grid-cols-3 gap-3 rounded-xl p-4 mb-8 ${plan.popular ? 'bg-accent/10' : 'bg-accent/5'}`}>
                      {plan.resultados.map((r) => (
                        <div key={r.label} className="text-center">
                          <p className="text-lg md:text-xl font-bold text-accent">{r.metric}</p>
                          <p className={`text-[10px] md:text-[11px] leading-tight ${plan.popular ? 'text-white/50' : 'text-neutral-500 dark:text-neutral-400'}`}>
                            {r.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link href="/#auditoria"
                      className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold transition-all text-sm uppercase tracking-wider ${
                        plan.popular
                          ? 'bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20'
                          : 'bg-primary hover:bg-primary/90 text-white dark:bg-white dark:text-primary dark:hover:bg-neutral-100'
                      }`}>
                      Empezar con {plan.nombre}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ COMPARATIVA DETALLADA ═══ */}
      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-3">
              Comparativa detallada
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Todo lo que incluye cada plan, sin sorpresas
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-lg">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_120px] md:grid-cols-[1fr_160px_160px] sticky top-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 z-10">
              <div className="p-4 md:p-6">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Funcionalidad</span>
              </div>
              <div className="p-4 md:p-6 text-center border-l border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">Visibilidad</span>
                <p className="text-accent font-bold text-sm mt-0.5">&euro;138/mes</p>
              </div>
              <div className="p-4 md:p-6 text-center border-l border-accent/20 bg-accent/5">
                <span className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">Autoridad</span>
                <p className="text-accent font-bold text-sm mt-0.5">&euro;278/mes</p>
              </div>
            </div>

            {/* Table body */}
            {COMPARATIVA.map((group) => {
              const GroupIcon = group.icon
              return (
                <div key={group.category}>
                  {/* Category header */}
                  <div className="grid grid-cols-[1fr_120px_120px] md:grid-cols-[1fr_160px_160px] bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="p-4 md:px-6 flex items-center gap-2">
                      <GroupIcon className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
                        {group.category}
                      </span>
                    </div>
                    <div className="border-l border-neutral-100 dark:border-neutral-800" />
                    <div className="border-l border-accent/20 bg-accent/5" />
                  </div>

                  {/* Features */}
                  {group.features.map((feature, idx) => (
                    <div key={feature.name}
                      className={`grid grid-cols-[1fr_120px_120px] md:grid-cols-[1fr_160px_160px] ${
                        idx < group.features.length - 1 ? 'border-b border-neutral-50 dark:border-neutral-800/50' : 'border-b border-neutral-100 dark:border-neutral-800'
                      }`}>
                      <div className="p-4 md:px-6 text-sm text-neutral-700 dark:text-neutral-300">
                        {feature.name}
                      </div>
                      <div className="p-4 md:px-6 text-center border-l border-neutral-100 dark:border-neutral-800 flex items-center justify-center">
                        {feature.local
                          ? <Check className="w-5 h-5 text-accent" />
                          : <X className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                        }
                      </div>
                      <div className="p-4 md:px-6 text-center border-l border-accent/20 bg-accent/[0.02] flex items-center justify-center">
                        {feature.autoridad
                          ? <Check className="w-5 h-5 text-accent" />
                          : <X className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Bottom CTA row */}
            <div className="grid grid-cols-[1fr_120px_120px] md:grid-cols-[1fr_160px_160px] bg-neutral-50/50 dark:bg-neutral-800/30">
              <div className="p-4 md:p-6" />
              <div className="p-4 md:p-6 text-center border-l border-neutral-100 dark:border-neutral-800">
                <Link href="/#auditoria"
                  className="inline-block text-xs font-bold text-primary dark:text-white hover:text-accent transition-colors uppercase tracking-wider">
                  Elegir
                </Link>
              </div>
              <div className="p-4 md:p-6 text-center border-l border-accent/20 bg-accent/5">
                <Link href="/#auditoria"
                  className="inline-block text-xs font-bold text-accent hover:text-accent/80 transition-colors uppercase tracking-wider">
                  Elegir
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COMO FUNCIONA ═══ */}
      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-3">
              Como empezamos a trabajar
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              De la auditoria gratuita a resultados en 3 pasos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Auditoria gratuita',
                desc: 'Analizamos tu perfil de Google Business Profile y te mostramos exactamente donde estas perdiendo clientes.',
              },
              {
                step: '02',
                icon: Phone,
                title: 'Llamada de 15 min',
                desc: 'Te explicamos los resultados, elegimos el plan adecuado y configuramos todo. Sin compromiso.',
              },
              {
                step: '03',
                icon: Sparkles,
                title: 'IA trabajando 24/7',
                desc: 'Nuestros 11 agentes de IA optimizan tu perfil, gestionan resenas, publican contenido y monitorizan resultados.',
              },
            ].map((item) => {
              const StepIcon = item.icon
              return (
                <div key={item.step} className="relative">
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 h-full">
                    <span className="text-6xl font-black text-accent/10 absolute top-4 right-6">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                      <StepIcon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-primary dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ GARANTIAS ═══ */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-primary dark:bg-neutral-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: 'Sin permanencia', desc: 'Cancela cuando quieras. Sin penalizacion, sin preguntas.' },
                { icon: BarChart3, title: 'Resultados medibles', desc: 'Panel en tiempo real con metricas claras. Ves exactamente que hacemos.' },
                { icon: FileText, title: 'Informes mensuales', desc: 'Cada mes recibes un informe detallado con progreso y proximos pasos.' },
              ].map((item) => {
                const ItemIcon = item.icon
                return (
                  <div key={item.title} className="text-center md:text-left">
                    <ItemIcon className="w-8 h-8 text-accent mx-auto md:mx-0 mb-3" />
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQS ═══ */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-3">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <span className="font-semibold text-primary dark:text-white text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4">
            Empieza con una auditoria gratuita
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-xl mx-auto">
            Descubre en 2 minutos como esta tu posicionamiento local y que oportunidades estas perdiendo.
          </p>
          <Link href="/#auditoria"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-accent/20">
            Auditar mi negocio gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span>Radar Local &middot; Posicionamiento local con IA</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-primary dark:hover:text-white transition-colors">Inicio</Link>
            <Link href="/pricing" className="text-accent">Pricing</Link>
            <a href="mailto:hola@radarlocal.es" className="hover:text-primary dark:hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
