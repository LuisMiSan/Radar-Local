'use client'

import Link from 'next/link'
import type { Cliente } from '@/types'
import { EstadoBadge, PackBadge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'

interface ClientListProps {
  clients: Cliente[]
}

export default function ClientList({ clients }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p className="text-lg">No hay clientes todavía</p>
        <p className="text-sm mt-1">Los clientes aparecerán aquí cuando se añadan.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Nombre</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Negocio</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500 hidden md:table-cell">Pack</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500 hidden sm:table-cell">Estado</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500 hidden lg:table-cell">Alta</th>
            <th className="py-3 px-4"><span className="sr-only">Ver</span></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
            >
              <td className="py-3 px-4">
                <Link href={`/admin/clientes/${client.id}`} className="font-medium text-primary hover:text-accent transition-colors">
                  {client.nombre || client.negocio || 'Sin nombre'}
                </Link>
                {client.nombre && client.negocio && (
                  <p className="text-xs text-neutral-400">{client.negocio}</p>
                )}
                {client.es_fundador && (
                  <span className="ml-2 text-xs text-accent font-medium">Fundador</span>
                )}
              </td>
              <td className="py-3 px-4 text-sm text-neutral-600">{client.negocio}</td>
              <td className="py-3 px-4 hidden md:table-cell">
                <PackBadge pack={client.pack} />
              </td>
              <td className="py-3 px-4 hidden sm:table-cell">
                <EstadoBadge estado={client.estado} />
              </td>
              <td className="py-3 px-4 text-sm text-neutral-500 hidden lg:table-cell">
                {new Date(client.created_at).toLocaleDateString('es-ES')}
              </td>
              <td className="py-3 px-4 text-right">
                <Link href={`/admin/clientes/${client.id}`} className="text-neutral-400 hover:text-primary">
                  <ChevronRight className="w-4 h-4 inline" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
