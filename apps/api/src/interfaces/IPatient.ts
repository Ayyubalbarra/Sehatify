import { Document } from 'mongoose';

interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
}

export interface IPatient extends Document {
  _id: string;
  patientId: string;
  nik: string;
  name: string;
  dateOfBirth: Date;
  gender: 'Laki-laki' | 'Perempuan';
  address: string;
  phone: string;
  emergencyContact?: EmergencyContact;
  status: 'Active' | 'Inactive';
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}