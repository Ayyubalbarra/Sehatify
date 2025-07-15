import { Document } from 'mongoose';

export interface IPatientUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IPatientUser extends Document, IPatientUserMethods {
  _id: string;
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  dateOfBirth: Date;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}