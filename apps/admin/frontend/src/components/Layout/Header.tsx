// apps/admin/frontend/src/components/Layout/Header.tsx

import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import { useNotifications } from '../../contexts/NotificationContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [isAccountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    if (pathname === '/dashboard') return 'Dashboard Overview';
    const name = pathname.split('/').pop()?.replace(/-/g, ' ') || '';
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;
    
    // Logika pencarian: Arahkan ke halaman data pasien dengan query pencarian
    // Anda bisa mengembangkan ini untuk mencari di halaman lain
    console.log("Mencari:", searchQuery);
    navigate(`/data-pasien?search=${searchQuery}`);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 lg:hidden" // Sembunyikan di layar besar
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {getPageTitle(location.pathname)}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pasien..."
              className="w-64 rounded-lg border bg-gray-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>

          {/* Notification Bell & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!isNotificationOpen)}
              className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
            >
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-pink-500"></span>
                </span>
              )}
              <Bell className="h-6 w-6" />
            </button>
            
            {isNotificationOpen && (
              <NotificationDropdown onClose={() => setNotificationOpen(false)} />
            )}
          </div>

          {/* User Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setAccountDropdownOpen(!isAccountDropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100"
            >
              <img
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
                alt="User Avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isAccountDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <Link to="/akun" onClick={() => setAccountDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User className="h-4 w-4" />
                    Profil Saya
                  </Link>
                  <Link to="/settings" onClick={() => setAccountDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="h-4 w-4" />
                    Pengaturan
                  </Link>
                  <div className="my-1 h-px bg-gray-200" />
                  <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-pink-600 hover:bg-pink-50">
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
