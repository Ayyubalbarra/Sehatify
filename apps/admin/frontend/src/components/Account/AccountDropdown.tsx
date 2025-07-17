// apps/admin/frontend/src/components/Account/AccountDropdown.tsx

"use client"

import type React from "react"
import { User, Settings, LogOut, Shield, HelpCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

interface AccountDropdownProps {
  onClose: () => void
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({ onClose }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleMenuClick = (path?: string) => {
    if (path) {
      navigate(path)
    }
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
    navigate("/")
  }

  const menuItemClass = "flex w-full items-center gap-3 px-5 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
  
  return (
    <div className="absolute right-0 top-full mt-2 w-72 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg z-50">
      {/* Header Dropdown */}
      <div className="border-b border-slate-200 p-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold text-white">
          {user?.avatar ? ( 
            <img 
              src={user.avatar} 
              alt={user.name || "User Avatar"} 
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span>{(user?.name?.charAt(0) || "A").toUpperCase()}</span>
          )}
        </div>
        <div className="text-center">
          <p className="mb-1 text-base font-semibold text-slate-800">{user?.name || "Administrator"}</p>
          <p className="mb-2 text-sm text-slate-500">{user?.email || "admin@sehatify.com"}</p>
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            {user?.role || "Super Admin"}
          </span>
        </div>
      </div>

      {/* Menu Akun */}
      <div className="py-2">
        <button className={menuItemClass} onClick={() => handleMenuClick("/akun")}>
          <User size={16} />
          <span>Profil Saya</span>
        </button>
        <button className={menuItemClass} onClick={() => handleMenuClick("/settings")}>
          <Settings size={16} />
          <span>Pengaturan</span>
        </button>
        <button className={menuItemClass} onClick={() => handleMenuClick()}>
          <Shield size={16} />
          <span>Keamanan</span>
        </button>
        <button className={menuItemClass} onClick={() => handleMenuClick()}>
          <HelpCircle size={16} />
          <span>Bantuan</span>
        </button>
      </div>

      {/* Footer Dropdown (Logout) */}
      <div className="border-t border-slate-200 p-2">
        <button 
          className="flex w-full items-center gap-3 rounded-md px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50" 
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}

export default AccountDropdown