// apps/api/src/interfaces/IPolyclinic.ts

import { Document, Types } from 'mongoose';
import { IDoctor } from './IDoctor'; // Import IDoctor
import { IUser } from '../models/User'; // Import IUser untuk assignedDoctors

export interface IPolyclinic extends Document {
    _id: Types.ObjectId; 
    polyclinicId: string;
    name: string;
    department: 'Umum' | 'Spesialis' | 'Gigi' | 'Mata' | 'THT' | 'Kulit' | 'Jantung' | 'Paru' | 'Saraf' | 'Bedah' | 'Kandungan' | 'Anak' | 'Psikiatri' | 'Gizi' | 'Rehabilitasi';
    description?: string;
    operatingHours?: {
        [day: string]: { start?: string; end?: string; isOpen?: boolean };
    };
    capacity?: {
        maxPatientsPerDay?: number;
        maxPatientsPerHour?: number;
    };
    facilities?: string[];
    location?: {
        building?: string;
        floor?: string;
        room?: string;
    };
    assignedDoctors?: Array<{
        _id?: Types.ObjectId; // ID dari sub-dokumen atau item array
        doctorId?: Types.ObjectId | IUser; // Bisa ObjectId atau objek IUser populated (IDoctor adalah IUser)
        schedule?: { // Struktur jadwal di dalam assignedDoctors
          day?: string;
          startTime?: string;
          endTime?: string;
        }[];
    }>;
    status: 'Active' | 'Maintenance' | 'Closed';
    monthlyStats?: {
        totalPatients?: number;
        averageWaitTime?: number;
        satisfactionRating?: number;
    };
    createdBy?: Types.ObjectId; 
    updatedBy?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}