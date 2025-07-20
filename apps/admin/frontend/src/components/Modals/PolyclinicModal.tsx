// apps/admin/frontend/src/components/Modals/PolyclinicModal.tsx

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import { PolyclinicData, PolyclinicPayload } from '../../types';
import toast from 'react-hot-toast';

// Skema validasi menggunakan Zod
const polyclinicSchema = z.object({
  name: z.string().min(3, 'Nama layanan minimal 3 karakter'),
  department: z.string().min(1, 'Departemen harus dipilih'),
  tarif: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)), 
    z.number({ invalid_type_error: "Tarif harus berupa angka" }).min(0, "Tarif tidak boleh negatif").optional()
  ),
  status: z.enum(['Active', 'Maintenance', 'Closed']),
  description: z.string().optional(),
});

interface PolyclinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PolyclinicPayload) => Promise<void>;
  initialData?: PolyclinicData | null;
  isLoading: boolean;
  departments: string[];
}

const PolyclinicModal: React.FC<PolyclinicModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading, departments }) => {
  const isEditing = !!initialData;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PolyclinicPayload>({
    resolver: zodResolver(polyclinicSchema),
    defaultValues: {
      name: '',
      department: '',
      tarif: 0,
      status: 'Active',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        department: initialData.department,
        tarif: initialData.tarif || 0,
        status: initialData.status,
        description: initialData.description || '',
      });
    } else {
      reset({
        name: '',
        department: '',
        tarif: 0,
        status: 'Active',
        description: '',
      });
    }
  }, [initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: PolyclinicPayload) => {
    await onSubmit(data);
    // onClose() akan dipanggil dari parent setelah submit sukses
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" onClick={onClose}>
      <div className="relative w-full max-w-lg transform rounded-xl bg-white p-6 shadow-xl transition-all" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edit Layanan Medis' : 'Tambah Layanan Medis'}</h2>
        <p className="mb-6 text-sm text-slate-500">{isEditing ? 'Perbarui detail layanan di bawah ini.' : 'Isi detail untuk layanan baru.'}</p>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Layanan</label>
            <Controller name="name" control={control} render={({ field }) => (
              <input {...field} id="name" type="text" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            )} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-700">Departemen</label>
              <Controller name="department" control={control} render={({ field }) => (
                <select {...field} id="department" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="">Pilih Departemen</option>
                  {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
              )} />
              {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
            </div>
            <div>
              <label htmlFor="tarif" className="block text-sm font-medium text-slate-700">Tarif (Rp)</label>
              <Controller name="tarif" control={control} render={({ field }) => (
                <input {...field} id="tarif" type="number" placeholder="Contoh: 150000" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              )} />
              {errors.tarif && <p className="mt-1 text-xs text-red-600">{errors.tarif.message}</p>}
            </div>
          </div>
            
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
            <Controller name="status" control={control} render={({ field }) => (
              <select {...field} id="status" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="Active">Aktif</option>
                <option value="Maintenance">Dalam Perbaikan</option>
                <option value="Closed">Tutup</option>
              </select>
            )} />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Deskripsi (Opsional)</label>
            <Controller name="description" control={control} render={({ field }) => (
              <textarea {...field} id="description" rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            )} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEditing ? 'Simpan Perubahan' : 'Tambah Layanan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolyclinicModal;