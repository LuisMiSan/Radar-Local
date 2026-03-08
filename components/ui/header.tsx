'use client'

import { Menu } from 'lucide-react'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-6 gap-4">
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden text-neutral-600 hover:text-primary"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      <h1 className="text-lg font-semibold text-primary">{title}</h1>
    </header>
  )
}
