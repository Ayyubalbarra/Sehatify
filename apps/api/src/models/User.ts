import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Definisikan metode kustom yang ada di skema Anda
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
}

// Gabungkan tipe dasar dokumen dengan metode kustom
export interface IUser extends Document, IUserMethods {
  name: string;
  email: string;
  password?: string; // Tanda '?' karena tidak selalu di-select dari DB
  role: 'admin' | 'doctor' | 'staff' | 'Super Admin';
  specialization?: string;
  isActive: boolean;
  lastLogin?: Date;
}

// Beri tahu Mongoose tentang model yang memiliki metode kustom
type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema: Schema<IUser, UserModel> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'staff', 'Super Admin'],
    default: 'staff',
  },
  specialization: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

// Middleware untuk hashing password
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Implementasi metode kustom
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.updateLastLogin = async function (): Promise<void> {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

export default mongoose.model<IUser, UserModel>('User', UserSchema);