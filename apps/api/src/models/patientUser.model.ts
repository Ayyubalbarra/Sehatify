// apps/api/src/models/patientUser.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface untuk metode kustom
export interface IPatientUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface untuk dokumen PatientUser
export interface IPatientUser extends Document, IPatientUserMethods {
  fullName: string;
  email: string;
  password?: string; 
  phone: string;
  dateOfBirth: Date;
  address: string;
}

// Tipe Model dengan metode kustom
type PatientUserModel = Model<IPatientUser, {}, IPatientUserMethods>;

const PatientUserSchema: Schema<IPatientUser, PatientUserModel> = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, 
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
}, { timestamps: true });

// Middleware untuk hashing password sebelum menyimpan
PatientUserSchema.pre<IPatientUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metode untuk membandingkan password
PatientUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false; 
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IPatientUser, PatientUserModel>('PatientUser', PatientUserSchema);