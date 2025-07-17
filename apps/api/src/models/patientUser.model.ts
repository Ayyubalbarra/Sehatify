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
  isActive: boolean; // ✅ Tambahkan properti ini
}

type PatientUserModel = Model<IPatientUser, {}, IPatientUserMethods>;

const PatientUserSchema: Schema<IPatientUser, PatientUserModel> = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, 
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  isActive: { type: Boolean, default: true }, // ✅ Tambahkan field ini ke skema
}, { timestamps: true });

PatientUserSchema.pre<IPatientUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

PatientUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false; 
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IPatientUser, PatientUserModel>('PatientUser', PatientUserSchema);