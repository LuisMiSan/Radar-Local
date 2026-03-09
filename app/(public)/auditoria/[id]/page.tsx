'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  MapPin,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Camera,
  Star,
  FileText,
  Code,
  Eye,
  Search,
  type LucideIcon,
} from 'lucide-react'
import type { AuditResult } from '@/lib/audit'

// Mapa de iconos para gaps
const gapIcons: Record<string, LucideIcon> = {
  Camera,
  Star,
  FileText,
  Code,
  Eye,
  MapPin,
  Search,
}

const impactoColor: Record<string, { bg: string; text: string; label: string }> = {
  alto: { bg: 'bg-red-50', text: 'text-red-600', label: 'Impacto alto' },
  medio: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Impacto medio' },
  bajo: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Impacto bajo' },
}

function PuntuacionCircle({
  puntuacion,
  size = 'lg',
}: {
  puntuacion: number
  size?: 'lg' | 'sm'
}) {
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (puntuacion / 100) * circumference
  const color =
    puntuacion >= 70
      ? 'text-green-500'
      : puntuacion >= 50
        ? 'text-amber-500'
        : 'text-red-500'

  const dims = size === 'lg' ? 'w-32 h-32' : 'w-20 h-20'
  const fontSize = size === 'lg' ? 'text-3xl' : 'text-lg'

  return (
    <div className={`relative ${dims}`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-neutral-100"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${fontSize} font-bold text-neutral-900`}>
          {puntuacion}
        </span>
      </div>
    </div>
  )
}

export default function AuditoriaResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/audit?id=${params.id}`)
        if (!res.ok) throw new Error('Auditoría no encontrada')
        const data = await res.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Cargando resultados...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <p className="text-neutral-700 font-medium mb-2">
            {error || 'No se encontró la auditoría'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-accent hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Nav */}
      <nav className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Nueva auditoría
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="font-bold text-primary">Radar Local</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary mb-1">
            Resultados de tu auditoría
          </h1>
          <p className="text-neutral-500">
            {result.negocio.nombre} &mdash; {result.negocio.zona}
          </p>
        </div>

        {/* Comparativa puntuación */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-8 mb-8">
          <h2 className="text-lg font-semibold text-primary mb-6">
            Tu posición vs competidores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Competidor 1 */}
            <div>
              <PuntuacionCircle
                puntuacion={result.competidores[0].puntuacion}
                size="sm"
              />
              <p className="font-medium text-neutral-700 mt-3 text-sm">
                {result.competidores[0].nombre}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Competidor #1</p>
            </div>

            {/* Tu negocio */}
            <div className="flex flex-col items-center">
              <PuntuacionCircle puntuacion={result.negocio.puntuacion} />
              <p className="font-semibold text-primary mt-3">
                {result.negocio.nombre}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Tu negocio</p>
            </div>

            {/* Competidor 2 */}
            <div>
              <PuntuacionCircle
                puntuacion={result.competidores[1].puntuacion}
                size="sm"
              />
              <p className="font-medium text-neutral-700 mt-3 text-sm">
                {result.competidores[1].nombre}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Competidor #2</p>
            </div>
          </div>

          {result.negocio.puntuacion < 60 && (
            <div className="mt-8 bg-red-50 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  Tu negocio está por debajo de tus competidores directos
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Con una puntuación de {result.negocio.puntuacion}/100, estás
                  perdiendo clientes que te buscan en Google Maps y asistentes IA.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Gaps detectados */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-8 mb-8">
          <h2 className="text-lg font-semibold text-primary mb-2">
            Gaps detectados
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            Áreas donde pierdes visibilidad frente a tus competidores
          </p>
          <div className="space-y-3">
            {result.gaps.map((gap) => {
              const Icon = gapIcons[gap.icono] ?? AlertTriangle
              const impacto = impactoColor[gap.impacto]
              return (
                <div
                  key={gap.area}
                  className="flex items-start gap-4 p-4 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${impacto.bg}`}>
                    <Icon className={`w-5 h-5 ${impacto.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm text-neutral-900">
                        {gap.area}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${impacto.bg} ${impacto.text}`}
                      >
                        {impacto.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">{gap.descripcion}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ventajas competidores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {result.competidores.map((comp, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-neutral-100 p-6"
            >
              <h3 className="font-semibold text-sm text-primary mb-3">
                {comp.nombre}
              </h3>
              <div className="space-y-2 mb-4">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Lo que hacen bien
                </p>
                {comp.ventajas.map((v) => (
                  <div key={v} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-neutral-600">{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Sus debilidades
                </p>
                {comp.debilidades.map((d) => (
                  <div key={d} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-neutral-600">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA presupuesto */}
        <div className="bg-gradient-to-r from-primary to-primary-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">
            Supera a tu competencia en Google Maps
          </h2>
          <p className="text-white/70 mb-6 max-w-lg mx-auto text-sm">
            Te preparamos un plan personalizado con ROI estimado a 3 meses.
            Pack recomendado:{' '}
            <strong className="text-accent">
              {result.recomendacion_pack === 'visibilidad_local'
                ? 'Visibilidad Local'
                : 'Autoridad Maps + IA'}
            </strong>
          </p>
          <button
            onClick={() => router.push(`/presupuesto/${result.id}`)}
            className="bg-accent hover:bg-accent-600 text-white font-medium px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            Solicitar presupuesto gratuito
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-100 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-neutral-400">
          Radar Local Agency &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
