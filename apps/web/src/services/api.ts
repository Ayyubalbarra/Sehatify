// apps/web/src/services/api.ts

import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"
import toast from "react-hot-toast"
import type {
  ApiResponse,
  Patient, // Ini adalah Patient dari web/types/index.ts
  AuthResponse,
  LoginCredentials,
  Doctor, // Dari web/types/index.ts
  Hospital, // Dari web/types/index.ts
  Appointment, // Dari web/types/index.ts
  MedicalRecord, // Dari web/types/index.ts
} from "../types" // Sesuaikan path ini jika types berada di folder lain

// --- Interfaces tambahan yang mungkin dibutuhkan dari backend ---
// Ini akan mencerminkan respons dari Polyclinic dan Schedule API
export interface PolyclinicData {
  _id: string;
  polyclinicId: string;
  name: string;
  department: string; // Bisa lebih spesifik jika ada enum
  // ... properti lain dari IPolyclinic yang ingin Anda gunakan
}

export interface DoctorDataFromAPI extends Doctor { // Ekstensi dari Doctor di types/index.ts
  _id: string; // Dokter dari backend akan memiliki _id
  specialization: string; // Pastikan ini sesuai dengan backend
  // Tambahkan properti lain dari User (model Doctor di backend) yang relevan
}

export interface ScheduleData {
  _id: string;
  scheduleId: string;
  doctorId: string; // Atau object ID
  polyclinicId: string | { _id: string, name: string }; // Bisa berupa ID atau populated object
  date: string; // Atau Date, tergantung bagaimana Anda ingin menanganinya
  startTime: string;
  endTime: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  // ... properti lain dari ISchedule
}


// Buat instance axios
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    // Untuk frontend web, gunakan 'authToken'
    const token = localStorage.getItem("authToken") 
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
    const message = (error.response?.data as any)?.message || error.message || "Terjadi kesalahan"
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken") // Hapus authToken
      localStorage.removeItem("user")
      if (window.location.pathname !== '/login') {
        window.location.href = "/login" // Arahkan ke halaman login pasien
      }
      toast.error("Sesi berakhir. Silakan login kembali.")
    } else if (error.code !== "ERR_CANCELED") {
        toast.error(message)
    }
    return Promise.reject(error)
  },
)

// --- Patient Auth API (untuk POV User) ---
export const patientAuthAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/patient/login", credentials) 
    return response.data
  },
  register: async (credentials: any): Promise<ApiResponse<Patient>> => {
    const response = await api.post<ApiResponse<Patient>>("/auth/patient/register", credentials) 
    return response.data
  },
  verifyToken: async (): Promise<ApiResponse<{ user: Patient }>> => {
    const response = await api.get<ApiResponse<{ user: Patient }>>("/auth/patient/verify-token")
    return response.data
  },
  // Tambahkan endpoint lain untuk profile pasien jika ada
}

// --- Hospital API (Jika ada model di backend) ---
export const hospitalAPI = {
  // Anda akan membuat endpoint di backend jika ingin mengelola rumah sakit secara dinamis
  // Untuk saat ini, data rumah sakit masih dari mock data
  // Contoh:
  // getHospitals: async (): Promise<ApiResponse<Hospital[]>> => {
  //   const response = await api.get<ApiResponse<Hospital[]>>("/hospitals");
  //   return response.data;
  // },
}


// --- Polyclinic API ---
export const polyclinicAPI = {
  getAllPolyclinics: async (): Promise<ApiResponse<PolyclinicData[]>> => {
    const response = await api.get<ApiResponse<PolyclinicData[]>>("/polyclinics");
    return response.data;
  },
  getDepartments: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get<ApiResponse<string[]>>("/polyclinics/departments");
    return response.data;
  },
  getPolyclinicById: async (id: string): Promise<ApiResponse<PolyclinicData>> => {
    const response = await api.get<ApiResponse<PolyclinicData>>(`/polyclinics/${id}`);
    return response.data;
  },
}

// --- Doctor API (untuk frontend web/pasien) ---
export const doctorAPI = {
  getDoctorsBySpecialization: async (
    specialization: string = "", 
    search: string = ""
  ): Promise<ApiResponse<DoctorDataFromAPI[]>> => {
    // Asumsi getAllDoctors di backend bisa difilter berdasarkan spesialisasi
    const response = await api.get<ApiResponse<DoctorDataFromAPI[]>>("/doctors", {
      params: { specialization, search, limit: 100 } // Ambil lebih banyak atau tambahkan paginasi jika perlu
    });
    return response.data;
  },
  getDoctorSchedules: async (
    doctorId: string, 
    date?: string, 
    polyclinicId?: string
  ): Promise<ApiResponse<ScheduleData[]>> => {
    const response = await api.get<ApiResponse<ScheduleData[]>>(`/doctors/${doctorId}/schedule`, {
      params: { date, polyclinicId }
    });
    return response.data;
  },
}

// --- Queue/Appointment API ---
export const appointmentAPI = {
  createAppointment: async (appointmentData: {
    patientId: string;
    doctorId: string;
    polyclinicId: string;
    scheduleId: string;
    notes?: string;
  }): Promise<ApiResponse<Appointment>> => {
    const response = await api.post<ApiResponse<Appointment>>("/queues", appointmentData);
    return response.data;
  },
  // Anda mungkin perlu endpoint untuk melihat appointment pasien, cancel, dll.
  // getPatientAppointments: async (patientId: string): Promise<ApiResponse<Appointment[]>> => {
  //   const response = await api.get<ApiResponse<Appointment[]>>(`/patients/${patientId}/appointments`);
  //   return response.data;
  // }
}


// --- Medical Records API (untuk POV User) ---
export const medicalRecordAPI = {
  getPatientMedicalRecords: async (
    patientId: string, 
    search: string = "", 
    sortBy: string = "visitDate"
  ): Promise<ApiResponse<MedicalRecord[]>> => {
    // Anda perlu membuat endpoint ini di backend Anda
    // Misalnya, di patientController atau medicalRecordController baru
    // Untuk saat ini, kita akan mock atau mengambil dari endpoint pasien jika data rekam medis ada di sana
    console.warn("Medical Record API not fully implemented in backend. Using mock or patient endpoint if available.");
    // Contoh: return api.get<ApiResponse<MedicalRecord[]>>(`/patients/${patientId}/medical-records`);
    // Placeholder:
    return new Promise(resolve => setTimeout(() => resolve({
      success: true,
      data: [] // Ganti dengan mock data atau data dari API sebenarnya
    }), 500));
  }
}

export default api;