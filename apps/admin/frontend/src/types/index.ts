// apps/admin/frontend/src/types/index.ts

// =========================================================
// TIPE AUTENTIKASI & PENGGUNA ADMIN
// =========================================================

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'staff' | 'Super Admin';
  phone?: string;
  specialization?: string;
  isActive: boolean;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
    push: boolean;
  };
  avatarUrl?: string;
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

// =========================================================
// TIPE PENGATURAN GLOBAL
// =========================================================

export interface Setting {
  _id: string;
  appName: string;
  appVersion: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  hospitalName?: string;
  hospitalEmail?: string;
  hospitalAddress?: string;
  timezone?: string;
  language?: string;
  sessionTimeout?: number;
  passwordExpiry?: number;
  allowRegistrations: boolean;
}

// =========================================================
// TIPE DASHBOARD & ANALISIS
// =========================================================

export interface DashboardOverviewApiData {
  totalPatients: number; 
  erAdmissions: number; 
  bloodUnitsOminus: number; 
  availableBeds: number; 
  patientTrendData?: ChartDataForRecharts[]; 
  totalVisits?: number; 
  averageDaily?: number; 
  occupancyRate?: number;
}

export interface ChartDataForRecharts {
  name: string; 
  value: number; 
}

export interface FinancialSummaryData {
  totalRevenue: number;
  expenses: number; 
  profit: number;
  operationalCost?: number; 
  profitMargin?: number;
  patientSatisfaction?: number;
}

export interface ServiceDistributionData {
  name: string; 
  count: number; 
  value: number; 
}

// =========================================================
// TIPE AI ASSISTANT
// =========================================================

export interface ChartData {
  title: string;
  dataLabel: string;
  data: Array<{
    name: string;
    value: number;
  }>;
}

export interface LowStockInfoCard {
  title: string;
  items: {
    _id: string;
    name: string;
    stock: number; 
    minStock: number; 
    unit: string;
  }[];
}

export interface TableData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export type AIResponseData = 
  | { type: 'text'; content: string }
  | { type: 'low_stock_card'; content: LowStockInfoCard }
  | { type: 'chart'; content: ChartData }
  | { type: 'table'; content: TableData };

export interface ChatApiResponse {
  success: boolean;
  message?: string;
  data: AIResponseData; 
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: AIResponseData; 
  timestamp: Date;
}


// =========================================================
// TIPE MANAJEMEN PASIEN
// =========================================================

export interface PatientData {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string; 
  address: string; 
  gender?: 'Laki-laki' | 'Perempuan'; 
  bloodType?: string; 
  allergies?: string[]; 
  medicalHistory?: string[]; 
  isActive: boolean; 
  createdAt: string;
  updatedAt: string;
  lastVisit?: string; 
  status?: 'Active' | 'Inactive'; 
}

export interface PatientFormData { 
  _id?: string; 
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string; 
  gender?: 'Laki-laki' | 'Perempuan';
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string[];
  isActive?: boolean; 
}


export interface PatientsApiResponse {
  success: boolean;
  data: PatientData[];
  message?: string;
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface PatientStatsApiResponse {
  totalPatients: number;
  newPatientsThisWeek: number;
  activePatients: number;
  genderDistribution: { _id: string; count: number; }[];
}


// =========================================================
// TIPE INVENTARIS
// =========================================================

export interface InventoryItemData {
  _id: string;
  name: string;
  category: string; 
  stock: number;
  minStock: number; 
  unit: string; 
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'; 
  supplier?: string;
  expirationDate?: string; 
  createdAt: string;
  updatedAt: string;
  currentStock?: number; 
  unitPrice?: number; 
}

export interface InventoryFormData { 
  _id?: string;
  name: string;
  category: string;
  stock: number; 
  minStock: number; 
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Available'; 
  supplier?: string;
  expirationDate?: string;
  unitPrice?: number; 
}


export interface InventoryApiResponse {
  success: boolean;
  data: InventoryItemData[];
  message?: string;
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface InventoryStatsApiResponse {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue?: number;
}

// =========================================================
// TIPE JADWAL (SDM / Dokter)
// =========================================================

export interface ScheduleStatsApiResponse {
  doctorsOnDuty: number;
  totalSlots: number;
  utilization: number;
}

export interface ScheduleData {
  _id: string;
  doctorId: string;
  polyclinicId: string;
  date: string; 
  startTime: string; 
  endTime: string; 
  totalSlots: number;
  bookedSlots: number; 
  availableSlots: number; 
  status: 'Active' | 'Cancelled' | 'Full' | 'Completed'; 
  notes?: string; 
  createdAt: string;
  updatedAt: string;
  doctorInfo?: { _id: string; name: string; specialization: string; };
  polyclinicInfo?: { _id: string; name: string; department: string; };
}

export interface ScheduleFormData { 
  _id?: string; 
  doctorId: string;
  polyclinicId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalSlots: number;
  notes?: string;
  status: 'Active' | 'Cancelled' | 'Completed' | 'Full'; 
}


export interface ScheduleApiResponse {
  success: boolean;
  data: ScheduleData[];
  message?: string;
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export interface DoctorDataFromAdminAPI { 
  _id: string;
  name: string;
  specialization: string;
  email: string;
  phone?: string;
  role: 'doctor';
  isActive: boolean;
}

export interface DoctorListApiResponse {
  success: boolean;
  data: DoctorDataFromAdminAPI[];
  message?: string;
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}


// =========================================================
// TIPE POLIKLINIK
// =========================================================

export interface PolyclinicData {
  _id: string;
  polyclinicId: string; 
  name: string;
  department: string; 
  description?: string;
  status: 'Active' | 'Maintenance' | 'Closed';
  createdAt: string;
  updatedAt: string;
  operatingHours?: { 
    monday?: { start?: string; end?: string; isOpen?: boolean };
    tuesday?: { start?: string; end?: string; isOpen?: boolean };
    wednesday?: { start?: string; end?: string; isOpen?: boolean };
    thursday?: { start?: string; end?: string; isOpen?: boolean };
    friday?: { start?: string; end?: string; isOpen?: boolean };
    saturday?: { start?: string; end?: string; isOpen?: boolean };
    sunday?: { start?: string; end?:string; isOpen?: boolean };
  };
  assignedDoctors?: { 
    doctorId?: string; 
    schedule?: {
      day?: string;
      startTime?: string;
      endTime?: string;
    }[];
  }[];
  price?: number; 
}


export interface PolyclinicsApiResponse {
  success: boolean;
  data: PolyclinicData[];
  message?: string;
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}


// =========================================================
// TIPE NOTIFIKASI
// =========================================================

export interface Notification {
  _id: string; 
  message: string;
  type: 'new_appointment' | 'stock_low' | 'schedule_update' | 'system_alert' | 'login_attempt' | 'info' | 'warning' | 'success' | 'error';
  targetUserIds?: string[]; 
  targetRoles?: string[];   
  relatedEntityId?: string; 
  link?: string; 
  isRead: boolean;
  createdAt: string; 
  updatedAt?: string; 
  title?: string; 
  time?: string; 
}


// =========================================================
// TIPE WRAPPER API UMUM
// =========================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T; 
  message?: string;
  pagination?: {
    totalPages: number;
    currentPage: number;
    total: number;
  };
}
