'use client'

import { Search, Bell, User } from 'lucide-react'
import { useState } from 'react'

export default function HeaderBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const hasNotifications = true // Hardcodeado por ahora

  return (
    <header className="bg-card-light border-b border-border-light px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-subtext-light" />
            <input
              type="text"
              placeholder="Buscar leads, conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-border-light bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="relative p-2 text-subtext-light hover:text-text-light transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="w-6 h-6" />
            {hasNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white cursor-pointer hover:bg-primary/90 transition-colors">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  )
}

