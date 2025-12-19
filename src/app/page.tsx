'use client'

import { TrendingUp, MessageSquare, Users, Activity } from 'lucide-react'
import KpiCard from '@/components/kpi/KpiCard'
import SalesFunnel from '@/components/charts/SalesFunnel'

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Título y subtítulo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-0.5">Resumen de actividad del asistente</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="New Leads Today"
          value="12"
          subtitle="vs 9 ayer"
          trend="up"
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="green"
        />
        <KpiCard
          title="Messages Sent"
          value="84"
          subtitle="Últimas 24 horas"
          trend="neutral"
          icon={<MessageSquare className="w-6 h-6" />}
          gradient="blue"
        />
        <KpiCard
          title="Conversion Rate"
          value="3.2%"
          subtitle="vs 2.8% ayer"
          trend="up"
          icon={<Activity className="w-6 h-6" />}
          gradient="purple"
        />
        <KpiCard
          title="Active Conversations"
          value="24"
          subtitle="En tiempo real"
          trend="neutral"
          icon={<Users className="w-6 h-6" />}
          gradient="orange"
        />
      </div>

      {/* Sales Funnel */}
      <SalesFunnel />
    </div>
  )
}
