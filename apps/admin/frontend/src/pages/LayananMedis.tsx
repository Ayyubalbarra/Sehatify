// apps/admin/frontend/src/pages/LayananMedis.tsx

"use client"

import type React from "react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Eye, Edit, Stethoscope, Calendar, Clock, Loader2, Search, Filter } from "lucide-react"
import MetricCard from "../components/Dashboard/MetricCard"
import DataTable from "../components/DataTable/DataTable"
import { polyclinicAPI } from "../services/api"
import type { PolyclinicData, PolyclinicsApiResponse } from "../types"
// Sesuaikan interface MedicalService agar cocok dengan PolyclinicData dari API
interface MedicalService extends PolyclinicData {
  doctor?: string; // Nama dokter PJ (Primary Doctor/PIC)
  operatingHoursDisplay?: string; // Format jam operasional untuk tampilan
  price?: number; // Jika ada field harga di model Polyclinic atau dihitung
  // polyclinicId sudah ada dari PolyclinicData, tidak perlu dideklarasikan ulang di sini
}

const LayananMedis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all") // 'all' atau nama department (dari Polyclinic.name)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10; // Sesuaikan dengan limit default di backend

  // Query untuk mendapatkan data Poliklinik dari API
  const { data: polyclinicsResponse, isLoading } = useQuery<PolyclinicsApiResponse>({
    queryKey: ["medical-services", currentPage, searchTerm, filterDepartment, pageSize],
    queryFn: () => polyclinicAPI.getAllPolyclinics(currentPage, pageSize, searchTerm, filterDepartment === "all" ? "" : filterDepartment),
  })

  // Data yang akan ditampilkan di DataTable
  const data = polyclinicsResponse?.data || [];
  const pagination = polyclinicsResponse?.pagination || { currentPage: 1, totalPages: 1, total: 0 };

  // Data statistik (sementara mock atau perlu endpoint baru di backend)
  // Anda mungkin perlu endpoint API terpisah untuk mendapatkan statistik ini.
  // Contoh: polyclinicAPI.getPolyclinicStats()
  const stats = {
    totalServices: pagination.total, // Total layanan adalah total poliklinik
    activeToday: 0, // Ini perlu dihitung dari backend (misal: jumlah jadwal aktif hari ini)
    averageWaitTime: 0, // Ini perlu dihitung dari backend (misal: dari data antrean)
  };

  // Transformasi data Poliklinik dari backend agar sesuai dengan MedicalService
  const transformedServices: MedicalService[] = data.map(poly => ({
    ...poly, // <-- PERBAIKAN: Sertakan semua properti dari `poly`
    // Kemudian override atau tambahkan properti khusus MedicalService
    doctor: poly.assignedDoctors && poly.assignedDoctors.length > 0 && 
            (poly.assignedDoctors[0].doctorId as any)?.name 
              ? (poly.assignedDoctors[0].doctorId as any).name
              : "Belum Ditentukan",
    // PERBAIKAN: Pastikan operatingHoursDisplay selalu menghasilkan string yang diformat
    operatingHoursDisplay: poly.operatingHours?.monday?.isOpen 
                           ? `${poly.operatingHours.monday.start} - ${poly.operatingHours.monday.end}` 
                           : "N/A", 
    price: (poly as any).price || 0, // Cast to any untuk mengakses price jika tidak ada di PolyclinicData resmi
  }));

  const columns = [
    { key: "name", label: "Layanan", render: (service: MedicalService) => (
        <div>
          <div className="font-semibold text-slate-800">{service.name}</div>
          <div className="text-xs text-slate-500">{service.department}</div>
        </div>
      ),
    },
    { key: "doctor", label: "Dokter PJ", render: (service: MedicalService) => <span className="text-sm text-slate-600">{service.doctor || "N/A"}</span> },
    { 
      key: "operatingHoursDisplay", 
      label: "Jam Operasional", 
      // PERBAIKAN: Hanya render operatingHoursDisplay yang sudah string
      render: (service: MedicalService) => <span className="text-sm text-slate-600">{service.operatingHoursDisplay || "N/A"}</span> 
    },
    { key: "price", label: "Tarif", render: (service: MedicalService) => <span className="font-semibold text-slate-800">Rp {service.price ? service.price.toLocaleString("id-ID") : "N/A"}</span> },
    { key: "status", label: "Status", render: (service: MedicalService) => (
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${service.status === 'Active' ? 'bg-green-100/60 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{service.status}</span>
      ),
    },
    { key: "actions", label: "Aksi", render: (service: MedicalService) => (
        <div className="flex items-center gap-1">
          <button className="h-8 w-8 rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><Eye size={16} className="mx-auto" /></button>
          <button className="h-8 w-8 rounded-md text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"><Edit size={16} className="mx-auto" /></button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <div className="flex h-full items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Manajemen Layanan Medis</h1>
          <p className="text-slate-500">Kelola semua layanan dan poliklinik yang tersedia di rumah sakit.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
          <Plus size={18} />
          Tambah Layanan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total Layanan Aktif" value={stats.totalServices} icon={Stethoscope} color="blue" />
        <MetricCard title="Jadwal Hari Ini" value={stats.activeToday} icon={Calendar} color="green" />
        <MetricCard title="Rata-rata Waktu Tunggu" value={`${stats.averageWaitTime} mnt`} icon={Clock} color="purple" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Daftar Layanan</h2>
            <div className="flex items-center gap-2">
                <div className="relative w-full md:w-64">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari layanan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Filter size={16} />
                    <span>Filter</span>
                </button>
            </div>
        </div>
        <DataTable
          columns={columns}
          data={transformedServices}
          loading={isLoading}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            onPageChange: setCurrentPage,
          }}
        />
      </div>
    </div>
  )
}

export default LayananMedis