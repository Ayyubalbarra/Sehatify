// apps/web/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";
import { patientAuthAPI } from "../services/api"; 
import { Patient, LoginCredentials, AuthResponse, ApiResponse } from "../types";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: Patient | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: Omit<Patient, '_id'>) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<Patient>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Patient | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("authToken"); 

      if (savedToken) {
        try {
          // ✅ PERBAIKAN: Verifikasi token terlebih dahulu
          const response: ApiResponse<{ user: Patient }> = await patientAuthAPI.verifyToken();
          
          if (response.success && response.data?.user) {
            // ✅ BARU SETELAH ITU: Atur state jika token valid
            setToken(savedToken);
            setUser(response.data.user);
            localStorage.setItem("authUser", JSON.stringify(response.data.user));
          } else {
            // Jika verifikasi gagal, bersihkan semuanya
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
          }
        } catch (error) {
          console.error("Token verification failed, logging out:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUser");
        }
      }
      
      // Selesaikan loading setelah semua proses selesai
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await patientAuthAPI.login(credentials);

      if (response.success && response.data?.user && response.data?.token) {
        const { user: userData, token: userToken } = response.data;
        
        setToken(userToken);
        setUser(userData); 
        localStorage.setItem("authToken", userToken);
        localStorage.setItem("authUser", JSON.stringify(userData));
        toast.success(`Selamat datang, ${userData.fullName || 'Pasien'}!`);
      } else {
        throw new Error(response.message || "Login gagal");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Terjadi kesalahan";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: Omit<Patient, '_id'>) => {
    try {
      setIsLoading(true);
      const response = await patientAuthAPI.register(credentials as any);
      if (response.success) {
        toast.success(response.message || "Pendaftaran berhasil! Silakan login.");
      } else {
        throw new Error(response.message || "Pendaftaran gagal");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Terjadi kesalahan";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    toast.success("Anda telah logout");
    navigate("/login"); 
  };

  const updateUser = async (userData: Partial<Patient>) => {
    // Implementasi di masa depan
  };

  const refreshUser = async () => {
    // Fungsi ini bisa jadi tidak diperlukan lagi dengan alur baru,
    // tapi kita biarkan untuk pemanggilan manual jika dibutuhkan
    try {
      const response: ApiResponse<{ user: Patient }> = await patientAuthAPI.getProfile();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem("authUser", JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error("Error refreshing patient user:", error);
    }
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};