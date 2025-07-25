// apps/admin/frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";
import { authAPI } from "../services/api"; 
import { User, LoginCredentials, AuthResponse } from "../types"; 

interface AuthContextType {
  user: User | null; 
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
        const savedToken = localStorage.getItem("authToken"); // ✅ Menggunakan "authToken"
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
          const parsedUser: User = JSON.parse(savedUser); 
          setToken(savedToken);
          setUser(parsedUser);

          try {
            const response = await authAPI.verifyToken(); 
            if (response.success && response.data?.user) {
              setUser(response.data.user);
              localStorage.setItem("user", JSON.stringify(response.data.user)); 
            } else {
              localStorage.removeItem("authToken"); // ✅ Menggunakan "authToken"
              localStorage.removeItem("user");
              setToken(null);
              setUser(null);
            }
          } catch (error) {
            console.error("Admin token verification failed:", error);
            localStorage.removeItem("authToken"); // ✅ Menggunakan "authToken"
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing admin auth state:", error);
        localStorage.removeItem("authToken"); // ✅ Menggunakan "authToken"
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
      const response: AuthResponse = await authAPI.login(credentials); 

      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData); 
        setToken(userToken);
        localStorage.setItem("authToken", userToken); // ✅ Menggunakan "authToken"
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(`Selamat datang, ${userData.name || 'Admin'}!`); 
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
      const response: AuthResponse = await authAPI.demoLogin(); 

      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("authToken", userToken); // ✅ Menggunakan "authToken"
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(`Login demo berhasil! Selamat datang, ${userData.name}`); 
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
    localStorage.removeItem("authToken"); // ✅ Menggunakan "authToken"
    localStorage.removeItem("user");
    toast.success("Anda telah logout");
    window.location.href = "/login"; 
  };

  const updateUser = async (userData: Partial<User>) => { 
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
      const response = await authAPI.getProfile(); 
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