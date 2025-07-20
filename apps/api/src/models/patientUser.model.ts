// apps/api/src/models/patientUser.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPatientUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IPatientUser extends Document, IPatientUserMethods {
  fullName: string;
  email: string;
  password?: string; 
  phone: string;
  dateOfBirth: Date;
  address: string;
  isActive: boolean; 
  patientId: string;
  nik?: string;
  gender: 'Laki-laki' | 'Perempuan';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  medicalHistory?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  registrationDate: Date;
  status: 'Active' | 'Inactive';
  lastVisit?: Date;

  // --- TAMBAHAN UNTUK KEAMANAN TIPE ---
  createdAt: Date;
  updatedAt: Date;
}

type PatientUserModel = Model<IPatientUser, {}, IPatientUserMethods>;

const PatientUserSchema: Schema<IPatientUser, PatientUserModel> = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, 
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  isActive: { type: Boolean, default: true }, 
  patientId: { type: String, unique: true, index: true },
  nik: { type: String, unique: true, sparse: true },
  gender: { type: String, enum: ["Laki-laki", "Perempuan"] },
  bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  allergies: [String],
  medicalHistory: [String],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  lastVisit: Date,
}, { timestamps: true });

PatientUserSchema.pre<IPatientUser>('save', async function (next) {
  if (this.isNew && !this.patientId) {
    this.patientId = `PAT${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
  }

  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

PatientUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false; 
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IPatientUser, PatientUserModel>('PatientUser', PatientUserSchema);