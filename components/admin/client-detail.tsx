import type { Cliente, Tarea } from '@/types'
import { EstadoBadge, PackBadge } from '@/components/ui/badge'
import Badge from '@/components/ui/badge'
import Card from '@/components/ui/card'
import { AGENTE_LABELS, type Agente } from '@/types'
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
} from 'lucide-react'

interface ClientDetailProps {
  client: Cliente
  tasks: Tarea[]
}

const estadoTareaConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  completada: { label: 'Completada', variant: 'success' },
  en_progreso: { label: 'En progreso', variant: 'info' },
  pendiente: { label: 'Pendiente', variant: 'warning' },
  error: { label: 'Error', variant: 'error' },
}

export default function ClientDetail({ client, tasks }: ClientDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header info */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-primary">{client.nombre}</h2>
              {client.es_fundador && (
                <span className="text-xs bg-accent/10 text-accent-700 px-2 py-0.5 rounded-full font-medium">
                  Fundador
                </span>
              )}
            </div>
            <p className="text-lg text-neutral-600">{client.negocio}</p>
          </div>
          <div className="flex gap-2">
            <PackBadge pack={client.pack} />
            <EstadoBadge estado={client.estado} />
          </div>
        </div>
      </Card>

      {/* Datos de contacto + Notas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Contacto">
          <div className="space-y-3">
            {client.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-neutral-400" />
                <span>{client.email}</span>
              </div>
            )}
            {client.telefono && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span>{client.telefono}</span>
              </div>
            )}
            {client.direccion && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span>{client.direccion}</span>
              </div>
            )}
            {client.web && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-neutral-400" />
                <a href={client.web} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  {client.web}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>Cliente desde {new Date(client.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </Card>

        <Card title="Notas">
          <p className="text-sm text-neutral-600">
            {client.notas || 'Sin notas.'}
          </p>
        </Card>
      </div>

      {/* Tareas recientes */}
      <Card title="Tareas recientes">
        {tasks.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay tareas registradas.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const config = estadoTareaConfig[task.estado] ?? { label: task.estado, variant: 'default' as const }
              const agenteLabel = AGENTE_LABELS[task.agente as Agente] ?? task.agente
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-primary">{agenteLabel}</p>
                    <p className="text-xs text-neutral-500">{task.tipo.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">
                      {new Date(task.created_at).toLocaleDateString('es-ES')}
                    </span>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Placeholder — Perfil GBP y Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Perfil GBP">
          <p className="text-sm text-neutral-500">
            El perfil de Google Business se mostrará aquí cuando se vincule.
          </p>
        </Card>
        <Card title="Métricas">
          <p className="text-sm text-neutral-500">
            Las métricas del cliente se mostrarán aquí.
          </p>
        </Card>
      </div>
    </div>
  )
}
