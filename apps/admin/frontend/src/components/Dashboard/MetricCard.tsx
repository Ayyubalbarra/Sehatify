"use client"

import type React from "react"
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"


type TrendDirection = "up" | "down" | "neutral"
type CardColor = "blue" | "purple" | "red" | "green" | "orange"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: TrendDirection
  trendValue?: string
  color?: CardColor
  icon: LucideIcon
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend = "neutral",
  trendValue,
  color = "blue",
  icon: Icon,
}) => {
  // Objek untuk memetakan warna ke class Tailwind
  const colorVariants = {
    blue: {
      iconBg: "bg-blue-100/60",
      iconText: "text-blue-600",
      gradient: "from-blue-500/10 to-blue-700/10",
    },
    purple: {
      iconBg: "bg-purple-100/60",
      iconText: "text-purple-600",
      gradient: "from-purple-500/10 to-purple-700/10",
    },
    red: {
      iconBg: "bg-red-100/60",
      iconText: "text-red-600",
      gradient: "from-red-500/10 to-red-700/10",
    },
    green: {
      iconBg: "bg-green-100/60",
      iconText: "text-green-600",
      gradient: "from-green-500/10 to-green-700/10",
    },
    orange: {
      iconBg: "bg-orange-100/60",
      iconText: "text-orange-600",
      gradient: "from-orange-500/10 to-orange-700/10",
    },
  }

  // Objek untuk memetakan tren ke ikon dan class Tailwind
  const trendDetails = {
    up: {
      icon: <TrendingUp size={14} />,
      className: "bg-green-100/60 text-green-700",
    },
    down: {
      icon: <TrendingDown size={14} />,
      className: "bg-red-100/60 text-red-700",
    },
    neutral: {
      icon: <Minus size={14} />,
      className: "bg-slate-100 text-slate-700",
    },
  }

  const selectedColor = colorVariants[color]
  const selectedTrend = trendValue ? trendDetails[trend] : null

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${selectedColor.gradient}`}></div>
      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedColor.iconBg} ${selectedColor.iconText}`}>
            <Icon size={22} />
          </div>
          {selectedTrend && (
            <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${selectedTrend.className}`}>
              {selectedTrend.icon}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
          <div className="mb-1 text-2xl font-bold text-slate-800">{value}</div>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      </div>
    </div>
  )
}

export default MetricCard
