import { notFound } from 'next/navigation'
import Header from '@/components/ui/header'
import ClientDetail from '@/components/admin/client-detail'
import ClientActions from '@/components/admin/client-actions'
import { getClientById } from '@/lib/clients'
import { getTasksByClient } from '@/lib/tasks'
import { getProfileByClient } from '@/lib/profiles'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { generatePortalToken } from '@/lib/portal'

interface PageProps {
  params: { id: string }
}

export default async function ClienteDetailPage({ params }: PageProps) {
  const client = await getClientById(params.id)

  if (!client) {
    notFound()
  }

  const [tasks, profile] = await Promise.all([
    getTasksByClient(client.id),
    getProfileByClient(client.id),
  ])

  const portalToken = generatePortalToken(client.id)

  return (
    <>
      <Header title={client.nombre || client.negocio} />
      <main className="p-6">
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a clientes
        </Link>

        {/* Acciones del cliente (Client Component interactivo) */}
        <div className="mb-6">
          <ClientActions
            clientId={client.id}
            clientName={client.nombre}
            businessName={client.negocio}
            email={client.email}
            portalToken={portalToken}
          />
        </div>

        <ClientDetail client={client} tasks={tasks} profile={profile} />
      </main>
    </>
  )
}
