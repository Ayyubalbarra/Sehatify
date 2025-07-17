// apps/admin/frontend/src/types/index.ts

// =========================================================
// TIPE DASAR & AUTENTIKASI
// =========================================================

export interface User {
  _id: string;
  name: string; 
  email: string;
  role: "admin" | "doctor" | "staff" | "Super Admin"; 
  specialization?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
  phone?: string; 
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string; 
  data?: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string; 
  errors?: any[];
  pagination?: {
    totalPages: number;
    currentPage: number;
    total: number;
  };
}

// =========================================================
// TIPE UNTUK HALAMAN SETTINGS
// =========================================================

export interface Setting {
  _id: string;
  hospitalName: string;
  hospitalEmail: string;
  hospitalAddress: string;
  timezone: string;
  language: string;
  sessionTimeout: number;
  passwordExpiry: number;
}

// =========================================================
// TIPE UNTUK AI ASSISTANT
// =========================================================

export interface LowStockInfoCard {
  type: 'low_stock_card';
  items: Array<{ _id: string; name: string; currentStock: number; minimumStock: number; unit: string; }>;
}

export type AIResponseData = { type: 'text'; content: string; } | LowStockInfoCard;
export interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string | AIResponseData; timestamp: Date; }
export interface ChatRequest { message: string; history?: ChatMessage[]; }
export interface ChatApiResponse { success: boolean; data: AIResponseData; }


// =========================================================
// TIPE DATA ENTITAS
// =========================================================

export interface DoctorDataFromAdminAPI { 
  _id: string;
  name: string;
  specialization: string;
}

export interface DoctorListApiResponse {
  success: boolean;
  data: DoctorDataFromAdminAPI[];
  pagination: { currentPage: number; totalPages: number; total: number; };
}

export interface PolyclinicData {
  _id: string;
  name: string; 
  department: string;
  status: 'Active' | 'Maintenance' | 'Closed';
  price?: number;
  operatingHours?: {
    [day: string]: { isOpen?: boolean; start?: string; end?: string };
  };
  assignedDoctors?: Array<{
    doctorId?: string | { name?: string };
  }>;
}

export interface PolyclinicsApiResponse {
  success: boolean;
  data: PolyclinicData[];
  pagination: { currentPage: number; totalPages: number; total: number };
}

export interface PatientData { 
  _id: string; 
  fullName: string; 
  dateOfBirth: string;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  email?: string; 
  status?: 'Active' | 'Inactive'; 
  lastVisit?: string;
}

export interface PatientsApiResponse {
  success: boolean;
  data: PatientData[]; 
  pagination: { currentPage: number; totalPages: number; total: number }; 
}

export interface PatientStatsData {
  total: number;
  active: number;
  new: number;
  genderStats: Array<{ _id: string; count: number }>;
}

export interface PatientStatsApiResponse {
  success: boolean;
  data: PatientStatsData;
}

export interface ScheduleData {
  _id: string; 
  doctorId: string | DoctorDataFromAdminAPI; 
  polyclinicId: string | PolyclinicData; 
  date: string; 
  startTime: string; 
  endTime: string; 
  status: 'Active' | 'Cancelled' | 'Completed';
}

export interface ScheduleApiResponse {
  success: boolean;
  data: ScheduleData[];
  pagination: { currentPage: number; totalPages: number; total: number };
}

export interface InventoryItemData { 
  _id: string; 
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitPrice: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
}

export interface InventoryApiResponse {
  success: boolean;
  data: InventoryItemData[]; 
  pagination: { currentPage: number; totalPages: number; total: number };
}

export interface InventoryStatsApiResponse {
  success: boolean;
  data: {
    total: number; 
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
}

export interface ChartDataForRecharts { name: string; value: number; [key: string]: any; }
export interface FinancialSummaryData { totalRevenue: number; operationalCost: number; profitMargin: number; patientSatisfaction: number; }
export interface ServiceDistributionData { name: string; value: number; color?: string; }

export interface DashboardOverviewApiData {
  totalPatients?: number;
  erAdmissions?: number;
  bloodUnitsOminus?: number;
  availableBeds?: number;
  patientTrendData?: ChartDataForRecharts[];
  totalVisits?: number; 
  averageDaily?: number; 
  occupancyRate?: number; 
}