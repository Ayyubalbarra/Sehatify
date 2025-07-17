// apps/admin/frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";
import { authAPI } from "../services/api"; // Menggunakan authAPI untuk admin
import { User, LoginCredentials, AuthResponse } from "../types"; // Import User dari ../types

interface AuthContextType {
  user: User | null; // Pastikan ini User
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
          const parsedUser: User = JSON.parse(savedUser); // Pastikan ini User
          setToken(savedToken);
          setUser(parsedUser);

          try {
            const response = await authAPI.verifyToken(); // Memanggil verifyToken dari authAPI admin
            if (response.success && response.data?.user) {
              setUser(response.data.user);
              localStorage.setItem("user", JSON.stringify(response.data.user)); 
            } else {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setToken(null);
              setUser(null);
            }
          } catch (error) {
            console.error("Admin token verification failed:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing admin auth state:", error);
        localStorage.removeItem("token");
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
      const response: AuthResponse = await authAPI.login(credentials); // Respons harus User

      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData); // userData sekarang adalah User
        setToken(userToken);
        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(`Selamat datang, ${userData.name || 'Admin'}!`); // Gunakan userData.name
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

  const demoLogin = async () => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authAPI.demoLogin(); // Respons harus User

      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(`Login demo berhasil! Selamat datang, ${userData.name}`); // Gunakan userData.name
      } else {
        throw new Error(response.message || "Login demo gagal");
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Anda telah logout");
    window.location.href = "/login"; 
  };

  const updateUser = async (userData: Partial<User>) => { // userData adalah Partial<User>
    try {
      setIsLoading(true);
      const response = await authAPI.updateProfile(userData); 

      if (response.success && response.data?.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profil berhasil diperbarui");
      } else {
        throw new Error(response.message || "Gagal memperbarui profil");
      }
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
      const response = await authAPI.getProfile(); // Mengembalikan User
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error("Error refreshing admin user:", error);
    }
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    demoLogin,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};