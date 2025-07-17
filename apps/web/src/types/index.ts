// apps/web/src/types/index.ts

// =========================================================
// TIPE AUTENTIKASI & PENGGUNA
// =========================================================

// Tipe data untuk pasien yang sedang login
export interface Patient {
  _id: string;
  fullName: string;
  email: string;
  // Anda bisa menambahkan properti lain di sini jika diperlukan,
  // misalnya 'phoneNumber', 'dateOfBirth', dll.
}

// Tipe untuk respons API saat login/register
export interface AuthResponse {
  success: boolean;
  message?: string; 
  data?: {
    user: Patient;
    token: string;
  };
}

// Tipe untuk kredensial yang dikirim saat login
export interface LoginCredentials {
  email: string;
  password: string;
}

// =========================================================
// TIPE UNTUK ALUR BOOKING
// =========================================================

// Tipe data untuk daftar rumah sakit
export interface Hospital {
  _id: string;
  name: string;
  address: string;
  polyclinics?: Polyclinic[]; // Berisi daftar poli yang tersedia di RS tsb, opsional karena mungkin tidak selalu di-populate
}

// Tipe data untuk daftar poliklinik
export interface Polyclinic {
  _id: string;
  name: string;
  department: string;
  // Anda bisa menambahkan properti lain seperti 'description' atau 'doctors'
}

// Tipe data untuk daftar dokter
export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  polyclinic?: string; // ID poliklinik
  // Anda bisa menambahkan properti lain seperti 'contact' atau 'experience'
}

// Tipe data untuk jadwal/slot waktu yang tersedia
export interface Schedule {
  _id: string;
  doctorId: string; // ID dokter yang terkait dengan jadwal ini
  date: string;     // Tanggal jadwal (e.g., "YYYY-MM-DD")
  startTime: string; // Waktu mulai (e.g., "09:00")
  endTime: string;   // Waktu selesai (e.g., "17:00")
  availableSlots: number; // Jumlah slot yang tersedia untuk jadwal ini
  // Anda bisa menambahkan properti lain seperti 'duration'
}

// Tipe data untuk konfirmasi appointment yang berhasil dibuat
export interface Appointment {
  _id: string;
  patientId: string; // ID pasien yang membuat appointment
  scheduleId: string; // ID jadwal yang di-booking
  queueNumber: number;
  appointmentTime: string; // Waktu janji temu yang dikonfirmasi
  queueDate: string; // Tanggal janji temu
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; // Status appointment

  // Data terpopulasi (jika backend mengirimkannya)
  doctor?: Doctor; 
  polyclinic?: Polyclinic;
  hospital?: Hospital; // Hospital terkait jika diperlukan
}

// =========================================================
// TIPE REKAM MEDIS
// =========================================================

// Tipe data untuk Rekam Medis Pasien
export interface MedicalRecord {
  _id: string;
  patientId: string; // ID pasien yang memiliki rekam medis ini
  doctorId: string; // ID dokter yang menangani
  visitId: string;  // ID kunjungan terkait jika ada
  diagnosis: string;
  medications: string[]; // Daftar obat-obatan
  date: string;       // Tanggal rekam medis dibuat/dicatat
  notes?: string;     // Catatan tambahan

  // Anda mungkin ingin men populate data dokter dan pasien
  doctorInfo?: Doctor;
  patientInfo?: Patient;
}


// =========================================================
// TIPE WRAPPER API UMUM
// =========================================================

// Tipe respons standar dari semua API kita
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    totalPages: number;
    currentPage: number;
    total: number;
  };
}