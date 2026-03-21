import type { Cliente, Tarea, PerfilGBP } from '@/types'
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
  Star,
  Image as ImageIcon,
  MessageSquare,
  Clock,
  ExternalLink,
  TrendingUp,
  Eye,
  PhoneCall,
  MousePointerClick,
} from 'lucide-react'

interface ClientDetailProps {
  client: Cliente
  tasks: Tarea[]
  profile: PerfilGBP | null
}

const estadoTareaConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  completada: { label: 'Completada', variant: 'success' },
  en_progreso: { label: 'En progreso', variant: 'info' },
  pendiente: { label: 'Pendiente', variant: 'warning' },
  error: { label: 'Error', variant: 'error' },
}

// Métricas mock para cada cliente con perfil
function getMockMetrics(clienteId: string) {
  const metricsMap: Record<string, { views: number; searches: number; calls: number; clicks: number; trend: number }> = {
    '1': { views: 2340, searches: 1870, calls: 45, clicks: 312, trend: 12 },
    '2': { views: 890, searches: 620, calls: 18, clicks: 94, trend: -3 },
    '3': { views: 1120, searches: 780, calls: 22, clicks: 156, trend: 8 },
  }
  return metricsMap[clienteId] ?? null
}

export default function ClientDetail({ client, tasks, profile }: ClientDetailProps) {
  const metrics = getMockMetrics(client.id)

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

      {/* Perfil GBP */}
      <Card title="Perfil Google Business">
        {profile ? (
          <div className="space-y-4">
            {/* Info principal */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h4 className="font-semibold text-primary text-lg">{profile.nombre_gbp}</h4>
                <p className="text-sm text-neutral-500">{profile.categoria}</p>
                {profile.descripcion && (
                  <p className="text-sm text-neutral-600 mt-1 max-w-xl">{profile.descripcion}</p>
                )}
              </div>
              {profile.url_maps && (
                <a
                  href={profile.url_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver en Maps
                </a>
              )}
            </div>

            {/* Stats rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-lg font-bold text-yellow-700">{profile.puntuacion ?? '—'}</span>
                </div>
                <p className="text-xs text-yellow-600">Puntuación</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-lg font-bold text-blue-700">{profile.resenas_count}</span>
                </div>
                <p className="text-xs text-blue-600">Reseñas</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ImageIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-lg font-bold text-purple-700">{profile.fotos_count}</span>
                </div>
                <p className="text-xs text-purple-600">Fotos</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-lg font-bold text-green-700">
                    {profile.horarios ? Object.keys(profile.horarios).length : 0}
                  </span>
                </div>
                <p className="text-xs text-green-600">Días abiertos</p>
              </div>
            </div>

            {/* NAP */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-neutral-700 mb-2">Datos NAP (Name, Address, Phone)</h5>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 w-20 shrink-0">Nombre:</span>
                  <span className="text-neutral-700">{profile.nap_nombre ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 w-20 shrink-0">Dirección:</span>
                  <span className="text-neutral-700">{profile.nap_direccion ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 w-20 shrink-0">Teléfono:</span>
                  <span className="text-neutral-700">{profile.nap_telefono ?? '—'}</span>
                </div>
              </div>
            </div>

            {/* Horarios */}
            {profile.horarios && (
              <div>
                <h5 className="text-sm font-medium text-neutral-700 mb-2">Horarios</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(profile.horarios).map(([dia, horario]) => (
                    <div key={dia} className="flex justify-between text-sm bg-neutral-50 rounded px-3 py-1.5">
                      <span className="capitalize text-neutral-600">{dia}</span>
                      <span className="text-neutral-800 font-medium">{String(horario)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-neutral-400">
              Última actualización: {new Date(profile.updated_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">
              No hay perfil de Google Business vinculado a este cliente.
            </p>
            {!client.pack && (
              <p className="text-xs text-neutral-400 mt-1">
                Asigna un pack para vincular su perfil GBP.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Métricas */}
      <Card title="Métricas (últimos 30 días)">
        {metrics ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-accent" />
                  <span className="text-sm text-neutral-500">Visualizaciones</span>
                </div>
                <p className="text-2xl font-bold text-primary">{metrics.views.toLocaleString('es-ES')}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-neutral-500">Búsquedas</span>
                </div>
                <p className="text-2xl font-bold text-primary">{metrics.searches.toLocaleString('es-ES')}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-neutral-500">Llamadas</span>
                </div>
                <p className="text-2xl font-bold text-primary">{metrics.calls}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-neutral-500">Clics web</span>
                </div>
                <p className="text-2xl font-bold text-primary">{metrics.clicks}</p>
              </div>
            </div>

            {/* Trend */}
            <div className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
              metrics.trend >= 0
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}>
              <TrendingUp className={`w-3.5 h-3.5 ${metrics.trend < 0 ? 'rotate-180' : ''}`} />
              {metrics.trend >= 0 ? '+' : ''}{metrics.trend}% vs mes anterior
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <TrendingUp className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">
              Las métricas estarán disponibles cuando se ejecuten agentes para este cliente.
            </p>
          </div>
        )}
      </Card>

      {/* Tareas recientes */}
      <Card title="Tareas recientes">
        {tasks.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay tareas registradas.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const config = estadoTareaConfig[task.estado] ?? { label: task.estado, variant: 'info' as const }
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
    </div>
  )
}
