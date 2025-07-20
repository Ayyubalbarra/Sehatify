// apps/admin/frontend/src/components/Modals/PatientModal.tsx

import React, { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientAPI } from '../../services/api';
import type { PatientData, PatientFormData } from '../../types';

interface PatientModalProps {
  mode: 'add' | 'edit' | 'view';
  patient?: PatientData;
  onClose: () => void;
  onSave: () => void;
}

const PatientModal: React.FC<PatientModalProps> = ({ mode, patient, onClose, onSave }) => {
  const queryClient = useQueryClient();
  const isViewMode = mode === 'view';

  const [formData, setFormData] = useState<PatientFormData>({
    fullName: "", email: "", phone: "", dateOfBirth: "", address: "",
    gender: undefined, bloodType: undefined, allergies: [], medicalHistory: [],
    isActive: true, 
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        _id: patient._id,
        fullName: patient.fullName || "",
        email: patient.email || "",
        phone: patient.phone || "",
        // Format tanggal agar sesuai dengan input type="date"
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
        address: patient.address || "",
        gender: patient.gender || undefined,
        bloodType: patient.bloodType || undefined,
        allergies: patient.allergies || [],
        medicalHistory: patient.medicalHistory || [],
        isActive: patient.isActive !== undefined ? patient.isActive : true,
      });
    }
  }, [patient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createPatientMutation = useMutation({
    mutationFn: (data: PatientFormData) => patientAPI.createPatient(data),
    onSuccess: () => {
      toast.success("Pasien berhasil ditambahkan!");
      onSave();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan pasien.");
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: (data: PatientFormData) => patientAPI.updatePatient(data._id as string, data),
    onSuccess: () => {
      toast.success("Data pasien berhasil diperbarui!");
      onSave();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui pasien.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode) return;
    if (patient?._id) {
      updatePatientMutation.mutate(formData);
    } else {
      createPatientMutation.mutate(formData);
    }
  };

  const getTitle = () => {
    if (mode === 'view') return 'Detail Data Pasien';
    if (mode === 'edit') return 'Edit Data Pasien';
    return 'Tambah Pasien Baru';
  };
  
  const isLoading = createPatientMutation.isPending || updatePatientMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-lg bg-white shadow-lg m-4">
        <div className="flex items-center gap-4 p-4 border-b">
            {/* --- TOMBOL KEMBALI --- */}
            <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-slate-100">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h2 className="text-xl font-semibold text-slate-800">{getTitle()}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
              <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 read-only:bg-slate-100" required readOnly={isViewMode} />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 read-only:bg-slate-100" required readOnly={isViewMode} />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">Nomor Telepon</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 read-only:bg-slate-100" required readOnly={isViewMode} />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="mb-1 block text-sm font-medium text-slate-700">Tanggal Lahir</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 read-only:bg-slate-100" required readOnly={isViewMode} />
            </div>
            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">Alamat</label>
              <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 read-only:bg-slate-100" rows={3} required readOnly={isViewMode}></textarea>
            </div>
            <div>
              <label htmlFor="gender" className="mb-1 block text-sm font-medium text-slate-700">Jenis Kelamin</label>
              <select id="gender" name="gender" value={formData.gender || ''} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 read-only:bg-slate-100" disabled={isViewMode}>
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label htmlFor="bloodType" className="mb-1 block text-sm font-medium text-slate-700">Golongan Darah</label>
              <input type="text" id="bloodType" name="bloodType" value={formData.bloodType || ''} onChange={handleInputChange} className="w-full rounded-md border border-slate-300 p-2 read-only:bg-slate-100" readOnly={isViewMode} />
            </div>
            <div>
              <label htmlFor="allergies" className="mb-1 block text-sm font-medium text-slate-700">Alergi (pisahkan dengan koma)</label>
              <input type="text" id="allergies" name="allergies" value={formData.allergies?.join(', ') || ''} onChange={(e) => setFormData(p => ({...p, allergies: e.target.value.split(',').map(s => s.trim())}))} className="w-full rounded-md border border-slate-300 p-2 read-only:bg-slate-100" readOnly={isViewMode} />
            </div>
            <div>
              <label htmlFor="medicalHistory" className="mb-1 block text-sm font-medium text-slate-700">Riwayat Medis (pisahkan dengan koma)</label>
              <input type="text" id="medicalHistory" name="medicalHistory" value={formData.medicalHistory?.join(', ') || ''} onChange={(e) => setFormData(p => ({...p, medicalHistory: e.target.value.split(',').map(s => s.trim())}))} className="w-full rounded-md border border-slate-300 p-2 read-only:bg-slate-100" readOnly={isViewMode} />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t bg-slate-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-100">
              {isViewMode ? "Tutup" : "Batal"}
            </button>
            {!isViewMode && (
              <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : (patient ? "Perbarui" : "Tambah")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
