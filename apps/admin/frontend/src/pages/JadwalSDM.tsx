"use client"

import type React from "react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, Clock, Users, MapPin, Plus, Search, Filter, Edit, Eye } from "lucide-react"
import MetricCard from "../components/Dashboard/MetricCard"
// Hapus import CSS
// import "./DataPages.css"
// import "./JadwalSDM.css"

interface Schedule {
  id: string
  doctorName: string
  specialization: string
  polyclinic: string
  date: string
  startTime: string
  endTime: string
  maxPatients: number
  bookedPatients: number
  status: "Active" | "Inactive"
}

const JadwalSDM: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")

  const mockScheduleData = {
    success: true,
    data: {
      schedules: [
        { id: "1", doctorName: "Dr. Ahmad Wijaya", specialization: "Umum", polyclinic: "Poliklinik Umum", date: new Date().toISOString().split("T")[0], startTime: "08:00", endTime: "16:00", maxPatients: 20, bookedPatients: 15, status: "Active" as const },
        { id: "2", doctorName: "Dr. Sarah Putri, Sp.JP", specialization: "Jantung", polyclinic: "Poliklinik Jantung", date: new Date().toISOString().split("T")[0], startTime: "08:00", endTime: "15:00", maxPatients: 16, bookedPatients: 12, status: "Active" as const },
        { id: "3", doctorName: "Dr. Budi Santoso, Sp.A", specialization: "Anak", polyclinic: "Poliklinik Anak", date: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "16:00", maxPatients: 18, bookedPatients: 10, status: "Active" as const },
        { id: "4", doctorName: "Dr. Rina Melati, Sp.OG", specialization: "Kandungan", polyclinic: "Poliklinik Kandungan", date: new Date().toISOString().split("T")[0], startTime: "10:00", endTime: "17:00", maxPatients: 15, bookedPatients: 15, status: "Inactive" as const },
      ],
      stats: { doctorsOnDuty: 8, totalSlots: 154, utilization: 75, newAppointments: 12 },
    },
  }

  const { data: scheduleData } = useQuery({
    queryKey: ["schedules", selectedDate, viewMode],
    queryFn: async () => mockScheduleData, // Ganti dengan fetch API Anda
    initialData: mockScheduleData,
  })

  const data = scheduleData?.data || mockScheduleData.data

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Jadwal dan SDM</h1>
          <p className="text-slate-500">Kelola jadwal dokter dan sumber daya manusia lainnya.</p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="flex rounded-lg border border-slate-300 bg-white p-1">
            {(["day", "week", "month"] as const).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors capitalize ${viewMode === mode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                {mode === 'day' ? 'Hari' : mode === 'week' ? 'Minggu' : 'Bulan'}
              </button>
            ))}
          </div>
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 md:flex-none">
            <Plus size={18} />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Dokter Bertugas" value={data.stats.doctorsOnDuty} icon={Users} color="blue" description="Hari ini" />
        <MetricCard title="Total Slot Tersedia" value={data.stats.totalSlots} icon={Calendar} color="green" trend="up" trendValue={`+${data.stats.newAppointments}`} />
        <MetricCard title="Utilisasi Jadwal" value={`${data.stats.utilization}%`} icon={Clock} color="purple" description="Slot terisi" />
      </div>

      <div className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="date-picker" className="text-sm font-medium text-slate-700">Pilih Tanggal:</label>
          <input type="date" id="date-picker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-md border-slate-300 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative w-full flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari dokter atau poli..." className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.schedules.map((schedule: Schedule) => (
          <div key={schedule.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{schedule.doctorName}</h3>
                <p className="text-sm text-slate-500">{schedule.specialization}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${schedule.status === 'Active' ? 'bg-green-100/60 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {schedule.status}
              </span>
            </div>

            <div className="mb-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2"><MapPin size={14} /><span>{schedule.polyclinic}</span></div>
              <div className="flex items-center gap-2"><Clock size={14} /><span>{schedule.startTime} - {schedule.endTime}</span></div>
              <div className="flex items-center gap-2"><Users size={14} /><span>{schedule.bookedPatients}/{schedule.maxPatients} Pasien</span></div>
            </div>

            <div className="mb-4 mt-auto">
              <div className="mb-1 h-1.5 w-full rounded-full bg-slate-200">
                <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${(schedule.bookedPatients / schedule.maxPatients) * 100}%` }}></div>
              </div>
              <p className="text-right text-xs font-medium text-slate-500">{Math.round((schedule.bookedPatients / schedule.maxPatients) * 100)}% Terisi</p>
            </div>

            <div className="flex items-center gap-2">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-100/60 px-3 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100">
                <Edit size={14} /> Edit
              </button>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200">
                <Eye size={14} /> Detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default JadwalSDM
