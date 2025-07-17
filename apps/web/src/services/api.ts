// apps/web/src/services/api.ts

import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"
import toast from "react-hot-toast"
import type {
  ApiResponse,
  Patient,
  AuthResponse,
  LoginCredentials,
  Doctor,
  Appointment,
  MedicalRecord,
  Polyclinic,
  Schedule,
  Hospital,
} from "../types" 

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken") 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.message || error.message || "Terjadi kesalahan"
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken") 
      localStorage.removeItem("authUser")
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

// =========================================================
// API SERVICES
// =========================================================

export const patientAuthAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/patient/login", credentials) 
    return response.data
  },
  register: async (credentials: Omit<Patient, '_id'>): Promise<ApiResponse<Patient>> => {
    const response = await api.post<ApiResponse<Patient>>("/auth/patient/register", credentials as any) 
    return response.data;
  },
  verifyToken: async (): Promise<ApiResponse<{ user: Patient }>> => {
    const response = await api.get<ApiResponse<{ user: Patient }>>("/auth/patient/verify-token")
    return response.data;
  },
  getProfile: async (): Promise<ApiResponse<{ user: Patient }>> => { 
    const response = await api.get<ApiResponse<{ user: Patient }>>("/auth/patient/profile");
    return response.data;
  },
};

export const patientAPI = {
  getPatientById: async (patientId: string): Promise<ApiResponse<Patient>> => {
    const response = await api.get<ApiResponse<Patient>>(`/patients/${patientId}`);
    return response.data;
  }
};

export const hospitalAPI = {
  getHospitals: async (): Promise<ApiResponse<Hospital[]>> => {
    const response = await api.get("/hospitals");
    return response.data;
  }
};

export const polyclinicAPI = {
  getPolyclinicsByHospital: async (hospitalId: string): Promise<ApiResponse<Polyclinic[]>> => {
    const response = await api.get(`/polyclinics`, { params: { hospitalId } });
    return response.data;
  },
};

export const doctorAPI = {
  getDoctorsByPolyclinic: async (polyclinicId: string): Promise<ApiResponse<Doctor[]>> => {
    const response = await api.get(`/doctors`, { params: { polyclinicId } });
    return response.data;
  },
};

export const scheduleAPI = {
  getAvailableSchedules: async (doctorId: string, date: string): Promise<ApiResponse<Schedule[]>> => {
    const response = await api.get(`/schedules/available-slots`, { params: { doctorId, date } });
    return response.data;
  },
};

export const appointmentAPI = {
  createAppointment: async (data: { patientId: string; scheduleId: string; }): Promise<ApiResponse<Appointment>> => {
    const response = await api.post('/queues', data);
    return response.data;
  },
  getPatientUpcomingAppointments: async (): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get("/patients/me/appointments");
    return response.data;
  }
};

export const medicalRecordAPI = {
  getPatientMedicalRecords: async (): Promise<ApiResponse<MedicalRecord[]>> => {
    const response = await api.get("/patients/me/records");
    return response.data;
  }
};

// Objek API ini sepertinya tidak digunakan di frontend web, tapi kita biarkan untuk kelengkapan
export const dashboardAPI = {};

export default api;