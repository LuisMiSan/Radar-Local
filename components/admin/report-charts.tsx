'use client'

import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus,
  Star, AlertTriangle, CheckCircle2, Target,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// GAUGE — Rueda de puntuación grande
// ═══════════════════════════════════════════════════════════════

export function ScoreGaugeChart({ score, max = 100, label, size = 160 }: {
  score: number; max?: number; label: string; size?: number
}) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
  const data = [{ value: pct, fill: color }]

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={size} height={size}>
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="70%" outerRadius="100%"
          startAngle={225} endAngle={-45}
          data={data}
          barSize={12}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: '#f3f4f6' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="relative -mt-[calc(50%+10px)] flex flex-col items-center mb-4">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-neutral-400">/ {max}</span>
      </div>
      <span className="text-xs font-semibold text-neutral-600 mt-1">{label}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MÉTRICAS CON VARIACIÓN
// ═══════════════════════════════════════════════════════════════

export function MetricCardLarge({ label, value, previous, variation, icon: Icon, color = 'accent' }: {
  label: string; value: string | number; previous?: string | number;
  variation?: string; icon?: React.ElementType; color?: string
}) {
  const isPositive = variation?.includes('+') || variation?.toLowerCase().includes('mejora') || variation?.toLowerCase().includes('subida')
  const isNegative = variation?.includes('-') || variation?.toLowerCase().includes('bajada') || variation?.toLowerCase().includes('peor')

  const colorMap: Record<string, string> = {
    accent: 'from-accent/10 to-accent/5 border-accent/20',
    blue: 'from-blue-50 to-blue-25 border-blue-200',
    purple: 'from-purple-50 to-purple-25 border-purple-200',
    amber: 'from-amber-50 to-amber-25 border-amber-200',
  }

  return (
    <div className={`bg-gradient-to-br ${colorMap[color] ?? colorMap.accent} rounded-xl border p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-neutral-400" />}
        <span className="text-xs font-medium text-neutral-500">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-neutral-900">{value}</span>
        {previous !== undefined && (
          <span className="text-xs text-neutral-400 mb-1">ant: {previous}</span>
        )}
      </div>
      {variation && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
          isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-neutral-500'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> :
           isNegative ? <TrendingDown className="w-3 h-3" /> :
           <Minus className="w-3 h-3" />}
          <span>{variation}</span>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// HEALTH BARS — Barras horizontales de salud del perfil
// ═══════════════════════════════════════════════════════════════

export function HealthRadarChart({ data }: {
  data: Array<{ area: string; score: number; max: number }>
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-4">
      <h4 className="text-sm font-semibold text-neutral-800 mb-4">Salud del perfil</h4>
      <div className="space-y-3">
        {data.map((item) => {
          const pct = Math.round((item.score / item.max) * 100)
          const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'
          const textColor = pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600'

          return (
            <div key={item.area}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-neutral-700">{item.area}</span>
                <span className={`text-xs font-bold ${textColor}`}>{pct}%</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.max(2, pct)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BAR CHART — Comparativa de métricas
// ═══════════════════════════════════════════════════════════════

export function ComparisonBarChart({ data, title }: {
  data: Array<{ name: string; anterior: number; actual: number }>
  title: string
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-4">
      <h4 className="text-sm font-semibold text-neutral-800 mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a2332',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="anterior" fill="#d1d5db" radius={[4, 4, 0, 0]} name="Anterior" />
          <Bar dataKey="actual" fill="#00C9A7" radius={[4, 4, 0, 0]} name="Actual" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PIE CHART — Distribución de presencia en IAs
// ═══════════════════════════════════════════════════════════════

export function PresencePieChart({ present, total, platforms }: {
  present: number; total: number; platforms: Array<{ name: string; active: boolean }>
}) {
  const data = [
    { name: 'Presente', value: present },
    { name: 'Ausente', value: total - present },
  ]
  const COLORS = ['#00C9A7', '#e5e7eb']

  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-4">
      <h4 className="text-sm font-semibold text-neutral-800 mb-2">Presencia en IAs</h4>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={35} outerRadius={50}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {platforms.map((p) => (
            <div key={p.name} className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${p.active ? 'bg-green-500' : 'bg-neutral-300'}`} />
              <span className={p.active ? 'text-neutral-800 font-medium' : 'text-neutral-400'}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// HIGHLIGHTS — Logros principales
// ═══════════════════════════════════════════════════════════════

export function HighlightsList({ items }: { items: string[] }) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
      <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-green-600" />
        Highlights del mes
      </h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ACCIONES — Próximos pasos priorizados
// ═══════════════════════════════════════════════════════════════

export function ActionsList({ items }: { items: string[] }) {
  const priorityColors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-neutral-400', 'bg-neutral-300']

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
      <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-blue-600" />
        Próximos pasos
      </h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-blue-900">
            <div className="flex items-center gap-1.5 shrink-0 mt-1">
              <div className={`w-2 h-2 rounded-full ${priorityColors[i] ?? priorityColors[4]}`} />
              <span className="text-[10px] font-bold text-blue-400">P{i + 1}</span>
            </div>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PROBLEMAS — Lista con severidad
// ═══════════════════════════════════════════════════════════════

export function ProblemsList({ items }: { items: string[] }) {
  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 p-4">
      <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        Problemas detectados
      </h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-red-800">
            <span className="text-red-400 shrink-0 mt-0.5">!</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
