"use client"

import type React from "react"
import { useState } from "react"
import { Save, Bell, Shield, Database, Palette, Globe, Mail, Smartphone } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useNotifications } from "../contexts/NotificationContext"

// Komponen Helper untuk konsistensi
const SectionCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; actions?: React.ReactNode }> = ({ title, icon: Icon, children, actions }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
      <div className="flex items-center gap-3">
        <Icon className="text-slate-600" size={20} />
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
      {actions && <div>{actions}</div>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input 
            className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            {...props} 
        />
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select 
            className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            {...props}
        >
            {children}
        </select>
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; title: string; description: string; icon: React.ElementType; }> = ({ checked, onChange, title, description, icon: Icon }) => (
    <label className="flex cursor-pointer items-center justify-between">
        <div className="flex items-center gap-3">
            <Icon size={20} className="text-slate-500" />
            <div>
                <p className="font-medium text-slate-800">{title}</p>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        </div>
        <div className="relative">
            <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
            <div className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600"></div>
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-full"></div>
        </div>
    </label>
);

const Settings: React.FC = () => {
  const { addNotification } = useNotifications()

  const [generalSettings, setGeneralSettings] = useState({ hospitalName: "Rumah Sakit Sehatify", hospitalAddress: "Jl. Kesehatan No. 123, Jakarta", hospitalPhone: "+62 21 1234 5678", hospitalEmail: "info@sehatify.com", timezone: "Asia/Jakarta", language: "id" });
  const [notificationSettings, setNotificationSettings] = useState({ emailNotifications: true, pushNotifications: true, smsNotifications: false, lowStockAlerts: true, appointmentReminders: true });
  const [securitySettings, setSecuritySettings] = useState({ twoFactorAuth: false, sessionTimeout: 30, passwordExpiry: 90 });
  const [themeSettings, setThemeSettings] = useState({ theme: "light", primaryColor: "#3B82F6" });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => { await new Promise(resolve => setTimeout(resolve, 1000)); return { success: true } },
    onSuccess: () => { toast.success("Pengaturan berhasil disimpan"); addNotification({ type: "success", title: "Pengaturan Disimpan", message: "Semua perubahan telah berhasil disimpan." }) },
    onError: () => { toast.error("Gagal menyimpan pengaturan") },
  })

  const handleSaveSettings = () => saveSettingsMutation.mutate({ general: generalSettings, notifications: notificationSettings, security: securitySettings, theme: themeSettings });
  const testNotification = () => { addNotification({ type: "info", title: "Test Notifikasi", message: "Ini adalah notifikasi percobaan." }); toast.success("Test notifikasi berhasil dikirim") };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pengaturan</h1>
          <p className="text-slate-500">Kelola pengaturan umum, notifikasi, dan keamanan sistem Anda.</p>
        </div>
        <button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50 md:w-auto">
          <Save size={16} />
          {saveSettingsMutation.isPending ? "Menyimpan..." : "Simpan Semua Pengaturan"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
        <div className="space-y-8 lg:col-span-2">
          <SectionCard title="Pengaturan Umum" icon={Globe}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput label="Nama Rumah Sakit" value={generalSettings.hospitalName} onChange={(e) => setGeneralSettings(prev => ({ ...prev, hospitalName: e.target.value }))} />
              <FormInput label="Email" type="email" value={generalSettings.hospitalEmail} onChange={(e) => setGeneralSettings(prev => ({ ...prev, hospitalEmail: e.target.value }))} />
              <div className="sm:col-span-2">
                <FormInput label="Alamat" value={generalSettings.hospitalAddress} onChange={(e) => setGeneralSettings(prev => ({ ...prev, hospitalAddress: e.target.value }))} />
              </div>
              <FormSelect label="Zona Waktu" value={generalSettings.timezone} onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}>
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </FormSelect>
              <FormSelect label="Bahasa" value={generalSettings.language} onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}>
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </FormSelect>
            </div>
          </SectionCard>

          <SectionCard title="Pengaturan Tema" icon={Palette}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormSelect label="Mode Tampilan" value={themeSettings.theme} onChange={(e) => setThemeSettings(prev => ({ ...prev, theme: e.target.value }))}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                  </FormSelect>
                  <div className="flex items-end gap-2">
                      <FormInput label="Warna Utama" type="text" value={themeSettings.primaryColor} onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))} />
                      <input type="color" value={themeSettings.primaryColor} onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))} className="h-10 w-10 cursor-pointer rounded-md border border-slate-300 bg-white p-1" />
                  </div>
              </div>
          </SectionCard>
        </div>
        
        <div className="space-y-8 lg:col-span-1">
            <SectionCard title="Notifikasi" icon={Bell} actions={
                <button onClick={testNotification} className="rounded-md bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300">Test</button>
            }>
                <div className="space-y-4">
                    <ToggleSwitch icon={Mail} title="Notifikasi Email" description="Terima notifikasi via email" checked={notificationSettings.emailNotifications} onChange={(e) => setNotificationSettings(prev => ({...prev, emailNotifications: e.target.checked}))} />
                    <ToggleSwitch icon={Bell} title="Push Notifications" description="Notifikasi di browser" checked={notificationSettings.pushNotifications} onChange={(e) => setNotificationSettings(prev => ({...prev, pushNotifications: e.target.checked}))} />
                    <ToggleSwitch icon={Smartphone} title="Notifikasi SMS" description="Notifikasi via SMS" checked={notificationSettings.smsNotifications} onChange={(e) => setNotificationSettings(prev => ({...prev, smsNotifications: e.target.checked}))} />
                </div>
            </SectionCard>

            <SectionCard title="Keamanan" icon={Shield}>
                <div className="space-y-4">
                    <ToggleSwitch icon={Shield} title="Two-Factor Auth" description="Aktifkan keamanan 2FA" checked={securitySettings.twoFactorAuth} onChange={(e) => setSecuritySettings(prev => ({...prev, twoFactorAuth: e.target.checked}))} />
                    <FormInput label="Session Timeout (menit)" type="number" min="5" value={securitySettings.sessionTimeout} onChange={(e) => setSecuritySettings(prev => ({...prev, sessionTimeout: parseInt(e.target.value)}))} />
                    <FormInput label="Password Expiry (hari)" type="number" min="30" value={securitySettings.passwordExpiry} onChange={(e) => setSecuritySettings(prev => ({...prev, passwordExpiry: parseInt(e.target.value)}))} />
                </div>
            </SectionCard>
        </div>
      </div>
    </div>
  )
}

export default Settings
