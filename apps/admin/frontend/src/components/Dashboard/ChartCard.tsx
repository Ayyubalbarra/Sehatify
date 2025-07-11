"use client"

import type React from "react"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { ExternalLink } from "lucide-react"
// Hapus import CSS
// import "./ChartCard.css"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface ChartCardProps {
  title: string
  type: "line" | "bar"
  data: any
  showViewReport?: boolean
  onViewReport?: () => void
}

const ChartCard: React.FC<ChartCardProps> = ({ title, type, data, showViewReport = false, onViewReport }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1e293b",
        bodyColor: "#64748b",
        borderColor: "rgba(226, 232, 240, 0.5)",
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
          },
        },
      },
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        backgroundColor: "#ffffff",
        borderWidth: 3,
      },
      line: {
        tension: 0.4,
      },
      bar: {
        borderRadius: 6,
        borderSkipped: false,
      },
    },
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-slate-500/10">
      {/* Header Kartu */}
      <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {showViewReport && (
          <button
            className="flex items-center gap-1 rounded-md bg-blue-100/50 px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
            onClick={onViewReport}
          >
            <span>View Report</span>
            <ExternalLink size={14} />
          </button>
        )}
      </div>

      {/* Kontainer Chart */}
      <div className="relative h-[200px] md:h-[250px]">
        {type === "line" ? <Line data={data} options={chartOptions} /> : <Bar data={data} options={chartOptions} />}
      </div>
    </div>
  )
}

export default ChartCard
