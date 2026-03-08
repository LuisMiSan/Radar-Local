'use client'

import Sidebar from '@/components/ui/sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      {/* Contenido principal — offset por sidebar */}
      <div className="lg:pl-60 pl-16 transition-all duration-300">
        {children}
      </div>
    </div>
  )
}
