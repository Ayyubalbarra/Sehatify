import type React from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, Stethoscope, Package, Calendar, BarChart3, Settings, User } from "lucide-react"

interface SidebarProps {
  collapsed: boolean
  onToggle?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const menuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/data-pasien", icon: Users, label: "Data Pasien" },
    { path: "/layanan-medis", icon: Stethoscope, label: "Layanan Medis" },
    { path: "/stok-medis", icon: Package, label: "Stok Medis" },
    { path: "/jadwal-sdm", icon: Calendar, label: "Jadwal dan SDM" },
    { path: "/laporan-analisis", icon: BarChart3, label: "Laporan & Analisis" },
  ]

  const bottomMenuItems = [
    { path: "/settings", icon: Settings, label: "Settings" },
    { path: "/akun", icon: User, label: "Akun" },
  ]

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center border-b px-6">
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${collapsed ? "w-0" : "w-full"}`}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
              <path d="M16 2L26 8V24L16 30L6 24V8L16 2Z" fill="#3B82F6" />
              <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" fill="white" />
            </svg>
            <span className="text-xl font-bold text-slate-800">Sehatify</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <div className="flex-1">
          <span className={`mb-2 block px-4 text-xs font-semibold uppercase text-slate-400 ${collapsed && "hidden"}`}>Menu</span>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} className={navLinkClass}>
                  <item.icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
           <span className={`mb-2 block px-4 text-xs font-semibold uppercase text-slate-400 ${collapsed && "hidden"}`}>Lainnya</span>
          <ul className="space-y-1">
            {bottomMenuItems.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} className={navLinkClass}>
                  <item.icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
