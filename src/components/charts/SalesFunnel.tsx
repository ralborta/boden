'use client'

interface FunnelStage {
  name: string
  value: number
  percentage: number
}

const funnelStages: FunnelStage[] = [
  { name: 'Visitantes', value: 1000, percentage: 100 },
  { name: 'Leads', value: 750, percentage: 75 },
  { name: 'Oportunidades', value: 500, percentage: 50 },
  { name: 'Ventas', value: 150, percentage: 15 },
]

export default function SalesFunnel() {
  return (
    <div className="bg-card-light p-6 rounded-xl border border-border-light shadow-soft">
      <h2 className="text-xl font-semibold text-text-light mb-6">Sales Funnel Stages</h2>
      <div className="flex items-end gap-4 h-64 mb-4">
        {funnelStages.map((stage, index) => {
          const colors = [
            'bg-primary',
            'bg-blue-400',
            'bg-blue-300',
            'bg-blue-200',
          ]
          const color = colors[index] || 'bg-blue-100'
          
          return (
            <div key={stage.name} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full ${color} rounded-t-lg transition-all hover:opacity-80 cursor-pointer`}
                  style={{ height: `${stage.percentage}%` }}
                  title={`${stage.name}: ${stage.value} (${stage.percentage}%)`}
                ></div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-light">{stage.name}</p>
                <p className="text-xs text-subtext-light">{stage.value}</p>
                <p className="text-xs text-subtext-light">{stage.percentage}%</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

