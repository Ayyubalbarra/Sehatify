// apps/admin/frontend/src/components/Settings/ChangePasswordForm.tsx

import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import { authAPI } from '../../services/api';

// Skema validasi menggunakan Zod
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini harus diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"], // Menandai field mana yang error
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const ChangePasswordForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: authAPI.changePassword,
    onSuccess: () => {
      toast.success('Password berhasil diubah!');
      reset(); // Kosongkan form setelah sukses
    },
    onError: (error: any) => {
      // Error sudah ditangani oleh interceptor global, jadi tidak perlu toast lagi di sini
      console.error('Gagal mengubah password:', error);
    },
  });

  const onSubmit: SubmitHandler<PasswordFormData> = (data) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <h3 className="text-md font-semibold text-slate-700">Ubah Password</h3>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Password Saat Ini</label>
        <input
          type="password"
          {...register('currentPassword')}
          className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.currentPassword && <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Password Baru</label>
        <input
          type="password"
          {...register('newPassword')}
          className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
        <input
          type="password"
          {...register('confirmPassword')}
          className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-900 disabled:opacity-50"
        >
          {changePasswordMutation.isPending && <Loader2 size={16} className="animate-spin" />}
          Ganti Password
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;