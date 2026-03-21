import Header from '@/components/ui/header'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import Link from 'next/link'
import { getClients } from '@/lib/clients'
import { getTasksByClient } from '@/lib/tasks'
import { AGENTE_LABELS, type Agente } from '@/types'
import {
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Bot,
  ArrowRight,
  TrendingUp,
  Zap,
} from 'lucide-react'

export default async function AdminDashboard() {
  const clients = await getClients()

  // Agregar todas las tareas de todos los clientes
  const allTasks = (
    await Promise.all(clients.map((c) => getTasksByClient(c.id)))
  ).flat()

  const activeClients = clients.filter((c) => c.estado === 'activo').length
  const completedTasks = allTasks.filter((t) => t.estado === 'completada').length
  const pendingTasks = allTasks.filter(
    (t) => t.estado === 'pendiente' || t.estado === 'en_progreso'
  ).length
  const errorTasks = allTasks.filter((t) => t.estado === 'error').length

  // Ordenar tareas por fecha (recientes primero)
  const recentTasks = [...allTasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // Clientes sin pack (leads)
  const leads = clients.filter((c) => !c.pack)

  const stats = [
    { label: 'Clientes activos', value: String(activeClients), icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Tareas completadas', value: String(completedTasks), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Tareas pendientes', value: String(pendingTasks), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Errores', value: String(errorTasks), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ]

  const estadoConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
    completada: { label: 'Completada', variant: 'success' },
    en_progreso: { label: 'En progreso', variant: 'info' },
    pendiente: { label: 'Pendiente', variant: 'warning' },
    error: { label: 'Error', variant: 'error' },
  }

  return (
    <>
      <Header title="Dashboard" />
      <main className="p-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actividad reciente (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Actividad reciente">
              {recentTasks.length === 0 ? (
                <p className="text-neutral-500 text-sm">No hay tareas registradas.</p>
              ) : (
                <div className="space-y-1">
                  {recentTasks.map((task) => {
                    const config = estadoConfig[task.estado]
                    const agenteLabel = AGENTE_LABELS[task.agente as Agente] ?? task.agente
                    const client = clients.find((c) => c.id === task.cliente_id)
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between py-3 border-b border-neutral-50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md ${config?.variant === 'success' ? 'bg-green-50 text-green-600' : config?.variant === 'error' ? 'bg-red-50 text-red-500' : config?.variant === 'info' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">{agenteLabel}</p>
                            <p className="text-xs text-neutral-500">
                              {client?.negocio ?? 'Cliente desconocido'} &middot;{' '}
                              {new Date(task.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={config?.variant ?? 'info'}>
                          {config?.label ?? task.estado}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Acciones rápidas */}
            <Card title="Acciones rápidas">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/admin/agentes"
                  className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-accent hover:bg-accent/5 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
                      Ejecutar agentes
                    </p>
                    <p className="text-xs text-neutral-500">11 agentes disponibles</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-accent transition-colors" />
                </Link>

                <Link
                  href="/admin/clientes"
                  className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-accent hover:bg-accent/5 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
                      Ver clientes
                    </p>
                    <p className="text-xs text-neutral-500">{clients.length} clientes</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-accent transition-colors" />
                </Link>

                <Link
                  href="/admin/reportes"
                  className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-accent hover:bg-accent/5 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
                      Reportes
                    </p>
                    <p className="text-xs text-neutral-500">Informes mensuales</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-accent transition-colors" />
                </Link>

                <Link
                  href="/"
                  className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-accent hover:bg-accent/5 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
                      Landing pública
                    </p>
                    <p className="text-xs text-neutral-500">Ver como cliente</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-accent transition-colors" />
                </Link>
              </div>
            </Card>
          </div>

          {/* Sidebar derecha (1/3) */}
          <div className="space-y-6">
            {/* Leads */}
            <Card title="Leads pendientes">
              {leads.length === 0 ? (
                <p className="text-sm text-neutral-500">No hay leads pendientes.</p>
              ) : (
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/clientes/${lead.id}`}
                      className="block p-3 rounded-lg bg-neutral-50 hover:bg-accent/5 transition-colors"
                    >
                      <p className="text-sm font-medium text-primary">{lead.nombre}</p>
                      <p className="text-xs text-neutral-500">{lead.negocio}</p>
                      {lead.notas && (
                        <p className="text-xs text-neutral-400 mt-1 italic">{lead.notas}</p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Resumen de packs */}
            <Card title="Distribución de packs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Autoridad Maps + IA</span>
                  <span className="text-sm font-bold text-primary">
                    {clients.filter((c) => c.pack === 'autoridad_maps_ia').length}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div
                    className="bg-accent rounded-full h-2 transition-all"
                    style={{
                      width: `${(clients.filter((c) => c.pack === 'autoridad_maps_ia').length / Math.max(clients.length, 1)) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Visibilidad Local</span>
                  <span className="text-sm font-bold text-primary">
                    {clients.filter((c) => c.pack === 'visibilidad_local').length}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2 transition-all"
                    style={{
                      width: `${(clients.filter((c) => c.pack === 'visibilidad_local').length / Math.max(clients.length, 1)) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Sin pack (leads)</span>
                  <span className="text-sm font-bold text-neutral-400">
                    {clients.filter((c) => !c.pack).length}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div
                    className="bg-neutral-300 rounded-full h-2 transition-all"
                    style={{
                      width: `${(clients.filter((c) => !c.pack).length / Math.max(clients.length, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
