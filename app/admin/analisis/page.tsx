import Header from '@/components/ui/header'
import AnalisisPanel from '@/components/admin/analisis-panel'
import { getClients } from '@/lib/clients'

export const dynamic = 'force-dynamic'

export default async function AnalisisPage() {
  const clients = await getClients()

  return (
    <>
      <Header title="Análisis Completo" />
      <main className="p-6">
        <AnalisisPanel clients={clients} />
      </main>
    </>
  )
}
