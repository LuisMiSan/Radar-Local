'use client'

import {
  CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown,
  Minus, Search, Star, MapPin, Eye, FileText, Code, HelpCircle,
  MessageSquare, ExternalLink, Copy, Check
} from 'lucide-react'
import { useState } from 'react'
import type { AgentResult } from '@/lib/agents/types'
import {
  MetricCardLarge, HealthRadarChart,
  ComparisonBarChart, PresencePieChart, HighlightsList,
  ActionsList,
} from './report-charts'

interface AgentReportProps {
  result: AgentResult
}

export default function AgentReport({ result }: AgentReportProps) {
  const { agente, datos } = result

  // Si es respuesta_raw (no se parseó JSON), mostrar como texto
  if (datos.respuesta_raw) {
    return <RawReport text={datos.respuesta_raw as string} />
  }

  // Renderizar informe específico por agente
  switch (agente) {
    case 'auditor_gbp':
      return <AuditorGBPReport datos={datos} />
    case 'optimizador_nap':
      return <NAPReport datos={datos} />
    case 'keywords_locales':
      return <KeywordsReport datos={datos} />
    case 'gestor_resenas':
      return <ResenasReport datos={datos} />
    case 'redactor_posts_gbp':
      return <PostsReport datos={datos} />
    case 'generador_schema':
      return <SchemaReport datos={datos} />
    case 'creador_faq_geo':
      return <FAQReport datos={datos} />
    case 'generador_chunks':
      return <ChunksReport datos={datos} />
    case 'tldr_entidad':
      return <TLDRReport datos={datos} />
    case 'monitor_ias':
      return <MonitorIAReport datos={datos} />
    case 'generador_reporte':
      return <ReporteMensualReport datos={datos} />
    default:
      return <GenericReport datos={datos} />
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES COMPARTIDOS
// ═══════════════════════════════════════════════════════════════

function ScoreGauge({ score, max = 100, label }: { score: number; max?: number; label: string }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 45
  const dashOffset = circumference - (circumference * pct) / 100

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-neutral-400">/ {max}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-neutral-600 mt-1">{label}</span>
    </div>
  )
}

function MetricCard({ label, value, variation, icon: Icon }: {
  label: string; value: string | number; variation?: string;
  icon?: React.ElementType
}) {
  const isPositive = variation?.includes('+') || variation?.includes('subida') || variation?.includes('mejora')
  const isNegative = variation?.includes('-') || variation?.includes('bajada')

  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-4">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-4 h-4 text-neutral-400" />}
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
      {variation && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${
          isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-neutral-500'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> :
           isNegative ? <TrendingDown className="w-3 h-3" /> :
           <Minus className="w-3 h-3" />}
          {variation}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    ok: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2 },
    mejorable: { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertTriangle },
    critico: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
  }
  const c = config[status] ?? config.mejorable
  const Icon = c.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <Icon className="w-3 h-3" />
      {status === 'ok' ? 'OK' : status === 'mejorable' ? 'Mejorable' : 'Crítico'}
    </span>
  )
}

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-800 mb-3 mt-5 first:mt-0">
      {Icon && <Icon className="w-4 h-4 text-accent" />}
      {children}
    </h4>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// INFORMES POR AGENTE
// ═══════════════════════════════════════════════════════════════

// ── AUDITOR GBP ──────────────────────────────────────────────

function AuditorGBPReport({ datos }: { datos: Record<string, unknown> }) {
  const puntuacion = (datos.puntuacion as number) ?? 0
  const items = (datos.items as Array<{ campo: string; estado: string; detalle: string }>) ?? []
  const problemas = (datos.problemas as string[]) ?? []
  const recomendaciones = (datos.recomendaciones_map_pack as string[]) ?? []

  const okCount = items.filter((i) => i.estado === 'ok').length
  const mejCount = items.filter((i) => i.estado === 'mejorable').length
  const critCount = items.filter((i) => i.estado === 'critico').length

  return (
    <div className="space-y-4">
      {/* Score y resumen */}
      <div className="flex items-center gap-6 bg-gradient-to-r from-neutral-50 to-white rounded-xl p-5 border border-neutral-100">
        <ScoreGauge score={puntuacion} label="Puntuación GBP" />
        <div className="flex-1 grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-600">{okCount}</p>
            <p className="text-[10px] text-green-700">Correctos</p>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <p className="text-lg font-bold text-amber-600">{mejCount}</p>
            <p className="text-[10px] text-amber-700">Mejorables</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <p className="text-lg font-bold text-red-600">{critCount}</p>
            <p className="text-[10px] text-red-700">Críticos</p>
          </div>
        </div>
      </div>

      {/* Items auditados */}
      {items.length > 0 && (
        <>
          <SectionTitle icon={FileText}>Campos auditados</SectionTitle>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-neutral-100">
                <StatusBadge status={item.estado} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">{item.campo}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.detalle}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Problemas */}
      {problemas.length > 0 && (
        <>
          <SectionTitle icon={AlertTriangle}>Problemas detectados</SectionTitle>
          <ul className="space-y-2">
            {problemas.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 bg-red-50/50 p-3 rounded-lg">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Recomendaciones */}
      {recomendaciones.length > 0 && (
        <>
          <SectionTitle icon={TrendingUp}>Recomendaciones Map Pack</SectionTitle>
          <ol className="space-y-2">
            {recomendaciones.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-700 bg-green-50/50 p-3 rounded-lg">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

// ── OPTIMIZADOR NAP ──────────────────────────────────────────

function NAPReport({ datos }: { datos: Record<string, unknown> }) {
  const consistencia = (datos.consistencia_pct as number) ?? 0
  const fuentes = (datos.fuentes as Array<{ directorio: string; nombre: string; direccion: string; telefono: string; consistente: boolean }>) ?? []
  const correcciones = (datos.correcciones as Array<{ directorio: string; campo: string; actual: string; correcto: string }>) ?? []
  const impacto = (datos.impacto_maps as string) ?? ''

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 bg-gradient-to-r from-neutral-50 to-white rounded-xl p-5 border border-neutral-100">
        <ScoreGauge score={consistencia} label="Consistencia NAP" />
        <div className="flex-1">
          <p className="text-sm text-neutral-600">{impacto}</p>
        </div>
      </div>

      {fuentes.length > 0 && (
        <>
          <SectionTitle icon={MapPin}>Directorios analizados</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 text-xs font-medium text-neutral-500">Directorio</th>
                  <th className="text-left py-2 text-xs font-medium text-neutral-500">Estado</th>
                  <th className="text-left py-2 text-xs font-medium text-neutral-500">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {fuentes.map((f, i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    <td className="py-2 font-medium text-neutral-800">{f.directorio}</td>
                    <td className="py-2">
                      {f.consistente ? (
                        <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Consistente</span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" /> Inconsistente</span>
                      )}
                    </td>
                    <td className="py-2 text-neutral-600">{f.telefono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {correcciones.length > 0 && (
        <>
          <SectionTitle icon={AlertTriangle}>Correcciones necesarias</SectionTitle>
          <div className="space-y-2">
            {correcciones.map((c, i) => (
              <div key={i} className="p-3 bg-amber-50/50 rounded-lg text-sm">
                <p className="font-medium text-neutral-800">{c.directorio} — {c.campo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-red-600 line-through">{c.actual}</span>
                  <span className="text-neutral-400">→</span>
                  <span className="text-green-600 font-medium">{c.correcto}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── KEYWORDS LOCALES ─────────────────────────────────────────

function KeywordsReport({ datos }: { datos: Record<string, unknown> }) {
  const keywords = (datos.keywords as Array<{ kw: string; volumen: number; intent: string; activa_map_pack: boolean; activa_voz: boolean }>) ?? []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Keywords" value={keywords.length} icon={Search} />
        <MetricCard label="Map Pack" value={keywords.filter(k => k.activa_map_pack).length} icon={MapPin} />
        <MetricCard label="Búsqueda por voz" value={keywords.filter(k => k.activa_voz).length} icon={MessageSquare} />
      </div>

      <SectionTitle icon={Search}>Keywords identificadas</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-2 text-xs font-medium text-neutral-500">Keyword</th>
              <th className="text-right py-2 text-xs font-medium text-neutral-500">Vol.</th>
              <th className="text-center py-2 text-xs font-medium text-neutral-500">Intención</th>
              <th className="text-center py-2 text-xs font-medium text-neutral-500">Map Pack</th>
              <th className="text-center py-2 text-xs font-medium text-neutral-500">Voz</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((kw, i) => (
              <tr key={i} className="border-b border-neutral-50">
                <td className="py-2 font-medium text-neutral-800">{kw.kw}</td>
                <td className="py-2 text-right text-neutral-600">{kw.volumen}</td>
                <td className="py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    kw.intent === 'local' ? 'bg-blue-50 text-blue-700' :
                    kw.intent === 'transaccional' ? 'bg-green-50 text-green-700' :
                    'bg-purple-50 text-purple-700'
                  }`}>{kw.intent}</span>
                </td>
                <td className="py-2 text-center">{kw.activa_map_pack ? '✓' : '—'}</td>
                <td className="py-2 text-center">{kw.activa_voz ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── GESTOR RESEÑAS ───────────────────────────────────────────

function ResenasReport({ datos }: { datos: Record<string, unknown> }) {
  const total = (datos.total as number) ?? 0
  const positivas = (datos.positivas as number) ?? 0
  const negativas = (datos.negativas as number) ?? 0
  const neutras = (datos.neutras as number) ?? 0
  const media = (datos.puntuacion_media as number) ?? 0
  const respuestas = (datos.respuestas_sugeridas as Array<{ resena: string; tipo: string; respuesta: string }>) ?? []
  const estrategia = (datos.estrategia as string) ?? ''
  // impacto_ranking disponible en datos para uso futuro

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total reseñas" value={total} icon={Star} />
        <MetricCard label="Puntuación" value={`${media}/5`} icon={Star} />
        <MetricCard label="Positivas" value={positivas} />
        <MetricCard label="Negativas" value={negativas} />
      </div>

      {/* Barra de distribución */}
      <div className="bg-white rounded-xl border border-neutral-100 p-4">
        <p className="text-xs text-neutral-500 mb-2">Distribución</p>
        <div className="flex rounded-full overflow-hidden h-3">
          {positivas > 0 && <div className="bg-green-400" style={{ width: `${(positivas/total)*100}%` }} />}
          {neutras > 0 && <div className="bg-amber-400" style={{ width: `${(neutras/total)*100}%` }} />}
          {negativas > 0 && <div className="bg-red-400" style={{ width: `${(negativas/total)*100}%` }} />}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-neutral-400">
          <span>Positivas {positivas}</span>
          <span>Neutras {neutras}</span>
          <span>Negativas {negativas}</span>
        </div>
      </div>

      {respuestas.length > 0 && (
        <>
          <SectionTitle icon={MessageSquare}>Respuestas sugeridas</SectionTitle>
          <div className="space-y-3">
            {respuestas.map((r, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    r.tipo === 'positiva' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>{r.tipo === 'positiva' ? 'Positiva' : 'Negativa'}</span>
                </div>
                <p className="text-sm text-neutral-600 italic mb-2">&ldquo;{r.resena}&rdquo;</p>
                <div className="bg-accent/5 rounded-lg p-3">
                  <p className="text-sm text-neutral-800">{r.respuesta}</p>
                  <CopyButton text={r.respuesta} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {estrategia && (
        <div className="bg-blue-50/50 rounded-xl p-4">
          <SectionTitle icon={TrendingUp}>Estrategia</SectionTitle>
          <p className="text-sm text-neutral-700">{estrategia}</p>
        </div>
      )}
    </div>
  )
}

// ── REDACTOR POSTS GBP ───────────────────────────────────────

function PostsReport({ datos }: { datos: Record<string, unknown> }) {
  const posts = (datos.posts as Array<{ titulo: string; contenido: string; cta: string; tipo: string; objetivo_map_pack: string }>) ?? []

  const tipoColor: Record<string, string> = {
    novedad: 'bg-blue-50 text-blue-700',
    consejo: 'bg-green-50 text-green-700',
    prueba_social: 'bg-purple-50 text-purple-700',
    oferta: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className="space-y-4">
      <MetricCard label="Posts generados" value={posts.length} icon={FileText} />

      {posts.map((post, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-neutral-800">Post {i + 1}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${tipoColor[post.tipo] ?? 'bg-neutral-50 text-neutral-700'}`}>
              {post.tipo}
            </span>
          </div>
          <h5 className="font-semibold text-neutral-900 mb-1">{post.titulo}</h5>
          <p className="text-sm text-neutral-700 mb-2 whitespace-pre-line">{post.contenido}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-accent/10 text-accent px-2 py-1 rounded-lg font-medium">CTA: {post.cta}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Objetivo Maps: {post.objetivo_map_pack}</p>
          <CopyButton text={`${post.titulo}\n\n${post.contenido}\n\n${post.cta}`} />
        </div>
      ))}
    </div>
  )
}

// ── GENERADOR SCHEMA ─────────────────────────────────────────

function SchemaReport({ datos }: { datos: Record<string, unknown> }) {
  const schemas = (datos.schemas as Array<{ tipo: string; json_ld: object; beneficio_llm: string }>) ?? []

  return (
    <div className="space-y-4">
      <MetricCard label="Schemas generados" value={schemas.length} icon={Code} />

      {schemas.map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-neutral-800">{s.tipo}</span>
            <CopyButton text={JSON.stringify(s.json_ld, null, 2)} />
          </div>
          <p className="text-xs text-neutral-500 mb-3">{s.beneficio_llm}</p>
          <pre className="bg-neutral-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto max-h-40">
            {JSON.stringify(s.json_ld, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  )
}

// ── CREADOR FAQ GEO ──────────────────────────────────────────

function FAQReport({ datos }: { datos: Record<string, unknown> }) {
  const faqs = (datos.faqs as Array<{ pregunta: string; respuesta: string; plataforma_target: string }>) ?? []

  return (
    <div className="space-y-4">
      <MetricCard label="FAQs generadas" value={faqs.length} icon={HelpCircle} />

      {faqs.map((faq, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{faq.plataforma_target}</span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 mb-1">{faq.pregunta}</p>
          <p className="text-sm text-neutral-700">{faq.respuesta}</p>
          <CopyButton text={`P: ${faq.pregunta}\nR: ${faq.respuesta}`} />
        </div>
      ))}
    </div>
  )
}

// ── GENERADOR CHUNKS ─────────────────────────────────────────

function ChunksReport({ datos }: { datos: Record<string, unknown> }) {
  const chunks = (datos.chunks as Array<{ titulo: string; contenido: string; optimizado_para: string }>) ?? []

  return (
    <div className="space-y-4">
      <MetricCard label="Chunks generados" value={chunks.length} icon={FileText} />

      {chunks.map((chunk, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-bold text-neutral-800">{chunk.titulo}</h5>
            <CopyButton text={chunk.contenido} />
          </div>
          <p className="text-sm text-neutral-700 whitespace-pre-line mb-2">{chunk.contenido}</p>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
            Optimizado para: {chunk.optimizado_para}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── TL;DR ENTIDAD ────────────────────────────────────────────

function TLDRReport({ datos }: { datos: Record<string, unknown> }) {
  const resumen = (datos.resumen as string) ?? ''
  const entidad = (datos.entidad as Record<string, string>) ?? {}
  const atributos = (datos.atributos as string[]) ?? []
  const fuentes = (datos.fuentes_ia as string[]) ?? []

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
        <p className="text-sm text-neutral-800 leading-relaxed">{resumen}</p>
      </div>

      {Object.keys(entidad).length > 0 && (
        <>
          <SectionTitle icon={FileText}>Datos de entidad</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(entidad).map(([key, val]) => (
              <div key={key} className="bg-white rounded-lg border border-neutral-100 p-3">
                <p className="text-[10px] text-neutral-400 uppercase">{key}</p>
                <p className="text-sm font-medium text-neutral-800">{val}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {atributos.length > 0 && (
        <>
          <SectionTitle>Atributos distintivos</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {atributos.map((a, i) => (
              <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">{a}</span>
            ))}
          </div>
        </>
      )}

      {fuentes.length > 0 && (
        <>
          <SectionTitle icon={Eye}>Fuentes para IAs</SectionTitle>
          <ul className="space-y-1">
            {fuentes.map((f, i) => (
              <li key={i} className="text-sm text-neutral-600 flex items-center gap-2">
                <ExternalLink className="w-3 h-3 text-neutral-400" /> {f}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ── MONITOR IAs ──────────────────────────────────────────────

function MonitorIAReport({ datos }: { datos: Record<string, unknown> }) {
  const plataformas = (datos.plataformas as Array<{
    nombre_plataforma: string; mencionado: boolean; posicion: number | null;
    contexto: string; accion_mejora: string; fecha: string
  }>) ?? []
  const presencia = (datos.presencia_global as string) ?? ''

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
        <p className="text-sm text-neutral-700 font-medium">{presencia}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {plataformas.map((p, i) => (
          <div key={i} className={`rounded-xl border p-4 ${
            p.mencionado ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-neutral-800">{p.nombre_plataforma}</span>
              {p.mencionado ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            {p.posicion && <p className="text-xs text-neutral-500">Posición: #{p.posicion}</p>}
            <p className="text-xs text-neutral-600 mt-1">{p.contexto}</p>
            {!p.mencionado && (
              <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded-lg">{p.accion_mejora}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── REPORTE MENSUAL (con gráficos interactivos) ──────────────

function ReporteMensualReport({ datos }: { datos: Record<string, unknown> }) {
  const secciones = (datos.secciones as Array<{ titulo: string; contenido: string }>) ?? []
  const mapPack = datos.metricas_map_pack as Record<string, { anterior: number | string; actual: number | string; variacion: string }> | undefined
  const geoAeo = datos.metricas_geo_aeo as Record<string, unknown> | undefined

  // Extraer métricas para gráficos
  const posicion = mapPack?.posicion_maps
  const visitas = mapPack?.visitas_ficha
  const llamadas = mapPack?.llamadas
  const nap = mapPack?.nap_consistencia

  // Preparar datos para gráfico de barras
  const barData = []
  if (posicion) barData.push({ name: 'Posición', anterior: Number(posicion.anterior) || 0, actual: Number(posicion.actual) || 0 })
  if (visitas) barData.push({ name: 'Visitas', anterior: Number(visitas.anterior) || 0, actual: Number(visitas.actual) || 0 })
  if (llamadas) barData.push({ name: 'Llamadas', anterior: Number(llamadas.anterior) || 0, actual: Number(llamadas.actual) || 0 })

  // Preparar datos para radar de salud
  const napPct = nap ? parseInt(String(nap.actual)) || 0 : 0
  const radarData = [
    { area: 'GBP', score: mapPack?.posicion_maps ? Math.max(0, 100 - (Number(mapPack.posicion_maps.actual) || 0) * 10) : 50, max: 100 },
    { area: 'NAP', score: napPct, max: 100 },
    { area: 'Reseñas', score: visitas ? Math.min(100, Number(visitas.actual) / 10) : 30, max: 100 },
    { area: 'Contenido', score: geoAeo?.schemas_implementados ? Math.min(100, Number(geoAeo.schemas_implementados) * 25) : 0, max: 100 },
    { area: 'IAs', score: geoAeo?.plataformas_presencia ? parseInt(String(geoAeo.plataformas_presencia)) * 25 : 0, max: 100 },
  ]

  // Presencia en IAs
  const presenciaStr = String(geoAeo?.plataformas_presencia ?? '0')
  const presenciaNum = parseInt(presenciaStr) || 0
  const platforms = [
    { name: 'Gemini', active: (Number(geoAeo?.posicion_gemini) || 0) > 0 },
    { name: 'ChatGPT', active: false },
    { name: 'Perplexity', active: (Number(geoAeo?.posicion_perplexity) || 0) > 0 },
    { name: 'Siri', active: false },
  ]

  // Extraer highlights y acciones de las secciones
  const highlightSection = secciones.find((s) =>
    s.titulo.toLowerCase().includes('highlight') || s.titulo.toLowerCase().includes('logro')
  )
  const actionSection = secciones.find((s) =>
    s.titulo.toLowerCase().includes('próximo') || s.titulo.toLowerCase().includes('accion') || s.titulo.toLowerCase().includes('paso')
  )
  const contentSections = secciones.filter((s) =>
    s !== highlightSection && s !== actionSection
  )

  // Parsear bullets de secciones
  const parseItems = (text: string): string[] => {
    return text.split(/\n|(?:\d+\.)\s/).map(s => s.trim()).filter(s => s.length > 10)
  }

  return (
    <div className="space-y-6">
      {/* ── Fila de métricas principales ── */}
      {mapPack && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {posicion && (
            <MetricCardLarge
              label="Posición Maps"
              value={`#${posicion.actual}`}
              previous={`#${posicion.anterior}`}
              variation={posicion.variacion}
              icon={MapPin}
              color="accent"
            />
          )}
          {visitas && (
            <MetricCardLarge
              label="Visitas ficha"
              value={visitas.actual}
              previous={visitas.anterior}
              variation={visitas.variacion}
              icon={Eye}
              color="blue"
            />
          )}
          {llamadas && (
            <MetricCardLarge
              label="Llamadas"
              value={llamadas.actual}
              previous={llamadas.anterior}
              variation={llamadas.variacion}
              icon={Star}
              color="purple"
            />
          )}
          {nap && (
            <MetricCardLarge
              label="NAP consistencia"
              value={nap.actual}
              previous={nap.anterior}
              variation={nap.variacion}
              icon={FileText}
              color="amber"
            />
          )}
        </div>
      )}

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar de salud */}
        <HealthRadarChart data={radarData} />

        {/* Barras comparativas */}
        {barData.length > 0 && (
          <ComparisonBarChart data={barData} title="Evolución mensual" />
        )}
      </div>

      {/* ── Presencia en IAs (si tiene pack completo) ── */}
      {geoAeo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PresencePieChart present={presenciaNum} total={4} platforms={platforms} />
          <div className="bg-white rounded-xl border border-neutral-100 p-4">
            <h4 className="text-sm font-semibold text-neutral-800 mb-3">Métricas GEO/AEO</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(geoAeo).map(([key, val]) => (
                <div key={key} className="p-2 bg-neutral-50 rounded-lg">
                  <p className="text-[10px] text-neutral-400 uppercase">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-bold text-neutral-800">{String(val)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Highlights ── */}
      {highlightSection && (
        <HighlightsList items={parseItems(highlightSection.contenido)} />
      )}

      {/* ── Secciones de contenido ── */}
      {contentSections.map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5">
          <h5 className="text-sm font-bold text-neutral-800 mb-2">{s.titulo}</h5>
          <p className="text-sm text-neutral-700 whitespace-pre-line leading-relaxed">{s.contenido}</p>
        </div>
      ))}

      {/* ── Próximos pasos ── */}
      {actionSection && (
        <ActionsList items={parseItems(actionSection.contenido)} />
      )}
    </div>
  )
}

// ── FALLBACKS ────────────────────────────────────────────────

function RawReport({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-4">
      <p className="text-sm text-neutral-700 whitespace-pre-line">{text}</p>
    </div>
  )
}

function GenericReport({ datos }: { datos: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      {Object.entries(datos).map(([key, val]) => (
        <div key={key} className="bg-white rounded-xl border border-neutral-100 p-4">
          <p className="text-xs text-neutral-400 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
          <p className="text-sm text-neutral-700">
            {typeof val === 'string' ? val : JSON.stringify(val, null, 2)}
          </p>
        </div>
      ))}
    </div>
  )
}
