"use client"

import type React from "react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Filter, Eye, Edit, Trash2, Users, UserPlus, Activity, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import MetricCard from "../components/Dashboard/MetricCard"
import DataTable from "../components/DataTable/DataTable"
import PatientModal from "../components/Modals/PatientModal"
import type { PatientFormData } from "../components/Modals/PatientModal"
// Hapus import CSS
// import "./DataPages.css"

interface Patient extends PatientFormData {
  _id: string
  lastVisit?: string
  lifetimeValue?: number
  status: "Active" | "Inactive"
}

interface PatientStats {
  total: number
  byGender: { male: number; female: number }
  trend: string
  newThisWeek: number
}

interface PatientsApiResponse {
  success: boolean
  data: {
    patients: Patient[]
    stats: PatientStats
    pagination: { currentPage: number; totalPages: number; totalItems: number }
  }
}

const mockPatientsData: PatientsApiResponse = {
  success: true,
  data: {
    patients: [
      { _id: "1", patientId: "P001", name: "Rina Singh", nik: "3201234567890123", dateOfBirth: "1990-05-15", gender: "Perempuan", phone: "081234567890", email: "rina@gmail.com", address: { street: "Jl. Merdeka No. 123", city: "Jakarta", province: "DKI Jakarta", postalCode: "12345" }, bloodType: "A+", allergies: [], emergencyContact: { name: "John Singh", relationship: "Suami", phone: "081234567891" }, lastVisit: "2024-01-15", lifetimeValue: 1200000, status: "Active" },
      { _id: "2", patientId: "P002", name: "Michael Thompson", nik: "3201234567890124", dateOfBirth: "1985-08-22", gender: "Laki-laki", phone: "081234567892", email: "michael@gmail.com", address: { street: "Jl. Sudirman No. 456", city: "Jakarta", province: "DKI Jakarta", postalCode: "12346" }, bloodType: "B+", allergies: ["Penicillin"], emergencyContact: { name: "Sarah Thompson", relationship: "Istri", phone: "081234567893" }, lastVisit: "2024-01-12", lifetimeValue: 2500000, status: "Active" },
    ],
    stats: { total: 1247, byGender: { male: 623, female: 624 }, trend: "+15.3%", newThisWeek: 47 },
    pagination: { currentPage: 1, totalPages: 125, totalItems: 1247 },
  },
}

const DataPasien: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const queryClient = useQueryClient()

  const { data: patientsData, isLoading } = useQuery<PatientsApiResponse>({
    queryKey: ["patients", currentPage, searchTerm, filterStatus],
    queryFn: async () => mockPatientsData, // Ganti dengan fetch API Anda
    initialData: mockPatientsData,
  })

  const deleteMutation = useMutation({
    mutationFn: async (patientId: string) => { await new Promise(resolve => setTimeout(resolve, 1000)); return { success: true } },
    onSuccess: () => { toast.success("Pasien berhasil dihapus"); queryClient.invalidateQueries({ queryKey: ["patients"] }) },
    onError: (error: Error) => { toast.error(`Gagal: ${error.message}`) },
  })

  const data = patientsData?.data || mockPatientsData.data
  const stats = data?.stats || mockPatientsData.data.stats

  const columns = [
    { key: "name", label: "Pasien", render: (patient: Patient) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-sm font-semibold text-blue-600">{patient.name.charAt(0)}</div>
          <div>
            <div className="font-semibold text-slate-800">{patient.name}</div>
            <div className="text-xs text-slate-500">ID: {patient.patientId}</div>
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (patient: Patient) => <span className="text-sm text-slate-600">{patient.email || "-"}</span> },
    { key: "phone", label: "Telepon", render: (patient: Patient) => <span className="text-sm text-slate-600">{patient.phone}</span> },
    { key: "lastVisit", label: "Kunjungan Terakhir", render: (patient: Patient) => <span className="text-sm text-slate-600">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString("id-ID") : "N/A"}</span> },
    { key: "status", label: "Status", render: (patient: Patient) => (
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${patient.status === 'Active' ? 'bg-green-100/60 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{patient.status}</span>
      ),
    },
    { key: "actions", label: "Aksi", render: (patient: Patient) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(patient)} className="h-8 w-8 rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><Eye size={16} className="mx-auto" /></button>
          <button onClick={() => handleEdit(patient)} className="h-8 w-8 rounded-md text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"><Edit size={16} className="mx-auto" /></button>
          <button onClick={() => handleDelete(patient._id)} className="h-8 w-8 rounded-md text-red-500 transition-colors hover:bg-red-100 hover:text-red-700"><Trash2 size={16} className="mx-auto" /></button>
        </div>
      ),
    },
  ]

  const filterTabs = [
    { key: "all", label: "Semua", count: stats.total },
    { key: "active", label: "Aktif", count: Math.floor(stats.total * 0.8) },
    { key: "inactive", label: "Tidak Aktif", count: Math.floor(stats.total * 0.2) },
  ]

  const handleView = (patient: Patient) => { setSelectedPatient(patient); setShowModal(true) }
  const handleEdit = (patient: Patient) => { setSelectedPatient(patient); setShowModal(true) }
  const handleDelete = (patientId: string) => { if (window.confirm("Apakah Anda yakin?")) { deleteMutation.mutate(patientId) } }
  const handleAddNew = () => { setSelectedPatient(null); setShowModal(true) }

  if (isLoading && !patientsData) {
    return <div className="flex h-full items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Manajemen Data Pasien</h1>
          <p className="text-slate-500">Kelola semua informasi pasien rumah sakit Anda di sini.</p>
        </div>
        <button onClick={handleAddNew} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
          <Plus size={18} />
          Tambah Pasien Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total Pasien" value={stats.total} icon={Users} color="blue" trend="up" trendValue={stats.trend} />
        <MetricCard title="Pasien Baru (Minggu Ini)" value={stats.newThisWeek} icon={UserPlus} color="green" />
        <MetricCard title="Distribusi Gender" value={`${Math.round((stats.byGender.female / stats.total) * 100)}% P`} description={`${stats.byGender.male} L`} icon={Activity} color="purple" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-800">Daftar Pasien</h2>
            <p className="text-sm text-slate-500">{stats.total} pasien terdaftar di sistem.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari pasien..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="border-b border-t border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto p-2">
            {filterTabs.map((tab) => (
              <button key={tab.key} onClick={() => setFilterStatus(tab.key)} className={`flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${filterStatus === tab.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {tab.label}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${filterStatus === tab.key ? 'bg-white/20' : 'bg-slate-200'}`}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data.patients || []}
          loading={isLoading}
          pagination={{
            currentPage,
            totalPages: data.pagination?.totalPages || 1,
            totalItems: data.pagination?.totalItems || 0,
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {showModal && (
        <PatientModal patient={selectedPatient || undefined} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); queryClient.invalidateQueries({ queryKey: ["patients"] }) }} />
      )}
    </div>
  )
}

export default DataPasien
