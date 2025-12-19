'use client'

import { Search, Bell, User, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function HeaderBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const hasNotifications = true

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar leads, conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-sm hover:shadow-md"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="relative p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-all duration-200 group"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md ring-2 ring-primary-200">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  )
}
