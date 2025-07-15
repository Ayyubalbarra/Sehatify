// apps/admin/frontend/src/services/api.ts

import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"
import toast from "react-hot-toast"
import type {
  ApiResponse,
  User, 
  AuthResponse,
  LoginCredentials,
} from "../types" 

export interface PatientData { 
  _id: string;
  patientId?: string; // patientId dari Patient.ts yang lama, atau bisa dihapus jika hanya _id yang relevan
  fullName: string; // Menggunakan fullName sesuai PatientUser.model
  nik?: string; // Opsional jika tidak ada di PatientUser.model
  dateOfBirth: string;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  registrationDate: string;
  status: 'Active' | 'Inactive'; // Jika PatientUser punya status
  lastVisit?: string;
  age?: number;
  recentVisits?: any[]; 
  lifetimeValue?: number;
}

export interface PatientStatsData {
  total: number;
  active: number;
  new: number;
  genderStats: Array<{ _id: string; count: number }>;
}

export interface PatientsApiResponse {
  success: boolean;
  data: PatientData[]; 
  pagination: { currentPage: number; totalPages: number; total: number }; 
}

export interface PatientStatsApiResponse {
  success: boolean;
  data: PatientStatsData;
}


const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1", 
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

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

export const patientAPI = {
  getPatients: async (
    page: number = 1, 
    limit: number = 10, 
    search: string = "", 
    status: string = "all"
  ): Promise<PatientsApiResponse> => {
    const response = await api.get<PatientsApiResponse>("/patients", {
      params: { page, limit, search, status }
    });
    return response.data;
  },
  getPatientStats: async (): Promise<PatientStatsApiResponse> => {
    const response = await api.get<PatientStatsApiResponse>("/patients/stats");
    return response.data;
  },
  createPatient: async (patientData: any): Promise<ApiResponse<PatientData>> => {
    const response = await api.post<ApiResponse<PatientData>>("/patients", patientData);
    return response.data;
  },
  updatePatient: async (patientId: string, patientData: any): Promise<ApiResponse<PatientData>> => {
    const response = await api.put<ApiResponse<PatientData>>(`/patients/${patientId}`, patientData);
    return response.data;
  },
  deletePatient: async (patientId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/patients/${patientId}`);
    return response.data;
  },
  getPatientById: async (patientId: string): Promise<ApiResponse<PatientData>> => {
    const response = await api.get<ApiResponse<PatientData>>(`/patients/${patientId}`);
    return response.data;
  }
}

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