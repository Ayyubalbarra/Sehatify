// apps/admin/frontend/src/components/Modals/ScheduleModal.tsx

"use client"

import React, { useState, useEffect } from "react";
import { X, Save, Calendar, Clock, User, Stethoscope, Loader2 } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { scheduleAPI, polyclinicAPI, doctorAPI } from "../../services/api";
import type { ScheduleData, PolyclinicData, DoctorDataFromAdminAPI } from "../../types";
// Interface untuk data form jadwal
export interface ScheduleFormData {
  _id?: string; // Hanya ada saat edit
  scheduleId?: string; // Hanya ada saat edit
  doctorId: string; // ID Dokter
  polyclinicId: string; // ID Poliklinik
  date: string; // Format YYYY-MM-DD
  startTime: string; // Format HH:MM
  endTime: string; // Format HH:MM
  totalSlots: number;
  notes?: string;
  status: 'Active' | 'Cancelled' | 'Completed'; // Status wajib di form

  // Properti tampilan yang tidak dikirim ke backend, tapi berguna untuk mengisi modal
  doctorName?: string;
  doctorSpecialization?: string;
  polyclinicName?: string;
  bookedSlots?: number;
  availableSlots?: number;
}

interface ScheduleModalProps {
  schedule?: ScheduleFormData; // Data jadwal untuk edit
  onClose: () => void;
  onSave: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ schedule, onClose, onSave }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!schedule?._id;

  const [formData, setFormData] = useState<ScheduleFormData>({
    doctorId: "",
    polyclinicId: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "17:00",
    totalSlots: 20,
    notes: "",
    status: "Active", // Default status saat membuat jadwal baru
  });

  // Fetch daftar dokter untuk dropdown
  const { data: doctorsResponse, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctorsList'],
    queryFn: () => doctorAPI.getDoctors(1, 100, '', '', 'Active'), // Ambil semua dokter aktif
    staleTime: Infinity, // Daftar dokter jarang berubah
  });
  const availableDoctors = doctorsResponse?.data || [];

  // Fetch daftar poliklinik untuk dropdown
  const { data: polyclinicsResponse, isLoading: isLoadingPolyclinics } = useQuery({
    queryKey: ['polyclinicsList'],
    queryFn: () => polyclinicAPI.getAllPolyclinics(1, 100, '', ''), // Ambil semua poliklinik
    staleTime: Infinity, // Daftar poliklinik jarang berubah
  });
  const availablePolyclinics = polyclinicsResponse?.data || [];

  useEffect(() => {
    if (schedule) {
      setFormData({
        _id: schedule._id,
        scheduleId: schedule.scheduleId,
        doctorId: schedule.doctorId,
        polyclinicId: schedule.polyclinicId,
        date: new Date(schedule.date).toISOString().split('T')[0], // Format tanggal
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        totalSlots: schedule.totalSlots,
        notes: schedule.notes || "",
        status: schedule.status || "Active", // Map status dari data yang ada
        doctorName: schedule.doctorName,
        doctorSpecialization: schedule.doctorSpecialization,
        polyclinicName: schedule.polyclinicName,
        bookedSlots: schedule.bookedSlots,
        availableSlots: schedule.availableSlots,
      });
    }
  }, [schedule]);

  const createMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      // Filter properti tampilan yang tidak perlu dikirim ke backend
      const { doctorName, doctorSpecialization, polyclinicName, bookedSlots, availableSlots, ...payload } = data;
      // Memastikan payload sesuai dengan Omit<ScheduleData, ...>
      return scheduleAPI.createSchedule(payload);
    },
    onSuccess: () => {
      toast.success("Jadwal berhasil ditambahkan");
      onSave(); // Tutup modal dan refresh data
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan jadwal.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      // Filter properti tampilan yang tidak perlu dikirim ke backend
      const { doctorName, doctorSpecialization, polyclinicName, bookedSlots, availableSlots, ...payload } = data;
      // Memastikan payload sesuai dengan Partial<Omit<ScheduleData, ...>>
      return scheduleAPI.updateSchedule(data._id as string, payload);
    },
    onSuccess: () => {
      toast.success("Jadwal berhasil diperbarui");
      onSave(); // Tutup modal dan refresh data
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui jadwal.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctorId || !formData.polyclinicId || !formData.date || !formData.startTime || !formData.endTime || formData.totalSlots <= 0) {
      toast.error("Mohon isi semua field wajib.");
      return;
    }

    // Periksa totalSlots vs bookedSlots saat update
    if (isEditMode && formData.totalSlots < (schedule?.bookedSlots || 0)) {
      toast.error(`Total slot tidak boleh kurang dari slot yang sudah dipesan (${schedule?.bookedSlots}).`);
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isLoadingDoctors || isLoadingPolyclinics;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">{isEditMode ? "Edit Jadwal" : "Tambah Jadwal Baru"}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dokter */}
          <div>
            <label htmlFor="doctorId" className="block text-sm font-medium text-slate-700 mb-1">Dokter *</label>
            {isLoadingDoctors ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            ) : (
              <select name="doctorId" id="doctorId" value={formData.doctorId} onChange={handleInputChange} required className="w-full border border-slate-300 rounded-md p-2">
                <option value="">Pilih Dokter</option>
                {availableDoctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>{doctor.name} ({doctor.specialization})</option>
                ))}
              </select>
            )}
          </div>

          {/* Poliklinik */}
          <div>
            <label htmlFor="polyclinicId" className="block text-sm font-medium text-slate-700 mb-1">Poliklinik *</label>
            {isLoadingPolyclinics ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            ) : (
              <select name="polyclinicId" id="polyclinicId" value={formData.polyclinicId} onChange={handleInputChange} required className="w-full border border-slate-300 rounded-md p-2">
                <option value="">Pilih Poliklinik</option>
                {availablePolyclinics.map(poly => (
                  <option key={poly._id} value={poly._id}>{poly.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Tanggal */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Tanggal *</label>
            <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} required className="w-full border border-slate-300 rounded-md p-2" />
          </div>

          {/* Waktu Mulai */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1">Waktu Mulai *</label>
            <input type="time" name="startTime" id="startTime" value={formData.startTime} onChange={handleInputChange} required className="w-full border border-slate-300 rounded-md p-2" />
          </div>

          {/* Waktu Selesai */}
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1">Waktu Selesai *</label>
            <input type="time" name="endTime" id="endTime" value={formData.endTime} onChange={handleInputChange} required className="w-full border border-slate-300 rounded-md p-2" />
          </div>

          {/* Total Slot */}
          <div>
            <label htmlFor="totalSlots" className="block text-sm font-medium text-slate-700 mb-1">Total Slot *</label>
            <input type="number" name="totalSlots" id="totalSlots" value={formData.totalSlots} onChange={handleInputChange} required min="1" className="w-full border border-slate-300 rounded-md p-2" />
            {isEditMode && formData.totalSlots < (schedule?.bookedSlots || 0) && (
              <p className="text-red-500 text-xs mt-1">Total slot tidak boleh kurang dari slot yang sudah dipesan ({schedule?.bookedSlots}).</p>
            )}
          </div>

          {/* Notes (opsional) */}
          <div className="col-span-full">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
            <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleInputChange} rows={3} className="w-full border border-slate-300 rounded-md p-2"></textarea>
          </div>
          
          {/* Status (saat edit mode) */}
          {isEditMode && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" id="status" value={formData.status} onChange={handleInputChange} className="w-full border border-slate-300 rounded-md p-2">
                <option value="Active">Active</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin inline-block" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;