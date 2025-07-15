import { Document, Types } from 'mongoose';

interface Diagnosis {
    primary: string;
    secondary?: string[];
}

interface Prescription {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export interface IVisit extends Document {
    _id: string;
    visitId: string;
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    polyclinicId: Types.ObjectId;
    bedId?: Types.ObjectId;
    visitDate: Date;
    visitType: string;
    status: 'Ongoing' | 'Completed' | 'Cancelled';
    chiefComplaint: string;
    symptoms?: string[];
    vitalSigns?: object;
    diagnosis: Diagnosis;
    treatment: string;
    prescription?: Prescription[];
    totalCost?: number;
    paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}