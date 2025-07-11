"use client"

import type React from "react"
import { useState } from "react"
import { BarChart3, TrendingUp, Download, Calendar, Filter } from "lucide-react"
import MetricCard from "../components/Dashboard/MetricCard.tsx"
import ChartCard from "../components/Dashboard/ChartCard.tsx"
// Hapus import CSS yang menyebabkan error
// import "./DataPages.css"

const LaporanAnalisis: React.FC = () => {
  const [dateRange, setDateRange] = useState("30d")
  const [reportType, setReportType] = useState("overview")

  const reportTypes = [
    { key: "overview", label: "Overview" },
    { key: "patients", label: "Pasien" },
    { key: "services", label: "Layanan" },
    { key: "inventory", label: "Inventaris" },
    { key: "financial", label: "Keuangan" },
  ]

  const dateRanges = [
    { key: "7d", label: "7 Hari Terakhir" },
    { key: "30d", label: "30 Hari Terakhir" },
    { key: "90d", label: "3 Bulan Terakhir" },
    { key: "1y", label: "1 Tahun Terakhir" },
  ]

  // Mock data untuk chart
  const lineChartData = {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [{ label: "Kunjungan", data: [165, 189, 180, 181, 156, 155, 140], borderColor: "#3B82F6", backgroundColor: "rgba(59, 130, 246, 0.1)", fill: true, tension: 0.4 }],
  }
  const barChartData = {
    labels: ["Umum", "Jantung", "Anak", "Mata", "Gigi"],
    datasets: [{ label: "Jumlah Pasien", data: [45, 28, 32, 15, 22], backgroundColor: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"], borderRadius: 4 }],
  }
  
  const summaryData = [
      {label: "Total Pendapatan", value: "Rp 2,450,000,000", change: "+12.5%", changeColor: "text-green-600"},
      {label: "Biaya Operasional", value: "Rp 1,850,000,000", change: "+5.2%", changeColor: "text-red-600"},
      {label: "Profit Margin", value: "24.5%", change: "+2.1%", changeColor: "text-green-600"},
      {label: "Kepuasan Pasien", value: "4.2/5.0", change: "+0.3", changeColor: "text-green-600"},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Laporan dan Analisis</h1>
          <p className="text-slate-500">Hasilkan dan unduh laporan penting untuk manajemen rumah sakit.</p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 md:w-auto">
                <Download size={16} />
                Export PDF
            </button>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 md:w-auto">
                <BarChart3 size={16} />
                Buat Laporan
            </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="flex w-full items-center gap-2 md:w-auto">
          <label className="flex-shrink-0 text-sm font-medium text-slate-700">Tipe:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
            {reportTypes.map((type) => (<option key={type.key} value={type.key}>{type.label}</option>))}
          </select>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <label className="flex-shrink-0 text-sm font-medium text-slate-700">Periode:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
            {dateRanges.map((range) => (<option key={range.key} value={range.key}>{range.label}</option>))}
          </select>
        </div>
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 md:w-auto">
          <Filter size={16} />
          <span>Filter Lanjutan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total Kunjungan" value="1,247" icon={TrendingUp} color="blue" trend="up" trendValue="+15.3%" />
        <MetricCard title="Rata-rata Harian" value="178" icon={Calendar} color="green" trend="up" trendValue="+8.2%" />
        <MetricCard title="Tingkat Okupansi" value="82%" icon={BarChart3} color="purple" trend="up" trendValue="+3.1%" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Tren Kunjungan Pasien" type="line" data={lineChartData} />
        <ChartCard title="Distribusi Layanan" type="bar" data={barChartData} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Detail Laporan Keuangan</h3>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                <Download size={14} />
                Export Excel
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {summaryData.map(item => (
                <div key={item.label} className="p-4 border-b md:border-b-0 md:border-r border-slate-100 last:border-0">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="text-xl font-bold text-slate-800">{item.value}</p>
                    <p className={`text-sm font-semibold ${item.changeColor}`}>{item.change}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default LaporanAnalisis
