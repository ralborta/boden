'use client'

import KpiCard from '@/components/kpi/KpiCard'
import SalesFunnel from '@/components/charts/SalesFunnel'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background-light">
      {/* Título y subtítulo */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-light mb-2">Dashboard</h1>
        <p className="text-subtext-light">Resumen de actividad del asistente</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="New Leads Today"
          value="12"
          subtitle="vs 9 ayer"
          trend="up"
        />
        <KpiCard
          title="Messages Sent"
          value="84"
          subtitle="Últimas 24 horas"
          trend="neutral"
        />
        <KpiCard
          title="Conversion Rate"
          value="3.2%"
          subtitle="vs 2.8% ayer"
          trend="up"
        />
        <KpiCard
          title="Active Conversations"
          value="24"
          subtitle="En tiempo real"
          trend="neutral"
        />
      </div>

      {/* Sales Funnel */}
      <SalesFunnel />
    </div>
  )
}
