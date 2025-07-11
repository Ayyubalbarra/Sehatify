export interface User {
  _id: string
  name: string
  email: string
  role: "admin" | "doctor" | "nurse" | "staff" | "receptionist"
  phone?: string
  avatar?: string
  department?: string
  position?: string
  employeeId?: string
  isActive: boolean
  lastLogin?: string
  preferences?: {
    theme: "light" | "dark" | "auto"
    language: "id" | "en"
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }
  createdAt: string
  updatedAt: string
}

// Auth Types
export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: string
  phone?: string
  department?: string
  position?: string
  employeeId?: string
}

// Patient Types
export interface Patient {
  _id: string
  patientId: string
  nik: string
  name: string
  dateOfBirth: string
  gender: "Laki-laki" | "Perempuan"
  phone: string
  address: string
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  bloodType?: string
  allergies?: string[]
  medicalHistory?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Doctor Types
export interface Doctor {
  _id: string
  doctorId: string
  employeeId: string
  name: string
  specialization: string
  title: string
  licenseNumber: string
  phone: string
  email: string
  joinDate: string
  status: "Active" | "Inactive" | "On Leave"
  createdAt: string
  updatedAt: string
}

// Polyclinic Types
export interface Polyclinic {
  _id: string
  polyclinicId: string
  name: string
  department: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Queue Types
export interface Queue {
  _id: string
  queueId: string
  patientId: Patient
  doctorId: Doctor
  polyclinicId: Polyclinic
  scheduleId?: string
  queueNumber: number
  queueDate: string
  status: "Waiting" | "In Progress" | "Completed" | "Cancelled"
  estimatedTime?: string
  actualTime?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Visit Types
export interface Visit {
  _id: string
  visitId: string
  patientId: Patient
  doctorId: Doctor
  polyclinicId: Polyclinic
  visitDate: string
  visitType: "Consultation" | "Emergency" | "Follow-up" | "Check-up"
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"
  chiefComplaint: string
  diagnosis: {
    primary: string
    secondary?: string[]
  }
  treatment: string
  prescription: Array<{
    medication: string
    dosage: string
    frequency: string
    duration: string
  }>
  totalCost: number
  paymentStatus: "Pending" | "Paid" | "Cancelled"
  notes?: string
  createdAt: string
  updatedAt: string
}

// Inventory Types
export interface InventoryItem {
  _id: string
  itemId: string
  name: string
  category: string
  unit: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  unitPrice: number
  supplier: string
  expiryDate?: string
  batchNumber?: string
  location?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Bed Types
export interface Bed {
  _id: string
  ward: string
  roomNumber: string
  bedNumber: string
  bedType: "Standard" | "VIP" | "ICU" | "Emergency"
  status: "available" | "occupied" | "maintenance" | "reserved"
  patientId?: string
  dailyRate: number
  features?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

// Schedule Types
export interface Schedule {
  _id: string
  scheduleId: string
  doctorId: Doctor
  polyclinicId: Polyclinic
  date: string
  startTime: string
  endTime: string
  totalSlots: number
  bookedSlots: number
  availableSlots: number
  status: "Active" | "Cancelled" | "Completed"
  notes?: string
  createdAt: string
  updatedAt: string
}

// Dashboard Types
export interface DashboardMetrics {
  totalPatients: number
  totalDoctors: number
  emergencyToday: number
  lowStockCount: number
  availableBeds: number
  queueToday: number
  visitsToday: number
}

export interface DashboardInsights {
  metrics: DashboardMetrics
  details: {
    queueList: Queue[]
    recentVisits: Visit[]
    lowStockItems: InventoryItem[]
  }
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    pagination: {
      current: number
      pages: number
      total: number
    }
  }
}

// Notification Types
export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    url: string
  }
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: "text" | "email" | "password" | "number" | "select" | "textarea" | "date" | "tel"
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// Chart Types
export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }>
}

// Filter Types
export interface FilterOptions {
  search?: string
  status?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Socket Types
export interface SocketEvent {
  type: string
  data: any
  timestamp: string
}

// Error Types
export interface ApiError {
  success: false
  message: string
  errors?: string[]
  statusCode?: number
}
