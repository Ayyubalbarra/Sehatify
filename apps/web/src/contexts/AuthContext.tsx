// apps/web/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";
import { patientAuthAPI } from "../services/api"; // Import patientAuthAPI
import { Patient, LoginCredentials, AuthResponse } from "../types"; // Import tipe Patient

interface AuthContextType {
  user: Patient | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: any) => Promise<void>; // Tambahkan register
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem("authToken"); // Menggunakan authToken
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
          const parsedUser: Patient = JSON.parse(savedUser); // Pastikan tipenya Patient
          setToken(savedToken);
          setUser(parsedUser);

          // Verifikasi token validity (endpoint patient/verify-token)
          try {
            const response = await patientAuthAPI.verifyToken();
            if (response.success && response.data?.user) {
              setUser(response.data.user);
              localStorage.setItem("user", JSON.stringify(response.data.user)); // Update user data jika ada perubahan
            } else {
              // Token invalid atau kedaluwarsa, bersihkan storage
              localStorage.removeItem("authToken");
              localStorage.removeItem("user");
              setToken(null);
              setUser(null);
            }
          } catch (error) {
            console.error("Patient token verification failed:", error);
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing patient auth state:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await patientAuthAPI.login(credentials);

      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData as Patient); // Cast to Patient
        setToken(userToken);
        localStorage.setItem("authToken", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(`Selamat datang, ${userData.fullName || userData.name || 'Pasien'}!`);
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

  const register = async (credentials: any) => {
    try {
      setIsLoading(true);
      const response = await patientAuthAPI.register(credentials);
      if (response.success && response.data) {
        // Setelah register, mungkin langsung login atau arahkan ke halaman login
        // Untuk saat ini, kita bisa arahkan ke login atau tangani token jika dikembalikan
        toast.success(response.message || "Pendaftaran berhasil!");
        // Jika register otomatis login dan mengembalikan token:
        // const { user: userData, token: userToken } = response.data;
        // setUser(userData as Patient);
        // setToken(userToken);
        // localStorage.setItem("authToken", userToken);
        // localStorage.setItem("user", JSON.stringify(userData));
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
    localStorage.removeItem("user");
    toast.success("Anda telah logout");
    window.location.href = "/login"; // Arahkan kembali ke halaman login
  };

  const updateUser = async (userData: Partial<Patient>) => {
    try {
      setIsLoading(true);
      // Endpoint updateProfile untuk pasien belum diimplementasikan di patientAuthAPI.
      // Anda perlu menambahkan ini di apps/web/src/services/api.ts dan apps/api/src/controllers/patientAuthController.ts
      console.warn("Update profile for patient is not yet implemented in API.");
      // const response = await patientAuthAPI.updateProfile(userData); 
      // if (response.success && response.data?.user) {
      //   const updatedUser = response.data.user;
      //   setUser(updatedUser);
      //   localStorage.setItem("user", JSON.stringify(updatedUser));
      //   toast.success("Profil berhasil diperbarui");
      // } else {
      //   throw new Error(response.message || "Gagal memperbarui profil");
      // }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Terjadi kesalahan";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (!token) return;
      const response = await patientAuthAPI.getProfile();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
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