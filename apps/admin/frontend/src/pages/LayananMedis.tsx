// apps/admin/frontend/src/pages/LayananMedis.tsx

"use client"

import React, { useState, useMemo, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Eye, Edit, Stethoscope, Calendar, Clock, Loader2, Search, Filter, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { debounce } from 'lodash';

import MetricCard from "../components/Dashboard/MetricCard"
import DataTable from "../components/DataTable/DataTable"
import PolyclinicModal from "../components/Modals/PolyclinicModal" // <-- Impor Modal
import { polyclinicAPI } from "../services/api"
import type { PolyclinicPayload, PolyclinicData, PolyclinicsApiResponse } from "../types"

// Sesuaikan interface agar cocok dengan PolyclinicData dari API
interface MedicalService extends PolyclinicData {
  doctor?: string; 
  operatingHoursDisplay?: string; 
}

const LayananMedis: React.FC = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all") 
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPolyclinic, setEditingPolyclinic] = useState<PolyclinicData | null>(null)
  
  const queryClient = useQueryClient()
  const pageSize = 10;

  // Debounce search function
  const debounceSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setCurrentPage(1); // Reset halaman saat searching
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debounceSearch(e.target.value);
  };

  // Data fetching menggunakan useQuery
  const { data: polyclinicsResponse, isLoading: isLoadingPolyclinics } = useQuery<PolyclinicsApiResponse>({
    queryKey: ["polyclinics", currentPage, debouncedSearchTerm, filterDepartment, filterStatus],
    queryFn: () => polyclinicAPI.getAllPolyclinics(currentPage, pageSize, debouncedSearchTerm, filterDepartment === "all" ? "" : filterDepartment, filterStatus === "all" ? "" : filterStatus),
    keepPreviousData: true,
  });

  const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
      queryKey: ["polyclinicDepartments"],
      queryFn: () => polyclinicAPI.getDepartments(),
  });

  // Data dan pagination
  const data = polyclinicsResponse?.data || [];
  const pagination = polyclinicsResponse?.pagination || { currentPage: 1, totalPages: 1, total: 0 };
  const departments = departmentsData?.data || [];
  
  // Data statistik
  const stats = {
    totalServices: pagination.total, 
    activeToday: 0, // Perlu API khusus
    averageWaitTime: 0, // Perlu API khusus
  };

  // Mutations untuk Create, Update, Delete
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polyclinics"] });
      handleCloseModal();
    },
    onError: (error: any) => {
        // Pesan error sudah ditangani oleh interceptor axios, 
        // kita bisa menambahkan logic tambahan di sini jika perlu.
        console.error(error);
    }
  };

  const createMutation = useMutation({
    mutationFn: polyclinicAPI.createPolyclinic,
    ...mutationOptions,
    onSuccess: () => {
      toast.success("Layanan berhasil ditambahkan!");
      mutationOptions.onSuccess();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<PolyclinicPayload> }) => polyclinicAPI.updatePolyclinic(id, data),
    ...mutationOptions,
    onSuccess: () => {
      toast.success("Layanan berhasil diperbarui!");
      mutationOptions.onSuccess();
    }
  });

  const deleteMutation = useMutation({
      mutationFn: polyclinicAPI.deletePolyclinic,
      onSuccess: () => {
          toast.success("Layanan berhasil dihapus!");
          queryClient.invalidateQueries({ queryKey: ["polyclinics"] });
      }
  });

  // Handlers untuk modal dan actions
  const handleOpenModal = (polyclinic: PolyclinicData | null = null) => {
    setEditingPolyclinic(polyclinic);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPolyclinic(null);
  };

  const handleSubmitModal = async (formData: PolyclinicPayload) => {
    if (editingPolyclinic?._id) {
      await updateMutation.mutateAsync({ id: editingPolyclinic._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDelete = (id: string, name: string) => {
      if (window.confirm(`Apakah Anda yakin ingin menghapus layanan "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
          deleteMutation.mutate(id);
      }
  };

  // Transformasi data untuk ditampilkan di tabel
  const transformedServices: MedicalService[] = useMemo(() => data.map(poly => ({
    ...poly,
    doctor: poly.assignedDoctors?.[0]?.doctorId ? (poly.assignedDoctors[0].doctorId as any).name : "Belum Ditentukan",
    // Logika sederhana untuk menampilkan jam operasional hari pertama yang buka
    operatingHoursDisplay: poly.operatingHours?.find(h => h.isOpen)?.start 
      ? `${poly.operatingHours.find(h => h.isOpen)?.day}: ${poly.operatingHours.find(h => h.isOpen)?.start} - ${poly.operatingHours.find(h => h.isOpen)?.end}`
      : 'N/A',
  })), [data]);

  const columns = [
    { key: "name", label: "Layanan", render: (service: MedicalService) => (
        <div>
          <div className="font-semibold text-slate-800">{service.name}</div>
          <div className="text-xs text-slate-500">{service.department}</div>
        </div>
      ),
    },
    { key: "doctor", label: "Dokter PJ", render: (service: MedicalService) => <span className="text-sm text-slate-600">{service.doctor || "N/A"}</span> },
    { key: "operatingHoursDisplay", label: "Jam Operasional", render: (service: MedicalService) => <span className="text-sm text-slate-600">{service.operatingHoursDisplay || "N/A"}</span> },
    { key: "tarif", label: "Tarif", render: (service: MedicalService) => <span className="font-semibold text-slate-800">Rp {(service.tarif || 0).toLocaleString("id-ID")}</span> },
    { key: "status", label: "Status", render: (service: MedicalService) => (
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
            service.status === 'Active' ? 'bg-green-100/60 text-green-700' : 
            service.status === 'Maintenance' ? 'bg-amber-100/60 text-amber-700' : 
            'bg-slate-100 text-slate-600'}`}>{service.status}</span>
      ),
    },
    { key: "actions", label: "Aksi", render: (service: MedicalService) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleOpenModal(service)} className="h-8 w-8 rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><Eye size={16} className="mx-auto" /></button>
          <button onClick={() => handleOpenModal(service)} className="h-8 w-8 rounded-md text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"><Edit size={16} className="mx-auto" /></button>
          <button onClick={() => handleDelete(service._id, service.name)} className="h-8 w-8 rounded-md text-red-500 transition-colors hover:bg-red-100 hover:text-red-700"><Trash2 size={16} className="mx-auto" /></button>
        </div>
      ),
    },
  ]

  const isLoading = isLoadingPolyclinics || createMutation.isLoading || updateMutation.isLoading;

  return (
    <>
      <PolyclinicModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        initialData={editingPolyclinic}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
        departments={departments}
      />
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Manajemen Layanan Medis</h1>
            <p className="text-slate-500">Kelola semua layanan dan poliklinik yang tersedia di rumah sakit.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
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
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <div className="relative w-full md:w-52">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Cari layanan..." value={searchTerm} onChange={handleSearchChange} className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} disabled={isLoadingDepartments} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 md:w-auto">
                      <option value="all">Semua Departemen</option>
                      {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                   <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 md:w-auto">
                      <option value="all">Semua Status</option>
                      <option value="Active">Aktif</option>
                      <option value="Maintenance">Perbaikan</option>
                      <option value="Closed">Tutup</option>
                  </select>
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
    </>
  )
}

export default LayananMedis;