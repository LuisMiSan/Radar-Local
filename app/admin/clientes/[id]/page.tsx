import { notFound } from 'next/navigation'
import Header from '@/components/ui/header'
import ClientDetail from '@/components/admin/client-detail'
import { getClientById } from '@/lib/clients'
import { getTasksByClient } from '@/lib/tasks'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: { id: string }
}

export default async function ClienteDetailPage({ params }: PageProps) {
  const client = await getClientById(params.id)

  if (!client) {
    notFound()
  }

  const tasks = await getTasksByClient(client.id)

  return (
    <>
      <Header title={client.nombre} />
      <main className="p-6">
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a clientes
        </Link>
        <ClientDetail client={client} tasks={tasks} />
      </main>
    </>
  )
}
