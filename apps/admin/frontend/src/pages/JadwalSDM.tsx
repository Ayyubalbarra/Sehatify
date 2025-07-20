// apps/admin/frontend/src/pages/JadwalSDM.tsx

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Users, MapPin, Plus, Search, Filter, Edit, Eye, Loader2 } from "lucide-react";
import MetricCard from "../components/Dashboard/MetricCard";
import ScheduleModal from "../components/Modals/ScheduleModal";
import { scheduleAPI } from "../services/api";
import type { ScheduleData } from "../types";

const JadwalSDM: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');

  // Mengambil data statistik untuk kartu di atas
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["scheduleStats"],
    queryFn: scheduleAPI.getScheduleStats, 
  });

  // Mengambil data jadwal untuk ditampilkan (dengan filter tanggal dan pencarian)
  const { data: schedulesResponse, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["schedules", selectedDate, searchTerm],
    queryFn: () => scheduleAPI.getAllSchedules(1, 50, selectedDate, searchTerm),
  });

  const schedules = schedulesResponse?.data || [];
  const stats = statsData?.data || { doctorsOnDuty: 0, totalSlots: 0, utilization: 0 };

  // Handler untuk membuka modal dengan mode yang sesuai
  const handleOpenModal = (mode: 'add' | 'edit' | 'view', schedule: ScheduleData | null = null) => {
    setModalMode(mode);
    setSelectedSchedule(schedule);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
  };

  // Handler setelah menyimpan data untuk me-refresh state
  const handleSave = () => {
    setShowModal(false);
    setSelectedSchedule(null);
    queryClient.invalidateQueries({ queryKey: ["schedules"] });
    queryClient.invalidateQueries({ queryKey: ["scheduleStats"] });
  };

  const isLoading = isLoadingStats || isLoadingSchedules;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Jadwal dan SDM</h1>
          <p className="text-slate-500">Kelola jadwal dokter dan sumber daya manusia lainnya.</p>
        </div>
        <button onClick={() => handleOpenModal('add')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
          <Plus size={18} />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Dokter Bertugas" value={stats.doctorsOnDuty} icon={Users} color="blue" description="Hari ini" />
        <MetricCard title="Total Slot Tersedia" value={stats.totalSlots} icon={Calendar} color="green" />
        <MetricCard title="Utilisasi Jadwal" value={`${stats.utilization}%`} icon={Clock} color="purple" description="Slot terisi" />
      </div>

      <div className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="date-picker" className="text-sm font-medium text-slate-700">Pilih Tanggal:</label>
          <input type="date" id="date-picker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-md border-slate-300 bg-slate-50 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative w-full flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari dokter atau poli..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {isLoading && !schedules.length ? (
        <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : schedules.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-700">Tidak Ada Jadwal</h3>
            <p className="text-slate-500 mt-1">Tidak ada jadwal yang ditemukan untuk tanggal atau pencarian ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {schedules.map((schedule: ScheduleData) => (
            <div key={schedule._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{schedule.doctorInfo?.name || 'N/A'}</h3>
                  <p className="text-sm text-slate-500">{schedule.doctorInfo?.specialization || 'N/A'}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${schedule.status === 'Active' ? 'bg-green-100/60 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {schedule.status}
                </span>
              </div>
              <div className="mb-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><MapPin size={14} /><span>{schedule.polyclinicInfo?.name || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><Clock size={14} /><span>{schedule.startTime} - {schedule.endTime}</span></div>
                <div className="flex items-center gap-2"><Users size={14} /><span>{schedule.bookedSlots}/{schedule.totalSlots} Pasien</span></div>
              </div>
              <div className="mb-4 mt-auto">
                <div className="mb-1 h-1.5 w-full rounded-full bg-slate-200">
                  <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${(schedule.bookedSlots / schedule.totalSlots) * 100}%` }}></div>
                </div>
                <p className="text-right text-xs font-medium text-slate-500">{Math.round((schedule.bookedSlots / schedule.totalSlots) * 100)}% Terisi</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenModal('edit', schedule)} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-100/60 px-3 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100">
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => handleOpenModal('view', schedule)} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200">
                  <Eye size={14} /> Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ScheduleModal 
          mode={modalMode}
          schedule={selectedSchedule || undefined}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default JadwalSDM;
