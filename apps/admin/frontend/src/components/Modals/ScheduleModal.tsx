// apps/admin/frontend/src/components/Modals/ScheduleModal.tsx

import React, { useState, useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { scheduleAPI, polyclinicAPI, doctorAPI } from "../../services/api";
import type { ScheduleData, PolyclinicData, DoctorDataFromAdminAPI, ScheduleFormData } from "../../types";

interface ScheduleModalProps {
  mode: 'add' | 'edit' | 'view';
  schedule?: ScheduleData; 
  onClose: () => void;
  onSave: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ mode, schedule, onClose, onSave }) => {
  const queryClient = useQueryClient();
  const isViewMode = mode === 'view';

  const [formData, setFormData] = useState<ScheduleFormData>({
    doctorId: "",
    polyclinicId: "",
    date: "",
    startTime: "",
    endTime: "",
    totalSlots: 10,
    notes: "",
    status: 'Active',
  });

  // Fetch data dokter untuk dropdown
  const { data: doctorsData } = useQuery({
    queryKey: ["doctorsList"],
    queryFn: () => doctorAPI.getDoctors(1, 100), // Ambil hingga 100 dokter
  });
  const availableDoctors = doctorsData?.data || [];

  // Fetch data poliklinik untuk dropdown
  const { data: polyclinicsData } = useQuery({
    queryKey: ["polyclinicsList"],
    queryFn: () => polyclinicAPI.getAllPolyclinics(1, 100), // Ambil hingga 100 poliklinik
  });
  const availablePolyclinics = polyclinicsData?.data || [];

  useEffect(() => {
    if (schedule) {
      setFormData({
        _id: schedule._id,
        doctorId: schedule.doctorId,
        polyclinicId: schedule.polyclinicId,
        date: new Date(schedule.date).toISOString().split('T')[0], // Format tanggal untuk input
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        totalSlots: schedule.totalSlots,
        notes: schedule.notes,
        status: schedule.status,
      });
    }
  }, [schedule]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) : value,
    }));
  };

  const createScheduleMutation = useMutation({
    mutationFn: (data: ScheduleFormData) => scheduleAPI.createSchedule(data),
    onSuccess: () => {
      toast.success("Jadwal berhasil ditambahkan");
      onSave();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan jadwal.");
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: (data: ScheduleFormData) => scheduleAPI.updateSchedule(data._id as string, data),
    onSuccess: () => {
      toast.success("Jadwal berhasil diperbarui");
      onSave();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui jadwal.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode) return; // Jangan submit jika hanya melihat
    if (schedule?._id) {
      updateScheduleMutation.mutate(formData);
    } else {
      createScheduleMutation.mutate(formData);
    }
  };

  const getTitle = () => {
    if (mode === 'view') return 'Detail Jadwal';
    if (mode === 'edit') return 'Edit Jadwal';
    return 'Tambah Jadwal Baru';
  };

  const isLoading = createScheduleMutation.isPending || updateScheduleMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-lg m-4">
        <div className="flex items-center gap-4 p-4 border-b">
            <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-slate-100">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h2 className="text-xl font-semibold text-slate-800">{getTitle()}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="doctorId" className="mb-1 block text-sm font-medium text-slate-700">Dokter</label>
              <select name="doctorId" id="doctorId" value={formData.doctorId} onChange={handleInputChange} required className="w-full border border-slate-300 rounded-md p-2 disabled:bg-slate-100 disabled:cursor-not-allowed" disabled={isViewMode}>
                <option value="">Pilih Dokter</option>
                {availableDoctors.map((doctor: DoctorDataFromAdminAPI) => ( 
                  <option key={doctor._id} value={doctor._id}>{doctor.name} ({doctor.specialization})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="polyclinicId" className="mb-1 block text-sm font-medium text-slate-700">Poliklinik</label>
              <select name="polyclinicId" id="polyclinicId" value={formData.polyclinicId} onChange={handleInputChange} required className="w-full border border-slate-300 rounded-md p-2 disabled:bg-slate-100 disabled:cursor-not-allowed" disabled={isViewMode}>
                <option value="">Pilih Poliklinik</option>
                {availablePolyclinics.map((poly: PolyclinicData) => ( 
                  <option key={poly._id} value={poly._id}>{poly.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">Tanggal</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 disabled:bg-slate-100 disabled:cursor-not-allowed" required readOnly={isViewMode} />
              </div>
              <div>
                <label htmlFor="totalSlots" className="mb-1 block text-sm font-medium text-slate-700">Total Slot</label>
                <input type="number" id="totalSlots" name="totalSlots" value={formData.totalSlots} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 disabled:bg-slate-100 disabled:cursor-not-allowed" required min="1" readOnly={isViewMode} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="mb-1 block text-sm font-medium text-slate-700">Waktu Mulai</label>
                <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 disabled:bg-slate-100 disabled:cursor-not-allowed" required readOnly={isViewMode} />
              </div>
              <div>
                <label htmlFor="endTime" className="mb-1 block text-sm font-medium text-slate-700">Waktu Selesai</label>
                <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 disabled:bg-slate-100 disabled:cursor-not-allowed" required readOnly={isViewMode} />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select name="status" id="status" value={formData.status} onChange={handleInputChange} className="w-full border border-slate-300 rounded-md p-2 disabled:bg-slate-100 disabled:cursor-not-allowed" required disabled={isViewMode}>
                  <option value="Active">Aktif</option>
                  <option value="Cancelled">Dibatalkan</option>
                  <option value="Full">Penuh</option>
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">Catatan</label>
              <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 disabled:bg-slate-100 disabled:cursor-not-allowed" rows={2} readOnly={isViewMode}></textarea>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t bg-slate-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-100">
              {isViewMode ? "Tutup" : "Batal"}
            </button>
            {!isViewMode && (
              <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : (schedule ? "Perbarui" : "Tambah")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
