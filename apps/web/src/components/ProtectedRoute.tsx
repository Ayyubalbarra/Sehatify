// apps/web/src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Tampilkan layar loading saat status autentikasi sedang diperiksa
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Jika tidak terotentikasi, arahkan ke halaman login
    // `state={{ from: location }}` berguna untuk kembali ke halaman ini setelah login berhasil
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika terotentikasi, tampilkan halaman yang seharusnya
  return <>{children}</>;
};

export default ProtectedRoute;