// apps/web/src/types/index.ts

// Tipe Patient yang lebih sesuai dengan patientUser.model.ts (backend)
export interface Patient {
  _id: string; // ID dari MongoDB
  fullName: string; // Sesuai dengan backend patientUser.model
  email: string;
  phone: string;
  dateOfBirth: string; // Asumsi string ISO date "YYYY-MM-DD"
  address: string; // Untuk PatientUser, address adalah string
}

// Tipe Doctor yang lebih sesuai dengan User model (role doctor)
export interface Doctor {
  _id: string; // ID dari MongoDB
  name: string;
  specialization: string; 
  licenseNumber: string; 
  email?: string;
  phone?: string;
  photo?: string; // Jika Anda menyimpan URL foto di User model atau mendapatkan dari tempat lain
  rating?: number; 
  experience?: number; 
}

// Tipe Hospital (masih sesuai mock di frontend, karena belum ada model di backend)
export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating?: number; 
  accreditation?: string[]; 
  image?: string; 
  specialties: string[]; // Ini akan menjadi Polyclinic name/department dari backend
  keyServices?: string[]; 
  bedCount?: number; 
  establishedYear?: number; 
  description?: string; 
}

// Tipe Polyclinic (BARU, sesuai dengan backend IPolyclinic)
export interface Polyclinic {
  _id: string;
  polyclinicId: string;
  name: string; // Nama poliklinik, ex: "Poli Jantung"
  department: string; // Departemen utama, ex: "Spesialis"
  description?: string;
  status?: 'Active' | 'Maintenance' | 'Closed';
}

// Tipe Schedule (BARU, sesuai dengan backend ISchedule)
export interface Schedule {
  _id: string;
  scheduleId: string;
  doctorId: string; 
  polyclinicId: string | Polyclinic; // Bisa ID atau objek Polyclinic yang terpopulate
  date: string; // Tanggal jadwal (YYYY-MM-DD)
  startTime: string; // Waktu mulai (HH:mm)
  endTime: string; // Waktu selesai (HH:mm)
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  status: 'Active' | 'Cancelled' | 'Completed';
  estimatedWaitTime?: number;
}

// Tipe Appointment (sesuaikan dengan IQueue dari backend)
export interface Appointment {
  _id: string; 
  queueId: string; 
  patientId: string; 
  doctorId: string; 
  polyclinicId: string; 
  scheduleId: string; 
  queueNumber: number; 
  queueDate: string; 
  appointmentTime?: string; 
  status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show'; 
  priority: 'Normal' | 'Urgent' | 'Emergency'; 
  notes?: string;
  complaints?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: string;
  publishDate: string;
  author: string;
}

// Tipe MedicalRecord (perlu diperluas agar cocok dengan data dari backend)
export interface MedicalRecord {
  id: string;
  patientId: string;
  visitDate: string;
  doctorName: string;
  diagnosis: string;
  treatments: string[];
  prescriptions: string[];
  labResults?: { // Menjadikan properti opsional
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
  };
  notes?: string; // Menjadikan properti opsional
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
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

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: Patient; // Untuk frontend web, user adalah Patient
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}