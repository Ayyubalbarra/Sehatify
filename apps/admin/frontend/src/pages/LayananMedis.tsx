"use client"

import type React from "react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Eye, Edit, Stethoscope, Calendar, Clock, Loader2, Search, Filter } from "lucide-react"
import MetricCard from "../components/Dashboard/MetricCard.tsx"
import DataTable from "../components/DataTable/DataTable.tsx"

interface MedicalService {
  _id: string;
  serviceId: string;
  name: string;
  department: string;
  doctor: string;
  operatingHours: string;
  location: string;
  status: "Active" | "Inactive";
  price: number;
}

const mockServicesData = {
  success: true,
  data: {
    services: [
      { _id: "1", serviceId: "SVC001", name: "Poliklinik Umum", department: "Umum", doctor: "Dr. Ahmad Wijaya", operatingHours: "08:00 - 16:00", location: "Gedung A, Lt. 1", status: "Active" as const, price: 50000 },
      { _id: "2", serviceId: "SVC002", name: "Poliklinik Jantung", department: "Spesialis", doctor: "Dr. Sarah Putri, Sp.JP", operatingHours: "08:00 - 15:00", location: "Gedung B, Lt. 2", status: "Active" as const, price: 150000 },
      { _id: "3", serviceId: "SVC003", name: "Poliklinik Anak", department: "Spesialis", doctor: "Dr. Budi Santoso, Sp.A", operatingHours: "08:00 - 16:00", location: "Gedung A, Lt. 2", status: "Inactive" as const, price: 100000 },
    ],
    stats: { totalServices: 8, activeToday: 12, averageWaitTime: 20 },
    pagination: { currentPage: 1, totalPages: 1, totalItems: 3 },
  },
}

const LayananMedis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["medical-services", currentPage, searchTerm, filterDepartment],
    queryFn: async () => mockServicesData, // Ganti dengan fetch API Anda
    initialData: mockServicesData,
  })

  const data = servicesData?.data || mockServicesData.data
  const stats = data.stats

  const columns = [
    { key: "name", label: "Layanan", render: (service: MedicalService) => (
        <div>
          <div className="font-semibold text-slate-800">{service.name}</div>
          <div className="text-xs text-slate-500">{service.department}</div>
        </div>
      ),
    },
    { key: "doctor", label: "Dokter PJ", render: (service: MedicalService) => <span className="text-sm text-slate-600">{service.doctor}</span> },
    { key: "operatingHours", label: "Jam Operasional", render: (service: MedicalService) => <span className="text-sm text-slate-600">{service.operatingHours}</span> },
    { key: "price", label: "Tarif", render: (service: MedicalService) => <span className="font-semibold text-slate-800">Rp {service.price.toLocaleString("id-ID")}</span> },
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
          data={data.services}
          loading={isLoading}
          pagination={{
            currentPage: data.pagination.currentPage,
            totalPages: data.pagination.totalPages,
            totalItems: data.pagination.totalItems,
            onPageChange: setCurrentPage,
          }}
        />
      </div>
    </div>
  )
}

export default LayananMedis
