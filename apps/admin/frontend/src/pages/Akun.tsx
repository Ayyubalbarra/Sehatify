// apps/admin/frontend/src/pages/Akun.tsx

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Save, Upload, Eye, EyeOff, Shield, Activity, Clock, User as UserIcon } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useAuth } from "../contexts/AuthContext"
import { authAPI } from "../services/api" // <-- Import authAPI

// Komponen Card dan Input tidak berubah
const SectionCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 p-4">
        <Icon className="text-slate-600" size={20} />
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
);
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input 
            className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-200"
            {...props} 
        />
    </div>
);


const Akun: React.FC = () => {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()

  // ✅ State lokal
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [profileData, setProfileData] = useState({ name: "", email: "", phone: "", role: "" })
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })

  // ✅ Mengambil data profil terbaru dari API
  const { data: profileApiResponse, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: authAPI.getProfile,
  });

  // ✅ Mengisi form dengan data dari API setelah berhasil diambil
  useEffect(() => {
    if (profileApiResponse?.data?.user) {
      const apiUser = profileApiResponse.data.user;
      setProfileData({
        name: apiUser.name || "",
        email: apiUser.email || "",
        phone: apiUser.phone || "",
        role: apiUser.role || "staff",
      })
    }
  }, [profileApiResponse]);


  // ✅ Menghubungkan mutation ke API backend
  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (response) => {
      toast.success("Profil berhasil diperbarui");
      // Perbarui data di cache react-query dan context
      queryClient.setQueryData(['userProfile'], response);
      if (response.data?.user) {
        updateUser(response.data.user);
      }
    },
    onError: () => {
      toast.error("Gagal memperbarui profil");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authAPI.changePassword,
    onSuccess: () => {
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password berhasil diubah");
    },
    onError: (error: any) => {
      // Pesan error dari backend akan otomatis ditampilkan oleh interceptor axios
    },
  });

  // ✅ Handler submit yang sudah terhubung
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name: profileData.name, email: profileData.email, phone: profileData.phone });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak sama");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  // ... (fungsi avatar upload dan data aktivitas statis tidak berubah)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateUser({ avatar: e.target?.result as string });
        toast.success("Avatar berhasil diperbarui");
      };
      reader.readAsDataURL(file);
    }
  }

  const recentActivity = [
    { id: 1, action: "Login ke sistem", timestamp: "2024-07-06 09:30:00", ip: "192.168.1.100", device: "Chrome on Windows" },
    { id: 2, action: "Mengubah data pasien", timestamp: "2024-07-06 10:15:00", ip: "192.168.1.100", device: "Chrome on Windows" },
    { id: 3, action: "Export laporan bulanan", timestamp: "2024-07-05 11:00:00", ip: "192.168.1.100", device: "Chrome on Windows" },
  ]


  if (isProfileLoading) {
    return <div>Memuat data profil...</div>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Akun Saya</h1>
        <p className="text-slate-500">Kelola informasi akun dan pengaturan keamanan Anda.</p>
      </div>

      <SectionCard title="Informasi Profil" icon={UserIcon}>
        {/* ... (bagian avatar tidak berubah) */}
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="relative h-24 w-24">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-4xl font-semibold text-white">
              {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "A"}</span>}
            </div>
            <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-slate-100 p-1.5 text-slate-600 ring-4 ring-white transition hover:bg-slate-200">
              <Upload size={16} />
              <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput label="Nama Lengkap" type="text" value={profileData.name} onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))} required />
            <FormInput label="Email" type="email" value={profileData.email} onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))} required />
            <FormInput label="Nomor Telepon" type="tel" value={profileData.phone} onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))} />
            {/* ✅ Menggunakan 'role' dari database dan membuatnya tidak bisa diubah */}
            <FormInput label="Posisi" type="text" value={profileData.role} disabled />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50" disabled={updateProfileMutation.isPending}>
              <Save size={16} />
              {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Ubah Password" icon={Shield}>
         {/* ... (form ubah password tidak berubah, karena sudah terhubung ke mutation) */}
         <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="relative">
            <FormInput label="Password Lama" type={showPassword ? "text" : "password"} value={passwordData.currentPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} required />
            <button type="button" className="absolute right-3 top-[33px] text-slate-500 hover:text-slate-800" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <div className="relative">
            <FormInput label="Password Baru" type={showNewPassword ? "text" : "password"} value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} required minLength={6} />
            <button type="button" className="absolute right-3 top-[33px] text-slate-500 hover:text-slate-800" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <FormInput label="Konfirmasi Password Baru" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} required minLength={6} />
          <div className="flex justify-end">
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50" disabled={changePasswordMutation.isPending}>
              <Shield size={16} />
              {changePasswordMutation.isPending ? "Mengubah..." : "Ubah Password"}
            </button>
          </div>
        </form>
      </SectionCard>
      
      <SectionCard title="Aktivitas Terbaru" icon={Activity}>
        {/* ... (bagian aktivitas terbaru tidak berubah) */}
        <ul className="space-y-3">
          {recentActivity.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Clock size={16} /></div>
              <div>
                <p className="font-medium text-slate-800">{activity.action}</p>
                <p className="text-xs text-slate-500">{`${activity.timestamp} • ${activity.ip} • ${activity.device}`}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}

export default Akun