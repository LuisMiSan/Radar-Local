import Header from '@/components/ui/header'
import TareasPanel from '@/components/admin/tareas-panel'
import { getClients } from '@/lib/clients'

export default async function TareasPage() {
  const clients = await getClients()

  return (
    <>
      <Header title="Tareas de Ejecución" />
      <main className="p-6">
        <TareasPanel clients={clients} />
      </main>
    </>
  )
}
