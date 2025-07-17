// apps/api/src/interfaces/IDoctor.ts

import { IUser } from '../models/User'; // Asumsi IUser ada di ../models/User
import { WorkSchedule } from './ISchedule'; // Asumsi WorkSchedule dari ISchedule atau tempat lain

// WorkSchedule ini perlu disimpan di model Schedule atau di array di User
export interface WorkSchedule {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  startTime: string; // Format "HH:mm"
  endTime: string;   // Format "HH:mm"
  isAvailable: boolean;
}

// Interface ini akan digunakan untuk tipe data dokter yang di-populate dari model User
export interface IDoctor extends IUser { // Menggunakan extend IUser
  // Properti tambahan yang spesifik untuk dokter, jika ada di model User
  specialization: string; // Ini sudah ada di IUser
  licenseNumber?: string; // Mungkin ada di IUser atau tambahkan di UserSchema jika perlu
  employeeId?: string; // Mungkin ada di IUser atau tambahkan di UserSchema jika perlu
  photo?: string; // Jika Anda menyimpan URL foto di User model
  rating?: number;
  experience?: number;
  workSchedule?: WorkSchedule[]; // Jika ini disimpan sebagai array di User
  // createdBy dan updatedBy sudah ada di IUser (melalui Document)
}