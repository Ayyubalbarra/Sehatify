// apps/admin/frontend/src/services/api.ts

import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"
import toast from "react-hot-toast"
import type {
  ApiResponse,
  User, 
  AuthResponse,
  LoginCredentials,
} from "../types" 

// Buat instance axios
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1", // Pastikan ini benar
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor untuk menangani error global
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.message || error.message || "An error occurred"
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      if (window.location.pathname !== '/login') {
        window.location.href = "/login"
      }
      toast.error("Sesi berakhir. Silakan login kembali.")
    } else if (error.code !== "ERR_CANCELED") {
        toast.error(message)
    }
    return Promise.reject(error)
  },
)

// Auth API untuk Admin
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/admin/login", credentials) 
    return response.data
  },
  demoLogin: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/admin/demo-login") 
    return response.data
  },
  verifyToken: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>("/auth/admin/verify-token")
    return response.data
  },
  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>("/auth/admin/profile", userData)
    return response.data
  },
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>("/auth/admin/profile")
    return response.data
  },
}

// Dashboard API
export const dashboardAPI = {
  getOverview: async (): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>("/dashboard/overview")
    return response.data
  },
  getChartData: async (type: string): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>(`/dashboard/charts?type=${type}`)
    return response.data
  },
}

export default api