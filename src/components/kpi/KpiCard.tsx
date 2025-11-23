'use client'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
}

export default function KpiCard({ title, value, subtitle, trend = 'neutral' }: KpiCardProps) {
  return (
    <div className="bg-card-light p-6 rounded-xl border border-border-light shadow-soft hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-subtext-light mb-2">{title}</h3>
      <p className="text-3xl font-bold text-text-light mb-1">{value}</p>
      {subtitle && (
        <p className={`text-xs ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          'text-subtext-light'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

