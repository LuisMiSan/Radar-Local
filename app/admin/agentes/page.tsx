import Header from '@/components/ui/header'
import AgentesPanel from '@/components/admin/agentes-panel'
import { getClients } from '@/lib/clients'
import { getResumenPorAgente } from '@/lib/gastos'

export default async function AgentesPage() {
  const [clients, resumen] = await Promise.all([
    getClients(),
    getResumenPorAgente(),
  ])

  const statsByAgent: Record<string, {
    total_llamadas: number
    coste_total: number
    ultima_ejecucion?: string | null
  }> = {}
  for (const r of resumen) {
    statsByAgent[r.agente] = {
      total_llamadas: r.total_llamadas,
      coste_total: r.coste_total,
      ultima_ejecucion: r.ultima_ejecucion,
    }
  }

  return (
    <>
      <Header title="Agentes IA" />
      <main className="p-6 h-[calc(100vh-65px)] overflow-hidden">
        <AgentesPanel clients={clients} statsByAgent={statsByAgent} />
      </main>
    </>
  )
}
