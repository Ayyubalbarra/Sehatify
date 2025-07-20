// apps/api/src/models/User.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
}

export interface IUser extends Document, IUserMethods {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'doctor' | 'staff' | 'Super Admin';
  phone?: string;
  specialization?: string;
  isActive: boolean;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
    push: boolean;
  };
  // --- TAMBAHKAN FIELD INI ---
  hospitalId?: mongoose.Schema.Types.ObjectId;
  polyclinicId?: mongoose.Schema.Types.ObjectId;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema: Schema<IUser, UserModel> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'doctor', 'staff', 'Super Admin'], default: 'staff' },
  phone: { type: String },
  specialization: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
  },
  // --- TAMBAHKAN FIELD INI ---
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
    required: false, // Opsional untuk Super Admin
  },
  polyclinicId: {
    type: Schema.Types.ObjectId,
    ref: 'Polyclinic',
    required: false, // Wajib hanya untuk role 'doctor'
  },
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.updateLastLogin = async function (): Promise<void> {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

export default mongoose.model<IUser, UserModel>('User', UserSchema);