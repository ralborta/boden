'use client'

import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  gradient?: 'purple' | 'blue' | 'green' | 'orange'
}

export default function KpiCard({ 
  title, 
  value, 
  subtitle, 
  trend = 'neutral',
  icon,
  gradient = 'purple'
}: KpiCardProps) {
  const gradients = {
    purple: 'from-primary-500 to-primary-700',
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    orange: 'from-orange-500 to-orange-700',
  }

  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div className="group relative bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[gradient]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Icon */}
      {icon && (
        <div className={`absolute top-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[gradient]} flex items-center justify-center text-white shadow-lg opacity-90`}>
          {icon}
        </div>
      )}

      <div className="relative">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">{title}</h3>
        <p className="text-4xl font-bold text-gray-800 mb-2">{value}</p>
        {subtitle && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${trendColors[trend]}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{subtitle}</span>
          </div>
        )}
      </div>

      {/* Decorative corner */}
      <div className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br ${gradients[gradient]} opacity-5 rounded-tl-full`}></div>
    </div>
  )
}
