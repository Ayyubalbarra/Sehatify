"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { Zap, UserPlus, Package, Calendar, BarChart3, Database, Loader2 } from "lucide-react"
// Hapus import CSS
// import "./QuickActionsCard.css"

interface QuickActionsCardProps {
  onSeedDatabase: () => void
  isSeeding: boolean
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ onSeedDatabase, isSeeding }) => {
  const quickActions = [
    { icon: UserPlus, label: "Tambah Pasien", link: "/data-pasien" },
    { icon: Package, label: "Cek Stok", link: "/stok-medis" },
    { icon: Calendar, label: "Jadwal Dokter", link: "/jadwal-sdm" },
    { icon: BarChart3, label: "Lihat Laporan", link: "/laporan-analisis" },
  ]

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-md backdrop-blur-xl">
      {/* Header Kartu */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100/60 text-emerald-600">
          <Zap size={22} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Aksi Cepat</h3>
      </div>

      {/* Grid Tombol Aksi */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="flex flex-col items-center gap-2 rounded-lg bg-slate-50/80 p-4 text-center transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/60 text-blue-600">
              <action.icon size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-700">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Bagian Seed Database */}
      <div className="border-t border-slate-200/80 pt-5">
        <p className="mb-3 text-sm leading-relaxed text-slate-600">
          Untuk keperluan demo, Anda dapat mengisi database dengan data sampel.
        </p>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
          onClick={onSeedDatabase}
          disabled={isSeeding}
        >
          {isSeeding ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Mengisi Database...</span>
            </>
          ) : (
            <>
              <Database size={16} />
              <span>Seed Database</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default QuickActionsCard
