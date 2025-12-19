'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Brain, MessageCircle, Settings, Network, Sparkles } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Cerebro IA', href: '/cerebro', icon: Brain },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 border-r border-primary-700/50 flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-primary-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Boden CRM</h1>
            <p className="text-xs text-primary-200">Panel de Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white text-primary-700 shadow-lg shadow-primary-500/30 transform scale-105'
                  : 'text-primary-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-primary-300 group-hover:text-white'}`} />
              <span className={`font-semibold ${isActive ? 'text-primary-700' : 'text-primary-100'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-primary-700/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/30">
            RA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Raúl Alborta</p>
            <p className="text-xs text-primary-200 truncate">Administrador</p>
          </div>
          <Sparkles className="w-4 h-4 text-primary-300" />
        </div>
      </div>
    </div>
  )
}
