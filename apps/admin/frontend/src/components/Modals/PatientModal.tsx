// apps/admin/frontend/src/components/Modals/PatientModal.tsx
// ATAU apps/admin/frontend/src/types/index.ts (jika PatientFormData didefinisikan di sana)

// Contoh kerangka PatientModal.tsx (Anda perlu menyesuaikan dengan isi file Anda)
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientAPI } from '../../services/api'; // Pastikan path ini benar

// **PERBAIKAN PENTING DI SINI**
export interface PatientFormData {
  // Properti yang WAJIB diisi saat membuat/mengedit dari form
  fullName: string; // Ganti dari 'name' ke 'fullName'
  email: string;
  phone: string;
  dateOfBirth: string; // Asumsi string (misal "YYYY-MM-DD")
  gender: 'Laki-laki' | 'Perempuan';

  // Properti opsional
  nik?: string; // Opsional, jika Anda tidak mewajibkannya di form atau tidak ada di PatientUser
  address?: { 
    street?: string; 
    city?: string;   
    province?: string; 
    postalCode?: string; 
  };
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  // Properti yang biasanya tidak diubah via modal ini, tapi mungkin ada di data
  _id?: string; // Untuk mode edit, pasien akan memiliki _id
  patientId?: string; // Jika Anda masih menggunakan ini sebagai identifikasi lain
  status?: 'Active' | 'Inactive'; // Jika ingin mengedit status pasien
}

interface PatientModalProps {
  patient?: PatientFormData; // Menggunakan PatientFormData yang sudah diubah
  onClose: () => void;
  onSave: () => void; // Fungsi yang dipanggil setelah simpan berhasil
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState<PatientFormData>(patient || {
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Laki-laki',
    address: {}, // Inisialisasi sebagai objek kosong
    // ... inisialisasi properti opsional lainnya jika perlu
  });
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!patient?._id; // Tentukan mode edit/tambah berdasarkan adanya _id

  // Implementasi useMutation untuk create dan update pasien
  const createPatientMutation = useMutation({
    mutationFn: (data: PatientFormData) => patientAPI.createPatient(data),
    onSuccess: () => {
      toast.success("Pasien berhasil ditambahkan!");
      onSave();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan pasien.");
    }
  });

  const updatePatientMutation = useMutation({
    mutationFn: (data: PatientFormData) => patientAPI.updatePatient(data._id as string, data),
    onSuccess: () => {
      toast.success("Data pasien berhasil diperbarui!");
      onSave();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui pasien.");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Handle nested address properties
    if (name.startsWith('address.')) {
      const addressProp = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressProp]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode) {
        await updatePatientMutation.mutateAsync(formData);
      } else {
        await createPatientMutation.mutateAsync(formData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{isEditMode ? "Edit Data Pasien" : "Tambah Pasien Baru"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contoh input field, sesuaikan dengan form Anda */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          {/* Input untuk address */}
          <div>
            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">Jalan</label>
            <input type="text" name="address.street" id="address.street" value={formData.address?.street || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          {/* Tambahkan input lainnya sesuai PatientFormData */}
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={isLoading || createPatientMutation.isPending || updatePatientMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;