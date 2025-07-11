"use client"

import type React from "react"
import { useState } from "react"
import { Brain, ChevronDown, ChevronUp, AlertTriangle, Info, CheckCircle } from "lucide-react"
// Hapus import CSS
// import "./AIInsightCard.css"

interface Recommendation {
  id: string
  text: string
  priority: "high" | "medium" | "low"
}

interface AIInsightCardProps {
  summary: string
  recommendations: Recommendation[]
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ summary, recommendations }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Fungsi untuk mendapatkan ikon dan warna berdasarkan prioritas
  const getPriorityDetails = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return {
          icon: <AlertTriangle size={16} />,
          className: "bg-red-100/50 text-red-600",
        }
      case "medium":
        return {
          icon: <Info size={16} />,
          className: "bg-amber-100/50 text-amber-600",
        }
      case "low":
        return {
          icon: <CheckCircle size={16} />,
          className: "bg-green-100/50 text-green-600",
        }
      default:
        return {
          icon: <Info size={16} />,
          className: "bg-slate-100 text-slate-600",
        }
    }
  }

  return (
    <div className="rounded-xl border border-purple-500/10 bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-5 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-purple-500/10">
      {/* Header Kartu */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-purple-500" size={24} />
          <h3 className="text-base font-semibold text-slate-800">AI Insight</h3>
        </div>
        <button
          className="flex items-center gap-1 rounded-md bg-purple-100/50 px-2.5 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-100"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Lihat Rekomendasi</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Konten Kartu */}
      <div>
        <div className="mb-3 rounded-lg border border-white/30 bg-white/80 p-3">
          <p className="m-0 text-sm leading-relaxed text-slate-700">{summary}</p>
        </div>

        {isExpanded && (
          <div className="animate-slideDown">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-800">
              Saran Hari Ini:
            </h4>
            <div className="flex flex-col gap-1.5">
              {recommendations.map((rec) => {
                const priority = getPriorityDetails(rec.priority)
                return (
                  <div
                    key={rec.id}
                    className="flex items-center gap-2 rounded-md border border-white/30 bg-white/80 p-2 transition-all hover:translate-x-0.5 hover:bg-white/90"
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded ${priority.className}`}
                    >
                      {priority.icon}
                    </div>
                    <span className="text-sm leading-tight text-slate-700">{rec.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIInsightCard
