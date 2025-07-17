// apps/admin/frontend/src/components/Modals/PatientModal.tsx

"use client"

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientAPI } from '../../services/api';
import type { PatientData } from '../../types';
// **PERBAIKAN PENTING DI SINI**
export interface PatientFormData {
  _id?: string;
  fullName: string;
  email?: string; // <-- PERBAIKAN: Jadikan email opsional
  phone: string;
  dateOfBirth: string;
  gender: 'Laki-laki' | 'Perempuan';

  nik?: string;
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
  patientId?: string;
  status?: 'Active' | 'Inactive';
  registrationDate?: string;
  lastVisit?: string;
  age?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PatientModalProps {
  patient?: PatientFormData;
  onClose: () => void;
  onSave: () => void;
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState<PatientFormData>(patient || {
    fullName: '',
    email: '', // <-- Pertahankan sebagai string kosong untuk input form
    phone: '',
    dateOfBirth: '',
    gender: 'Laki-laki',
    address: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!patient?._id;

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
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            {/* Pastikan input email tidak ada 'required' jika email di formData adalah opsional */}
            <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
            <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <select name="gender" id="gender" value={formData.gender} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">Jalan</label>
            <input type="text" name="address.street" id="address.street" value={formData.address?.street || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          <div>
            <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">Kota</label>
            <input type="text" name="address.city" id="address.city" value={formData.address?.city || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          <div>
            <label htmlFor="address.province" className="block text-sm font-medium text-gray-700">Provinsi</label>
            <input type="text" name="address.province" id="address.province" value={formData.address?.province || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          <div>
            <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">Kode Pos</label>
            <input type="text" name="address.postalCode" id="address.postalCode" value={formData.address?.postalCode || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          {/* Tambahkan input lainnya sesuai PatientFormData jika ada */}

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