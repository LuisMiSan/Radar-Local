import Header from '@/components/ui/header'
import Card from '@/components/ui/card'
import ClientList from '@/components/admin/client-list'
import { getClients } from '@/lib/clients'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const clients = await getClients()

  return (
    <>
      <Header title="Clientes" />
      <main className="p-6">
        <Card>
          <ClientList clients={clients} />
        </Card>
      </main>
    </>
  )
}
