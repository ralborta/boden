'use client'

import { TrendingUp, Users, Target, ShoppingCart } from 'lucide-react'

interface FunnelStage {
  name: string
  value: number
  percentage: number
  icon: React.ReactNode
  color: string
  gradient: string
}

const funnelStages: FunnelStage[] = [
  { 
    name: 'Visitantes', 
    value: 1000, 
    percentage: 100,
    icon: <Users className="w-5 h-5" />,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    name: 'Leads', 
    value: 750, 
    percentage: 75,
    icon: <Target className="w-5 h-5" />,
    color: 'bg-primary-500',
    gradient: 'from-primary-500 to-primary-600'
  },
  { 
    name: 'Oportunidades', 
    value: 500, 
    percentage: 50,
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600'
  },
  { 
    name: 'Ventas', 
    value: 150, 
    percentage: 15,
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-600'
  },
]

export default function SalesFunnel() {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales Funnel Stages</h2>
          <p className="text-sm text-gray-500">Análisis de conversión por etapa</p>
        </div>
      </div>
      
      <div className="flex items-end gap-6 h-72 mb-6">
        {funnelStages.map((stage, index) => {
          return (
            <div key={stage.name} className="flex-1 flex flex-col items-center gap-4 group">
              <div className="w-full flex flex-col items-center justify-end h-full relative">
                {/* Bar */}
                <div
                  className={`w-full bg-gradient-to-t ${stage.gradient} rounded-t-2xl transition-all duration-500 hover:opacity-90 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden`}
                  style={{ height: `${stage.percentage}%` }}
                  title={`${stage.name}: ${stage.value} (${stage.percentage}%)`}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                  
                  {/* Icon */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-white opacity-90">
                    {stage.icon}
                  </div>
                </div>
              </div>
              
              {/* Info */}
              <div className="text-center w-full">
                <p className="text-sm font-bold text-gray-800 mb-1">{stage.name}</p>
                <p className="text-lg font-semibold text-gray-700 mb-0.5">{stage.value.toLocaleString()}</p>
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${stage.gradient} text-white shadow-sm`}>
                  {stage.percentage}%
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 pt-6 border-t border-gray-200">
        {funnelStages.map((stage, index) => {
          const prevStage = index > 0 ? funnelStages[index - 1] : null
          const conversionRate = prevStage 
            ? ((stage.value / prevStage.value) * 100).toFixed(1)
            : '100'
          
          return (
            <div key={stage.name} className="text-center">
              <p className="text-xs text-gray-500 mb-1">
                {prevStage ? `Conversión desde ${prevStage.name}` : 'Inicio'}
              </p>
              <p className="text-lg font-bold text-gray-800">{conversionRate}%</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
