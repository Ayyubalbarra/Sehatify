// apps/web/src/components/Navbar.tsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Stethoscope, UserCircle, LogOut } from 'lucide-react'; // Tambah UserCircle, LogOut
import Button from './Button';
import { useAuth } from '../contexts/AuthContext'; // Impor useAuth

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth(); // Ambil user, isAuthenticated, logout dari AuthContext

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Hospitals', path: '/hospitals' },
    { name: 'Articles', path: '/articles' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  // Tambahkan item navigasi yang hanya terlihat saat user login
  const loggedInNavItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Medical Records', path: '/medical-records' },
    { name: 'AI Chatbot', path: '/chatbot' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-medical sticky top-0 z-50 border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-medical-gradient rounded-lg p-2">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Sehatify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors duration-200 font-medium ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-text hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && loggedInNavItems.map((item) => ( // Tampilkan ini jika sudah login
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors duration-200 font-medium ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-text hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons / User Info */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-text font-medium flex items-center">
                  <UserCircle className="h-5 w-5 mr-1 text-primary" />
                  Hello, {user?.fullName || user?.email || 'User'}! {/* Tampilkan nama user */}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-medical-gradient hover:shadow-medical">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text hover:text-primary"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-medical">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'text-primary bg-secondary/50'
                      : 'text-text hover:text-primary hover:bg-secondary/30'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated && loggedInNavItems.map((item) => ( // Tampilkan ini jika sudah login
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'text-primary bg-secondary/50'
                      : 'text-text hover:text-primary hover:bg-secondary/30'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-3 border-t border-primary/10">
                {isAuthenticated ? (
                  <div className="flex flex-col items-start px-3">
                     <span className="text-text font-medium flex items-center mb-2">
                       <UserCircle className="h-5 w-5 mr-1 text-primary" />
                       Hello, {user?.fullName || user?.email || 'User'}!
                     </span>
                     <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
                       <LogOut className="h-4 w-4 mr-1" />
                       Logout
                     </Button>
                  </div>
                ) : (
                  <div className="flex items-center px-3 space-x-3">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm" className="w-full bg-medical-gradient">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;