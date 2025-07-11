import type React from "react"
import { Server, Database, Wifi, Clock } from "lucide-react"
// Hapus import CSS
// import "./SystemInfoCard.css"

interface HealthData {
  server: string
  database: string
  apiResponse: string
  uptime: string
}

interface SystemInfoCardProps {
  healthData?: HealthData
}

const SystemInfoCard: React.FC<SystemInfoCardProps> = ({ healthData }) => {
  const defaultHealthData: HealthData = {
    server: "Healthy",
    database: "Healthy",
    apiResponse: "142ms",
    uptime: "99.9%",
  }

  const data = healthData || defaultHealthData

  // Fungsi helper untuk mendapatkan detail status (warna dan indikator)
  const getStatusDetails = (status: string) => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes("healthy")) {
      return {
        textClass: "text-green-600",
        indicatorClass: "bg-green-500",
      }
    }
    if (lowerStatus.includes("warning")) {
      return {
        textClass: "text-amber-600",
        indicatorClass: "bg-amber-500",
      }
    }
    return {
      textClass: "text-red-600",
      indicatorClass: "bg-red-500",
    }
  }

  // Komponen kecil untuk setiap baris metrik agar tidak berulang
  const MetricRow: React.FC<{
    icon: React.ElementType
    label: string
    value: string
    status?: "Healthy" | "Warning" | "Error" | string
  }> = ({ icon: Icon, label, value, status }) => {
    const statusDetails = status ? getStatusDetails(status) : null
    return (
      <div className="flex items-center justify-between rounded-lg bg-slate-50/80 p-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {statusDetails && (
            <div className={`h-2 w-2 rounded-full ${statusDetails.indicatorClass}`} />
          )}
          <span className={`text-sm font-semibold ${statusDetails ? statusDetails.textClass : 'text-slate-800'}`}>
            {value}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-md backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100/60 text-indigo-600">
          <Server size={22} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">System Health</h3>
      </div>
      <div className="space-y-2">
        <MetricRow icon={Server} label="Server Status" value={data.server} status={data.server} />
        <MetricRow icon={Database} label="Database" value={data.database} status={data.database} />
        <MetricRow icon={Wifi} label="API Response" value={data.apiResponse} />
        <MetricRow icon={Clock} label="Uptime" value={data.uptime} status="Healthy" />
      </div>
    </div>
  )
}

export default SystemInfoCard
