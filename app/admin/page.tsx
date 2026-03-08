import Header from '@/components/ui/header'
import Card from '@/components/ui/card'
import { Users, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function AdminDashboard() {
  // Placeholder stats — se conectarán a datos reales
  const stats = [
    { label: 'Clientes activos', value: '3', icon: Users, color: 'text-accent' },
    { label: 'Tareas completadas', value: '12', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Tareas pendientes', value: '4', icon: Clock, color: 'text-yellow-600' },
    { label: 'Errores', value: '1', icon: AlertCircle, color: 'text-red-500' },
  ]

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
                  <div className={`p-3 rounded-lg bg-neutral-50 ${stat.color}`}>
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

        {/* Placeholder panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Actividad reciente">
            <p className="text-neutral-500 text-sm">
              Aquí se mostrarán las últimas tareas ejecutadas por los agentes IA.
            </p>
          </Card>
          <Card title="Próximas acciones">
            <p className="text-neutral-500 text-sm">
              Aquí se mostrarán las tareas pendientes y programadas.
            </p>
          </Card>
        </div>
      </main>
    </>
  )
}
