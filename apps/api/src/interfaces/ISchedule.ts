// apps/api/src/interfaces/ISchedule.ts

import { Document, Types } from 'mongoose';
import { IUser } from '../models/User'; 
import { IPolyclinic } from './IPolyclinic';

export interface ISchedule extends Document {
    _id: Types.ObjectId;
    scheduleId: string;
    // doctorId dan polyclinicId bisa berupa ObjectId atau objek populated
    doctorId: Types.ObjectId | IUser; 
    polyclinicId: Types.ObjectId | IPolyclinic; 
    date: Date;
    startTime: string;
    endTime: string;
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
    status: 'Active' | 'Cancelled' | 'Completed'; 
    appointments?: {
        appointmentId?: string;
        patientId?: Types.ObjectId; // Atau IPatientUser populated
        appointmentTime?: string;
        status?: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
        queueNumber?: number;
    }[];
    notes?: string;
    estimatedWaitTime?: number;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}