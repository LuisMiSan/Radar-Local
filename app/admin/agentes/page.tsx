import Header from '@/components/ui/header'
import AgentesPanel from '@/components/admin/agentes-panel'
import { getClients } from '@/lib/clients'

export default async function AgentesPage() {
  const clients = await getClients()

  return (
    <>
      <Header title="Agentes IA" />
      <main className="p-6">
        <AgentesPanel clients={clients} />
      </main>
    </>
  )
}
