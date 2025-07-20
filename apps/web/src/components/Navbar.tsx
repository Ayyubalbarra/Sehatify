// apps/web/src/components/Navbar.tsx

import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Menu, 
    X, 
    ChevronDown, 
    LayoutDashboard, 
    FileText,
    BrainCircuit,
    UserCircle,
    LogOut 
} from 'lucide-react';
import Button from './Button';

// --- PERUBAHAN DI SINI: Impor logo SVG Anda ---
import logoSvg from '../assets/logo.svg';

// Komponen Dropdown internal untuk kejelasan.
const UserDropdown: React.FC = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const userMenuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Medical Records', path: '/medical-records', icon: FileText },
        { name: 'AI Chatbot', path: '/chatbot', icon: BrainCircuit },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 outline-none rounded-full p-1 pr-2 hover:bg-secondary/30 transition-colors"
            >
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                    <UserCircle className="h-8 w-8 text-primary" />
                )}
                <span className="font-medium text-text hidden sm:block">{user?.fullName || user?.email}</span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                >
                    <div className="py-1" role="none">
                        {userMenuItems.map(item => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) => `flex items-center w-full px-4 py-2 text-sm text-left ${isActive ? 'bg-secondary/30 text-primary' : 'text-text'}`}
                                onClick={() => setIsOpen(false)}
                                role="menuitem"
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </NavLink>
                        ))}
                        <div className="border-t border-primary/10 my-1" />
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                            role="menuitem"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}


const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Hospitals', path: '/hospitals' },
    { name: 'Articles', path: '/articles' },
    { name: 'About Us', path: '/about' },
  ];

  const activeLinkClass = "text-primary font-semibold";
  const inactiveLinkClass = "text-text hover:text-primary";

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-medical sticky top-0 z-50 border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Bagian Kiri: Logo & Navigasi Utama */}
          <div className="flex items-center space-x-8">
            {/* --- PERUBAHAN DI SINI: Mengganti ikon dan teks dengan tag <img> untuk SVG --- */}
            <Link to="/">
              <img src={logoSvg} alt="Sehatify Logo" className="h-9" />
            </Link>

            {/* Navigasi Desktop */}
            <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `transition-colors duration-200 font-medium ${isActive ? activeLinkClass : inactiveLinkClass}`}
                    >
                        {item.name}
                    </NavLink>
                ))}
            </div>
          </div>

          {/* Bagian Kanan: Menu Pengguna atau Tombol Login */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
                <UserDropdown />
            ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-medical-gradient hover:shadow-medical">Register</Button>
                  </Link>
                </div>
            )}
          </div>
          
          {/* Tombol Menu Mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text hover:text-primary">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Navigasi Mobile (Fly-out) */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-primary bg-secondary/50' : 'text-text hover:text-primary hover:bg-secondary/30'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
            
            {/* Pemisah dan Opsi Auth di Mobile */}
            <div className="pt-4 pb-3 border-t border-primary/10">
              {isAuthenticated ? (
                <div className="space-y-1">
                    <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center px-3 py-2 text-text hover:text-primary hover:bg-secondary/30 rounded-md"><LayoutDashboard className="mr-3 h-5 w-5" />Dashboard</NavLink>
                    <NavLink to="/medical-records" onClick={() => setIsMenuOpen(false)} className="flex items-center px-3 py-2 text-text hover:text-primary hover:bg-secondary/30 rounded-md"><FileText className="mr-3 h-5 w-5" />Medical Records</NavLink>
                    <NavLink to="/chatbot" onClick={() => setIsMenuOpen(false)} className="flex items-center px-3 py-2 text-text hover:text-primary hover:bg-secondary/30 rounded-md"><BrainCircuit className="mr-3 h-5 w-5" />AI Chatbot</NavLink>
                    <div className="border-t border-primary/10 my-1" />
                    <button onClick={() => {logout(); setIsMenuOpen(false);}} className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"><LogOut className="mr-3 h-5 w-5" />Logout</button>
                </div>
              ) : (
                <div className="flex items-center justify-around">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-medical-gradient">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;