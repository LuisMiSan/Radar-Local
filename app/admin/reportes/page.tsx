import Header from '@/components/ui/header'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import { PackBadge } from '@/components/ui/badge'
import Link from 'next/link'
import { getClients } from '@/lib/clients'
import { getTasksByClient } from '@/lib/tasks'
import { getProfileByClient } from '@/lib/profiles'
import {
  FileText,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  Download,
  ArrowRight,
} from 'lucide-react'

// Mock reportes mensuales
const MOCK_REPORTES = [
  {
    id: 'r1',
    cliente_id: '1',
    mes: '2025-02',
    estado: 'enviado' as const,
    created_at: '2025-03-01T10:00:00Z',
  },
  {
    id: 'r2',
    cliente_id: '1',
    mes: '2025-01',
    estado: 'enviado' as const,
    created_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 'r3',
    cliente_id: '2',
    mes: '2025-02',
    estado: 'borrador' as const,
    created_at: '2025-03-02T09:00:00Z',
  },
]

export default async function ReportesPage() {
  const clients = await getClients()
  const activeClients = clients.filter((c) => c.pack)

  // Obtener tareas y perfiles de clientes activos
  const clientData = await Promise.all(
    activeClients.map(async (client) => {
      const [tasks, profile] = await Promise.all([
        getTasksByClient(client.id),
        getProfileByClient(client.id),
      ])
      const completedTasks = tasks.filter((t) => t.estado === 'completada').length
      const totalTasks = tasks.length
      const reportes = MOCK_REPORTES.filter((r) => r.cliente_id === client.id)
      return { client, tasks, profile, completedTasks, totalTasks, reportes }
    })
  )

  // Estadísticas globales
  const totalReportes = MOCK_REPORTES.length
  const reportesEnviados = MOCK_REPORTES.filter((r) => r.estado === 'enviado').length
  const reportesBorrador = MOCK_REPORTES.filter((r) => r.estado === 'borrador').length

  const stats = [
    { label: 'Total reportes', value: String(totalReportes), icon: FileText, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Enviados', value: String(reportesEnviados), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Borradores', value: String(reportesBorrador), icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Clientes activos', value: String(activeClients.length), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  const mesActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <>
      <Header title="Reportes" />
      <main className="p-6">
        {/* Stats */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen por cliente (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <Card title={`Resumen mensual — ${mesActual}`}>
              {clientData.length === 0 ? (
                <p className="text-sm text-neutral-500">No hay clientes con pack activo.</p>
              ) : (
                <div className="space-y-4">
                  {clientData.map(({ client, profile, completedTasks, totalTasks, reportes }) => {
                    const lastReporte = reportes[0]
                    return (
                      <div
                        key={client.id}
                        className="border border-neutral-100 rounded-lg p-4 hover:border-neutral-200 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Link
                              href={`/admin/clientes/${client.id}`}
                              className="font-semibold text-primary hover:text-accent transition-colors"
                            >
                              {client.negocio}
                            </Link>
                            <p className="text-sm text-neutral-500">{client.nombre}</p>
                          </div>
                          <PackBadge pack={client.pack} />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">{completedTasks}/{totalTasks}</p>
                            <p className="text-xs text-neutral-500">Tareas</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-500" />
                              <p className="text-lg font-bold text-primary">{profile?.puntuacion ?? '—'}</p>
                            </div>
                            <p className="text-xs text-neutral-500">Rating GBP</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">{profile?.resenas_count ?? 0}</p>
                            <p className="text-xs text-neutral-500">Reseñas</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">{profile?.fotos_count ?? 0}</p>
                            <p className="text-xs text-neutral-500">Fotos</p>
                          </div>
                        </div>

                        {lastReporte ? (
                          <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-neutral-400" />
                              <span className="text-sm text-neutral-600">
                                Último reporte: {new Date(lastReporte.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <Badge variant={lastReporte.estado === 'enviado' ? 'success' : 'warning'}>
                              {lastReporte.estado === 'enviado' ? 'Enviado' : 'Borrador'}
                            </Badge>
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-400 italic">Sin reportes generados</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Panel lateral (1/3) */}
          <div className="space-y-6">
            {/* Reportes recientes */}
            <Card title="Historial de reportes">
              {MOCK_REPORTES.length === 0 ? (
                <p className="text-sm text-neutral-500">No hay reportes.</p>
              ) : (
                <div className="space-y-3">
                  {MOCK_REPORTES.map((reporte) => {
                    const client = clients.find((c) => c.id === reporte.cliente_id)
                    return (
                      <div
                        key={reporte.id}
                        className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md ${reporte.estado === 'enviado' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">{client?.negocio ?? 'Desconocido'}</p>
                            <p className="text-xs text-neutral-500">
                              {new Date(reporte.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={reporte.estado === 'enviado' ? 'success' : 'warning'}>
                          {reporte.estado === 'enviado' ? 'Enviado' : 'Borrador'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Acciones */}
            <Card title="Acciones">
              <div className="space-y-3">
                <Link
                  href="/admin/agentes"
                  className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-accent hover:bg-accent/5 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
                      Generar reporte
                    </p>
                    <p className="text-xs text-neutral-500">Usar agente Generador Reporte</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-accent" />
                </Link>

                <button
                  disabled
                  className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 opacity-60 cursor-not-allowed w-full text-left"
                >
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-400">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-400">
                      Exportar PDF
                    </p>
                    <p className="text-xs text-neutral-400">Próximamente</p>
                  </div>
                </button>
              </div>
            </Card>

            {/* Info */}
            <Card>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">Reportes mensuales</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Los reportes se generan automáticamente con el agente &quot;Generador Reporte&quot; y
                    consolidan métricas Map Pack + GEO/AEO de cada cliente.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
