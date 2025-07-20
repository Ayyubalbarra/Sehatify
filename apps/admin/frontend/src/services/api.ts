// apps/admin/frontend/src/services/api.ts
// ... (semua kode sebelum polyclinicAPI tetap sama) ...
import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"
import toast from "react-hot-toast"

import type { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  ChangePasswordData, 
  ApiResponse, 
  Setting,
  ChatApiResponse, 
  PatientsApiResponse,
  PatientData,
  DashboardOverviewApiData,
  ChartDataForRecharts,
  FinancialSummaryData,
  ServiceDistributionData,
  PolyclinicsApiResponse,
  PolyclinicData,
  InventoryApiResponse,
  InventoryStatsApiResponse,
  InventoryItemData,
  ScheduleApiResponse,
  ScheduleData,
  ScheduleFormData,
  ScheduleStatsApiResponse,
  DoctorListApiResponse,
  Notification,
  PatientStatsApiResponse 
} from "../types" 

// Definisi tipe payload untuk create operations
type CreateInventoryPayload = Omit<InventoryItemData, '_id' | 'createdAt' | 'updatedAt' | 'currentStock' | 'status'> & {
    status?: 'In Stock' | 'Low Stock' | 'Out of Stock'; 
};
type CreatePatientPayload = Omit<PatientData, '_id' | 'createdAt' | 'updatedAt' | 'lastVisit' | 'status'>; 
type CreateSchedulePayload = Omit<ScheduleData, '_id' | 'createdAt' | 'updatedAt' | 'bookedSlots' | 'availableSlots' | 'doctorInfo' | 'polyclinicInfo'>; 

// --- BARU: Tambahkan tipe payload untuk poliklinik
export type PolyclinicPayload = Omit<PolyclinicData, '_id' | 'polyclinicId' | 'createdAt' | 'updatedAt' | 'hospitalId'>

interface TodayQueueApiResponse {
    totalQueues: number;
    summary: {
        waiting: number;
        inProgress: number;
        completed: number;
    };
    queues: Array<{
        _id: string;
        queueNumber: number;
        patientName: string;
        polyclinicName: string;
        doctorName: string;
        appointmentTime: string;
        status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
        patientPhone: string;
    }>;
}


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use(
  (config) => {
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

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.message || error.message || "An error occurred"
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken")
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

// =========================================================
// API SERVICES (TETAP SAMA)
// =========================================================
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
    return response.data;
  },
  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>("/auth/admin/profile", userData)
    return response.data;
  },
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>("/auth/admin/profile")
    return response.data;
  },
  changePassword: async (passwordData: ChangePasswordData): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>("/auth/admin/change-password", passwordData);
    return response.data;
  }
}
export const settingAPI = {
  getSettings: async (): Promise<ApiResponse<Setting>> => {
    const response = await api.get("/settings");
    return response.data;
  },
  updateSettings: async (settingsData: Partial<Setting>): Promise<ApiResponse<Setting>> => {
    const response = await api.put("/settings", settingsData);
    return response.data;
  }
}
export const dashboardAPI = {
  getAdminDashboardOverview: async (): Promise<ApiResponse<DashboardOverviewApiData>> => {
    const response = await api.get<ApiResponse<DashboardOverviewApiData>>("/dashboard/admin-overview"); 
    return response.data;
  },
  getPatientsPerWeek: async (): Promise<ApiResponse<ChartDataForRecharts[]>> => {
    const response = await api.get<ApiResponse<ChartDataForRecharts[]>>("/dashboard/admin-charts/patients-per-week"); 
    return response.data;
  },
  getPatientsPerHour: async (): Promise<ApiResponse<ChartDataForRecharts[]>> => {
    const response = await api.get<ApiResponse<ChartDataForRecharts[]>>("/dashboard/admin-charts/patients-per-hour"); 
    return response.data;
  },
  getAIInsights: async (): Promise<ApiResponse<{ summary: string; recommendations: any[] }>> => {
    const response = await api.get<ApiResponse<{ summary: string; recommendations: any[] }>>("/dashboard/admin-charts/ai-insights"); 
    return response.data;
  },
  getSystemHealth: async (): Promise<ApiResponse<any>> => { 
    const response = await api.get<ApiResponse<any>>("/dashboard/system/health");
    return response.data;
  },
  getFinancialSummary: async (period: string = '30d'): Promise<ApiResponse<FinancialSummaryData>> => { 
    const response = await api.get<ApiResponse<FinancialSummaryData>>("/dashboard/stats/financial", { params: { period } });
    return response.data;
  },
  getServiceDistribution: async (period: string = '30d'): Promise<ApiResponse<ServiceDistributionData[]>> => { 
    const response = await api.get<ApiResponse<ServiceDistributionData[]>>("/dashboard/stats/service-distribution", { params: { period } });
    return response.data;
  },
  getOverview: async (period: string = '30d'): Promise<ApiResponse<DashboardOverviewApiData>> => { 
    const response = await api.get<ApiResponse<DashboardOverviewApiData>>("/dashboard/overview", { params: { period } });
    return response.data;
  },
  getChartData: async (type: string, period: string = '30d'): Promise<ApiResponse<ChartDataForRecharts[]>> => { 
    const response = await api.get<ApiResponse<ChartDataForRecharts[]>>(`/dashboard/charts?type=${type}`, { params: { period } });
    return response.data;
  },
  getTodayQueueList: async (): Promise<ApiResponse<TodayQueueApiResponse>> => {
      const response = await api.get<ApiResponse<TodayQueueApiResponse>>("/dashboard/today-queues");
      return response.data;
  },
  seedDatabase: async (): Promise<ApiResponse<any>> => { 
      const response = await api.post<ApiResponse<any>>("/seed/database"); 
      return response.data;
  },
}
export const aiAPI = {
  sendChatMessage: async (message: string): Promise<ChatApiResponse> => {
    const response = await api.post<ChatApiResponse>("/ai/chat", { message });
    return response.data;
  },
};
export const patientAPI = {
  getPatients: async (page = 1, limit = 10, search = "", status = "all"): Promise<PatientsApiResponse> => {
    const response = await api.get<PatientsApiResponse>("/patients", { params: { page, limit, search, status } });
    return response.data;
  },
  getPatientStats: async (): Promise<ApiResponse<PatientStatsApiResponse>> => { 
    const response = await api.get<ApiResponse<PatientStatsApiResponse>>("/patients/stats"); 
    return response.data;
  },
  createPatient: async (patientData: CreatePatientPayload): Promise<ApiResponse<PatientData>> => { 
    const response = await api.post<ApiResponse<PatientData>>("/patients", patientData);
    return response.data;
  },
  updatePatient: async (patientId: string, patientData: Partial<PatientData>): Promise<ApiResponse<PatientData>> => { 
    const response = await api.put<ApiResponse<PatientData>>(`/patients/${patientId}`, patientData);
    return response.data;
  },
  deletePatient: async (patientId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/patients/${patientId}`);
    return response.data;
  },
}
export const inventoryAPI = {
  getInventoryItems: async (page = 1, limit = 10, search = "", category = "", status = ""): Promise<InventoryApiResponse> => {
    const response = await api.get<InventoryApiResponse>("/inventory", { params: { page, limit, search, category, status } });
    return response.data;
  },
  getInventoryStats: async (): Promise<ApiResponse<InventoryStatsApiResponse>> => { 
    const response = await api.get<ApiResponse<InventoryStatsApiResponse>>("/inventory/stats"); 
    return response.data;
  },
  createInventoryItem: async (itemData: CreateInventoryPayload): Promise<ApiResponse<InventoryItemData>> => { 
    const response = await api.post<ApiResponse<InventoryItemData>>("/inventory", itemData);
    return response.data;
  },
  updateInventoryItem: async (itemId: string, itemData: Partial<InventoryItemData>): Promise<ApiResponse<InventoryItemData>> => {
    const response = await api.put<ApiResponse<InventoryItemData>>(`/inventory/${itemId}`, itemData);
    return response.data;
  },
  deleteInventoryItem: async (itemId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/inventory/${itemId}`);
    return response.data;
  },
};
export const scheduleAPI = {
  getScheduleStats: async (): Promise<ApiResponse<ScheduleStatsApiResponse>> => {
    const response = await api.get("/schedules/stats");
    return response.data;
  },
  getAllSchedules: async (page = 1, limit = 10, date?: string, search?: string): Promise<ScheduleApiResponse> => {
    const response = await api.get<ScheduleApiResponse>("/schedules", { params: { page, limit, date, search } });
    return response.data;
  },
  createSchedule: async (scheduleData: ScheduleFormData): Promise<ApiResponse<ScheduleData>> => { 
    const response = await api.post<ApiResponse<ScheduleData>>("/schedules", scheduleData);
    return response.data;
  },
  updateSchedule: async (id: string, scheduleData: Partial<ScheduleFormData>): Promise<ApiResponse<ScheduleData>> => {
    const response = await api.put<ApiResponse<ScheduleData>>(`/schedules/${id}`, scheduleData);
    return response.data;
  },
};
export const doctorAPI = { 
  getDoctors: async (page = 1, limit = 100, search = "", specialization = "", status = "Active"): Promise<DoctorListApiResponse> => {
    const response = await api.get<DoctorListApiResponse>("/doctors", { params: { page, limit, search, specialization, status } });
    return response.data;
  },
};
export const notificationAPI = {
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get<ApiResponse<Notification[]>>("/notifications");
    return response.data;
  },
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>(`/notifications/mark-all-read`);
    return response.data;
  },
  removeNotification: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/notifications/${id}`);
    return response.data;
  },
}

// --- DIUBAH: Memperbarui polyclinicAPI secara keseluruhan ---
export const polyclinicAPI = {
  getAllPolyclinics: async (page = 1, limit = 10, search = "", department = "", status = ""): Promise<PolyclinicsApiResponse> => {
    const response = await api.get<PolyclinicsApiResponse>("/polyclinics", { params: { page, limit, search, department, status } });
    return response.data;
  },
  getDepartments: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get<ApiResponse<string[]>>("/polyclinics/departments");
    return response.data;
  },
  createPolyclinic: async (data: PolyclinicPayload): Promise<ApiResponse<PolyclinicData>> => {
    const response = await api.post<ApiResponse<PolyclinicData>>("/polyclinics", data);
    return response.data;
  },
  updatePolyclinic: async (id: string, data: Partial<PolyclinicPayload>): Promise<ApiResponse<PolyclinicData>> => {
    const response = await api.put<ApiResponse<PolyclinicData>>(`/polyclinics/${id}`, data);
    return response.data;
  },
  deletePolyclinic: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/polyclinics/${id}`);
    return response.data;
  }
};
// --- Akhir dari perubahan polyclinicAPI ---

export default api;