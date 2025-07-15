import { Document, Types } from 'mongoose';

export interface ISchedule extends Document {
    _id: string;
    scheduleId: string;
    doctorId: Types.ObjectId;
    polyclinicId: Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
    status: 'Active' | 'Cancelled' | 'Full';
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}