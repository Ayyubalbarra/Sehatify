// apps/api/src/interfaces/IQueue.ts

import { Document, Types } from 'mongoose';
import { IPatientUser } from '../models/patientUser.model'; // Import IPatientUser
import { IUser } from '../models/User'; // Import IUser for doctor
import { IPolyclinic } from './IPolyclinic'; // Import IPolyclinic
import { ISchedule } from './ISchedule'; // Import ISchedule

export interface IQueue extends Document {
    _id: Types.ObjectId; 
    queueId: string;
    patientId: Types.ObjectId | IPatientUser; // Bisa ObjectId atau populated IPatientUser
    doctorId: Types.ObjectId | IUser; // Bisa ObjectId atau populated IUser
    polyclinicId: Types.ObjectId | IPolyclinic; // Bisa ObjectId atau populated IPolyclinic
    scheduleId: Types.ObjectId | ISchedule; // Bisa ObjectId atau populated ISchedule
    queueNumber: number;
    queueDate: Date;
    appointmentTime?: string; 
    status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show'; 
    priority: 'Normal' | 'Urgent' | 'Emergency'; 
    registrationTime?: Date; // Opsional
    calledTime?: Date;
    startConsultationTime?: Date;
    endConsultationTime?: Date;
    estimatedWaitTime?: number;
    actualWaitTime?: number;
    consultationDuration?: number;
    notes?: string;
    complaints?: string;
    createdBy?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}