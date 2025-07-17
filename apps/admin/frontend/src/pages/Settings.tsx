// apps/admin/frontend/src/pages/Settings.tsx

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Save, Bell, Shield, Globe, Palette, Loader2, Info } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useAuth } from "../contexts/AuthContext"
import { settingAPI, authAPI } from "../services/api"
import type { Setting, User } from "../types"

// Komponen Helper (tidak berubah)
const SectionCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; }> = ({ title, icon: Icon, children }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 p-4">
      <Icon className="text-slate-600" size={20} />
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" {...props} />
    </div>
);
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" {...props}>{children}</select>
    </div>
);
const ToggleSwitch: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; title: string; }> = ({ checked, onChange, title }) => (
    <label className="flex cursor-pointer items-center justify-between">
        <p className="font-medium text-slate-800">{title}</p>
        <div className="relative">
            <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
            <div className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600"></div>
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-full"></div>
        </div>
    </label>
);


const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [globalSettings, setGlobalSettings] = useState<Partial<Setting>>({});
  const [personalSettings, setPersonalSettings] = useState({
    notifications: { email: true, push: true },
    twoFactorEnabled: false
  });

  const { data: globalSettingsResponse, isLoading: isLoadingGlobal } = useQuery({
    queryKey: ['settings'],
    queryFn: settingAPI.getSettings,
    enabled: user?.role === 'Super Admin',
  });

  useEffect(() => {
    if (globalSettingsResponse?.data) {
      setGlobalSettings(globalSettingsResponse.data);
    }
    if (user) {
      setPersonalSettings({
        notifications: user.notifications,
        twoFactorEnabled: user.twoFactorEnabled
      });
    }
  }, [globalSettingsResponse, user]);

  const updateGlobalMutation = useMutation({
    mutationFn: (settingsData: Partial<Setting>) => settingAPI.updateSettings(settingsData),
    onSuccess: (response) => {
      toast.success("Pengaturan aplikasi berhasil disimpan");
      queryClient.setQueryData(['settings'], response);
    },
    onError: () => toast.error("Gagal menyimpan pengaturan aplikasi"),
  });

  const updatePersonalMutation = useMutation({
    mutationFn: (settingsData: Partial<User>) => authAPI.updateProfile(settingsData),
    onSuccess: (response) => {
      toast.success("Preferensi akun berhasil disimpan");
      if (response.data?.user) updateUser(response.data.user);
    },
    onError: () => toast.error("Gagal menyimpan preferensi akun"),
  });

  const handleSaveAll = () => {
    if (user?.role === 'Super Admin') {
      updateGlobalMutation.mutate(globalSettings);
    }
    updatePersonalMutation.mutate(personalSettings);
  };

  const isSaving = updateGlobalMutation.isPending || updatePersonalMutation.isPending;

  if (isLoadingGlobal && user?.role === 'Super Admin') {
    return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Memuat Pengaturan...</div>;
  }
  
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pengaturan</h1>
          <p className="text-slate-500">Kelola pengaturan aplikasi global dan preferensi akun personal Anda.</p>
        </div>
        <button onClick={handleSaveAll} disabled={isSaving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50 md:w-auto">
          <Save size={16} />
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {user?.role === 'Super Admin' && (
        <SectionCard title="Pengaturan Aplikasi (Global)" icon={Globe}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput label="Nama Rumah Sakit" value={globalSettings.hospitalName || ''} onChange={(e) => setGlobalSettings(p => ({...p, hospitalName: e.target.value}))} />
            <FormInput label="Email Kontak" type="email" value={globalSettings.hospitalEmail || ''} onChange={(e) => setGlobalSettings(p => ({...p, hospitalEmail: e.target.value}))} />
            <div className="sm:col-span-2"><FormInput label="Alamat" value={globalSettings.hospitalAddress || ''} onChange={(e) => setGlobalSettings(p => ({...p, hospitalAddress: e.target.value}))} /></div>
            <FormSelect label="Zona Waktu" value={globalSettings.timezone || 'Asia/Jakarta'} onChange={(e) => setGlobalSettings(p => ({...p, timezone: e.target.value}))}>
              <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
              <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
              <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
            </FormSelect>
            <FormSelect label="Bahasa" value={globalSettings.language || 'id'} onChange={(e) => setGlobalSettings(p => ({...p, language: e.target.value}))}>
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </FormSelect>
          </div>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:items-start">
        <SectionCard title="Preferensi Akun (Personal)" icon={Bell}>
            <div className="space-y-4">
                <p className="text-sm text-slate-600">Pengaturan ini hanya berlaku untuk akun Anda.</p>
                <ToggleSwitch title="Notifikasi Email" checked={personalSettings.notifications.email} onChange={(e) => setPersonalSettings(p => ({...p, notifications: {...p.notifications, email: e.target.checked}}))} />
                <ToggleSwitch title="Notifikasi Browser" checked={personalSettings.notifications.push} onChange={(e) => setPersonalSettings(p => ({...p, notifications: {...p.notifications, push: e.target.checked}}))} />
            </div>
        </SectionCard>
        
        <SectionCard title="Keamanan" icon={Shield}>
            <div className="space-y-4">
              <ToggleSwitch title="Two-Factor Authentication" checked={personalSettings.twoFactorEnabled} onChange={(e) => setPersonalSettings(p => ({...p, twoFactorEnabled: e.target.checked}))} />
              {user?.role === 'Super Admin' && (<>
                <hr className="my-4"/>
                <p className="text-sm text-slate-600 flex items-center gap-2"><Info size={14}/> Pengaturan di bawah ini adalah global.</p>
                <FormInput label="Session Timeout (menit)" type="number" min="5" value={globalSettings.sessionTimeout || 60} onChange={(e) => setGlobalSettings(p => ({...p, sessionTimeout: parseInt(e.target.value, 10)}))} />
                <FormInput label="Password Expiry (hari)" type="number" min="30" value={globalSettings.passwordExpiry || 90} onChange={(e) => setGlobalSettings(p => ({...p, passwordExpiry: parseInt(e.target.value, 10)}))} />
              </>)}
            </div>
        </SectionCard>
      </div>
    </div>
  )
}

export default Settings;