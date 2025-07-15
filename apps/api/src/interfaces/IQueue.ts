import { Document, Types } from 'mongoose';

export interface IQueue extends Document {
    _id: string;
    queueId: string;
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    polyclinicId: Types.ObjectId;
    scheduleId: Types.ObjectId;
    queueNumber: number;
    queueDate: Date;
    status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled';
    priority: 'Normal' | 'Emergency';
    notes?: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}