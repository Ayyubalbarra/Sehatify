import { Document } from 'mongoose';

export interface IPolyclinic extends Document {
    _id: string;
    polyclinicId: string;
    name: string;
    department: string;
    description?: string;
    isActive: boolean;
    createdBy: string; // Merujuk ke User ID
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}