// apps/api/src/models/Hospital.ts

import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IHospital extends Document {
    hospitalId: string; 
    name: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    polyclinics: mongoose.Types.ObjectId[]; 
    beds: mongoose.Types.ObjectId[]; 
    status: 'Active' | 'Closed' | 'Maintenance';
}

const hospitalSchema: Schema<IHospital> = new Schema({
    hospitalId: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },
    description: { type: String },
    polyclinics: [{ type: Schema.Types.ObjectId, ref: 'Polyclinic' }], 
    beds: [{ type: Schema.Types.ObjectId, ref: 'Bed' }], 
    status: { type: String, enum: ['Active', 'Closed', 'Maintenance'], default: 'Active' },
}, { timestamps: true });

hospitalSchema.pre<IHospital>('save', function (next) {
    if (!this.hospitalId) {
        this.hospitalId = `HS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }
    next();
});

const Hospital: Model<IHospital> = mongoose.model<IHospital>('Hospital', hospitalSchema);

export default Hospital;