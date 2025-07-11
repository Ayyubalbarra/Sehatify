import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"
import toast from "react-hot-toast"
// [FIX] Mengimpor dari folder '../types', bukan file '../types.ts'
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  AuthResponse,
  LoginCredentials,
  DashboardInsights,
  Patient,
  Doctor,
  InventoryItem,
  Queue,
  Visit,
  FilterOptions,
} from "../types" 

// Buat instance axios
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1",
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
      window.location.href = "/login"
      toast.error("Sesi berakhir. Silakan login kembali.")
    } else {
      if (error.response?.status !== 404) {
        toast.error(message)
      }
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials)
    return response.data
  },
  // ... fungsi auth lainnya
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

// ...dan API lainnya

export default api