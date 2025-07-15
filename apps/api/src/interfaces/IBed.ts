import { Document, Types } from 'mongoose';
import { IUser } from './IUser';
import { IPatient } from './IPatient';

export interface IBed extends Document {
  _id: string;
  bedNumber: string;
  roomNumber: string;
  ward: string;
  bedType: 'ICU' | 'VIP' | 'Standard' | 'Isolation';
  status: 'available' | 'occupied' | 'maintenance';
  dailyRate: number;
  currentPatient?: Types.ObjectId | IPatient; // Bisa berisi ID atau objek pasien yang di-populate
  occupiedAt?: Date;
  createdBy: Types.ObjectId | IUser; // Bisa berisi ID atau objek user yang di-populate
  updatedBy?: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}