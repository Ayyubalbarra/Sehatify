import { Document } from 'mongoose';

// Definisikan semua role yang valid di sini
export type Role = "admin" | "doctor" | "staff" | "Super Admin" | "patient" | "nurse";

export interface IUser extends Document {
  _id: string; // Pastikan _id ada di interface dasar
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  isActive: boolean;
  specialization?: string;
  licenseNumber?: string;
  workSchedule?: any[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}