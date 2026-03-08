import { type EstadoCliente, type Pack } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent'
  className?: string
}

const variantClasses: Record<string, string> = {
  default: 'bg-neutral-100 text-neutral-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  accent: 'bg-accent/10 text-accent-700',
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Badges específicos para estado y pack
export function EstadoBadge({ estado }: { estado: EstadoCliente }) {
  const config: Record<EstadoCliente, { label: string; variant: BadgeProps['variant'] }> = {
    activo: { label: 'Activo', variant: 'success' },
    inactivo: { label: 'Inactivo', variant: 'error' },
    pausado: { label: 'Pausado', variant: 'warning' },
  }
  const { label, variant } = config[estado]
  return <Badge variant={variant}>{label}</Badge>
}

export function PackBadge({ pack }: { pack: Pack | null }) {
  if (!pack) return <Badge variant="default">Sin pack</Badge>
  const config: Record<Pack, { label: string; variant: BadgeProps['variant'] }> = {
    visibilidad_local: { label: 'Visibilidad Local', variant: 'info' },
    autoridad_maps_ia: { label: 'Autoridad Maps + IA', variant: 'accent' },
  }
  const { label, variant } = config[pack]
  return <Badge variant={variant}>{label}</Badge>
}
