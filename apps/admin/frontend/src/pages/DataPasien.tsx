// apps/admin/frontend/src/pages/DataPasien.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Filter, Eye, Edit, Trash2, Users, UserPlus, Activity, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import MetricCard from "../components/Dashboard/MetricCard";
import DataTable from "../components/DataTable/DataTable";
import PatientModal from "../components/Modals/PatientModal";
import { patientAPI } from "../services/api"; 
import type { PatientData, PatientsApiResponse, PatientStatsApiResponse, ApiResponse } from "../types";

const DataPasien: React.FC = () => { 
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // State dikontrol oleh URL Search Params untuk filter yang persisten
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all"); 
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  
  const pageSize = 10;

  // Sinkronisasi URL dengan state setiap kali ada perubahan
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", String(currentPage));
    if (searchTerm) params.set("search", searchTerm);
    if (filterStatus !== "all") params.set("status", filterStatus);
    // `replace: true` mencegah riwayat browser bertambah setiap kali filter diubah
    setSearchParams(params, { replace: true });
  }, [currentPage, searchTerm, filterStatus, setSearchParams]);

  // Fetch data pasien untuk tabel (dengan paginasi, search, dan filter)
  const { data: patientsResponse, isLoading: isLoadingPatients } = useQuery<PatientsApiResponse>({
    queryKey: ["patients", currentPage, searchTerm, filterStatus], 
    queryFn: () => patientAPI.getPatients(currentPage, pageSize, searchTerm, filterStatus),
    keepPreviousData: true, // Memberikan UX yang lebih baik saat paginasi
  });

  // Fetch data statistik untuk kartu di atas
  const { data: statsResponse, isLoading: isLoadingStats } = useQuery<ApiResponse<PatientStatsApiResponse>>({
    queryKey: ["patientStats"],
    queryFn: patientAPI.getPatientStats, 
  });

  // Mutasi untuk menghapus pasien
  const deleteMutation = useMutation({
    mutationFn: (patientId: string) => patientAPI.deletePatient(patientId), 
    onSuccess: () => { 
      toast.success("Pasien berhasil dihapus"); 
      queryClient.invalidateQueries({ queryKey: ["patients"] }); 
      queryClient.invalidateQueries({ queryKey: ["patientStats"] }); 
    },
    onError: (error: any) => { 
      toast.error(error.response?.data?.message || "Gagal menghapus pasien"); 
    },
  });

  // Memproses data yang diterima dari API
  const patients = patientsResponse?.data || [];
  const paginationData = patientsResponse?.pagination || { currentPage: 1, totalPages: 1, total: 0 };
  const statsData = statsResponse?.data;

  const totalPatients = statsData?.totalPatients || 0;
  const newPatientsThisWeek = statsData?.newPatientsThisWeek || 0;
  const activePatients = statsData?.activePatients || 0;
  
  const genderStats = statsData?.genderDistribution || [];
  const maleCount = genderStats.find(g => g._id === 'Laki-laki')?.count || 0; 
  const femaleCount = genderStats.find(g => g._id === 'Perempuan')?.count || 0; 
  const totalGenderCount = maleCount + femaleCount;

  // Definisi kolom untuk komponen DataTable
  const columns = [
    { key: "fullName", label: "Pasien", render: (p: PatientData) => ( 
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-sm font-semibold text-blue-600">{p.fullName.charAt(0)}</div>
          <div>
            <div className="font-semibold text-slate-800">{p.fullName}</div>
            <div className="text-xs text-slate-500">ID: {p._id}</div> 
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (p: PatientData) => <span className="text-sm text-slate-600">{p.email || "-"}</span> },
    { key: "phone", label: "Telepon", render: (p: PatientData) => <span className="text-sm text-slate-600">{p.phone}</span> },
    { key: "lastVisit", label: "Kunjungan Terakhir", render: (p: PatientData) => <span className="text-sm text-slate-600">{p.lastVisit ? new Date(p.lastVisit).toLocaleDateString("id-ID") : "N/A"}</span> },
    { key: "status", label: "Status", render: (p: PatientData) => (
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${p.isActive ? 'bg-green-100/60 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{p.isActive ? 'Aktif' : 'Tidak Aktif'}</span> 
      )
    }, 
    { key: "actions", label: "Aksi", render: (p: PatientData) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(p)} className="h-8 w-8 rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><Eye size={16} className="mx-auto" /></button>
          <button onClick={() => handleEdit(p)} className="h-8 w-8 rounded-md text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"><Edit size={16} className="mx-auto" /></button>
          <button onClick={() => handleDelete(p._id)} className="h-8 w-8 rounded-md text-red-500 transition-colors hover:bg-red-100 hover:text-red-700"><Trash2 size={16} className="mx-auto" /></button>
        </div>
      ), 
    }, 
  ]; 

  // Event Handlers untuk membuka modal dengan mode yang berbeda
  const handleView = (patient: PatientData) => { setSelectedPatient(patient); setModalMode('view'); setShowModal(true); }; 
  const handleEdit = (patient: PatientData) => { setSelectedPatient(patient); setModalMode('edit'); setShowModal(true); }; 
  const handleAddNew = () => { setSelectedPatient(null); setModalMode('add'); setShowModal(true); }; 
  const handleDelete = (patientId: string) => { if (window.confirm("Apakah Anda yakin ingin menghapus pasien ini? Aksi ini tidak dapat dibatalkan.")) { deleteMutation.mutate(patientId); } }; 

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat mencari
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset ke halaman pertama saat filter
  };

  if (isLoadingStats && !statsResponse) {
    return <div className="flex h-full items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>; 
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
        <MetricCard title="Total Pasien" value={totalPatients.toLocaleString("id-ID")} icon={Users} color="blue" />
        <MetricCard title="Pasien Baru (Minggu Ini)" value={newPatientsThisWeek.toLocaleString("id-ID")} icon={UserPlus} color="green" />
        <MetricCard title="Distribusi Gender" 
          value={`${totalGenderCount > 0 ? Math.round((femaleCount / totalGenderCount) * 100) : 0}% P`} 
          description={`${maleCount} L`} 
          icon={Activity} 
          color="purple" 
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-800">Daftar Pasien</h2>
            <p className="text-sm text-slate-500">{paginationData.total} pasien terdaftar di sistem.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari nama, email, telepon..." value={searchTerm} onChange={handleSearchChange} className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="border-b border-t border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto p-2">
            <button onClick={() => handleFilterChange('all')} className={`flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              Semua <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${filterStatus === 'all' ? 'bg-white/20' : 'bg-slate-200'}`}>{totalPatients}</span>
            </button>
            <button onClick={() => handleFilterChange('Active')} className={`flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${filterStatus === 'Active' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              Aktif <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${filterStatus === 'Active' ? 'bg-white/20' : 'bg-slate-200'}`}>{activePatients}</span>
            </button>
            <button onClick={() => handleFilterChange('Inactive')} className={`flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${filterStatus === 'Inactive' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              Tidak Aktif <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${filterStatus === 'Inactive' ? 'bg-white/20' : 'bg-slate-200'}`}>{totalPatients - activePatients}</span>
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={patients} 
          loading={isLoadingPatients} 
          pagination={{
            currentPage: paginationData.currentPage,
            totalPages: paginationData.totalPages,
            totalItems: paginationData.total, 
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {showModal && (
        <PatientModal 
          mode={modalMode}
          patient={selectedPatient || undefined} 
          onClose={() => setShowModal(false)} 
          onSave={() => { 
            setShowModal(false); 
            queryClient.invalidateQueries({ queryKey: ["patients"] }); 
            queryClient.invalidateQueries({ queryKey: ["patientStats"] }); 
          }} 
        />
      )}
    </div>
  )
}

export default DataPasien;
