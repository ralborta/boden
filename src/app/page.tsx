'use client'

import { Search, Bell, User } from 'lucide-react'

export default function Dashboard() {
  const funnelStages = [
    { name: 'Awareness', value: 100, color: 'bg-primary' },
    { name: 'Interest', value: 75, color: 'bg-blue-400' },
    { name: 'Consideration', value: 50, color: 'bg-blue-300' },
    { name: 'Intent', value: 30, color: 'bg-blue-200' },
    { name: 'Purchase', value: 15, color: 'bg-blue-100' },
  ]

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header Superior */}
      <header className="bg-white border-b border-border-light px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-subtext-light" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-subtext-light hover:text-text-light transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
            <h3 className="text-sm font-medium text-subtext-light mb-2">New Leads Today</h3>
            <p className="text-3xl font-bold text-text-light">12</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
            <h3 className="text-sm font-medium text-subtext-light mb-2">Messages Sent</h3>
            <p className="text-3xl font-bold text-text-light">84</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
            <h3 className="text-sm font-medium text-subtext-light mb-2">Conversion Rate</h3>
            <p className="text-3xl font-bold text-text-light">3.2%</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
            <h3 className="text-sm font-medium text-subtext-light mb-2">Active Conversations</h3>
            <p className="text-3xl font-bold text-text-light">24</p>
          </div>
        </div>

        {/* Sales Funnel Stages */}
        <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm">
          <h2 className="text-xl font-semibold text-text-light mb-6">Sales Funnel Stages</h2>
          <div className="flex items-end gap-4 h-64">
            {funnelStages.map((stage) => (
              <div key={stage.name} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-full">
                  <div
                    className={`w-full ${stage.color} rounded-t-lg transition-all hover:opacity-80`}
                    style={{ height: `${stage.value}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-text-light">{stage.name}</p>
                  <p className="text-xs text-subtext-light">{stage.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

