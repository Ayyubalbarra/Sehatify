// apps/admin/frontend/src/components/Layout/Sidebar.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Calendar,
  HeartPulse,
  Archive,
  LineChart,
} from 'lucide-react';
// --- ▼▼▼ PERBAIKI PATH IMPOR DI SINI ▼▼▼ ---
import Logo from '../../assets/logo.svg?react';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {

  const mainNavLinks = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutGrid },
    { name: 'Data Pasien', to: '/data-pasien', icon: Users },
    { name: 'Jadwal SDM', to: '/jadwal-sdm', icon: Calendar },
    { name: 'Layanan Medis', to: '/layanan-medis', icon: HeartPulse },
    { name: 'Stok Medis', to: '/stok-medis', icon: Archive },
    { name: 'Laporan Analisis', to: '/laporan-analisis', icon: LineChart },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex-shrink-0 bg-white shadow-lg transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-16 flex-shrink-0 items-center justify-center border-b px-4">
           <Logo className="h-8 w-auto text-blue-600" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {!collapsed && (
            <span className="px-4 text-xs font-semibold uppercase text-gray-400">Menu</span>
          )}
          <ul className="mt-2 space-y-2">
            {mainNavLinks.map((item) => (
              <li key={item.name}>
                <NavLink to={item.to} className={navLinkClass} end>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
