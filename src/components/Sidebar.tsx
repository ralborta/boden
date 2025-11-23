'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Brain, MessageCircle, Settings, Network } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Cerebro IA', href: '/cerebro', icon: Brain },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-border-light flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-light">
        <div className="flex items-center gap-3">
          <Network className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold text-text-light">Boden CRM</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-background-light border-l-4 border-primary text-primary'
                  : 'text-subtext-light hover:bg-background-light hover:text-text-light'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border-light">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            RA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-light truncate">Raúl Alborta</p>
            <p className="text-xs text-subtext-light truncate">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

