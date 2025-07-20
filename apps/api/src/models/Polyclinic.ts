// apps/api/src/models/Polyclinic.ts

import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';

// Interface untuk atribut jam operasional
export interface IOperatingHours {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  isOpen: boolean;
  start?: string;
  end?: string;
}

// Interface untuk atribut data murni
export interface IPolyclinic {
  _id: mongoose.Types.ObjectId;
  polyclinicId: string;
  name: string;
  department: 'Umum' | 'Spesialis' | 'Gigi' | 'Mata' | 'THT' | 'Kulit' | 'Jantung' | 'Paru' | 'Saraf' | 'Bedah' | 'Kandungan' | 'Anak' | 'Psikiatri' | 'Gizi' | 'Rehabilitasi';
  description?: string;
  assignedDoctors?: {
    doctorId: mongoose.Types.ObjectId | IUser;
  }[];
  // --- BARU: Menambahkan tarif dan jam operasional ---
  tarif?: number;
  operatingHours?: IOperatingHours[];
  status: 'Active' | 'Maintenance' | 'Closed';
  hospitalId: mongoose.Types.ObjectId;
}

// Tipe untuk Dokumen Mongoose
export type IPolyclinicDocument = IPolyclinic & Document;

const operatingHoursSchema: Schema<IOperatingHours> = new Schema({
    _id: false,
    day: { type: String, required: true, enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] },
    isOpen: { type: Boolean, default: false },
    start: String,
    end: String,
});


const polyclinicSchema: Schema<IPolyclinicDocument> = new Schema(
  {
    polyclinicId: { type: String, unique: true, index: true },
    name: { type: String, required: true, unique: true }, // Nama poli harus unik
    department: {
      type: String,
      required: true,
      enum: [ "Umum", "Spesialis", "Gigi", "Mata", "THT", "Kulit", "Jantung", "Paru", "Saraf", "Bedah", "Kandungan", "Anak", "Psikiatri", "Gizi", "Rehabilitasi" ],
    },
    description: String,
    assignedDoctors: [
      {
        _id: false,
        doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    // --- BARU: Menambahkan field ke skema ---
    tarif: { type: Number, default: 0 },
    operatingHours: [operatingHoursSchema],
    status: {
      type: String,
      enum: ["Active", "Maintenance", "Closed"],
      default: "Active",
    },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true }
  },
  {
    timestamps: true,
  }
);

polyclinicSchema.pre<IPolyclinicDocument>('save', function (next) {
  if (!this.polyclinicId) {
    this.polyclinicId = `POL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  
  // Jika operatingHours kosong, inisialisasi default
  if (!this.operatingHours || this.operatingHours.length === 0) {
      this.operatingHours = [
          { day: 'Senin', isOpen: false },
          { day: 'Selasa', isOpen: false },
          { day: 'Rabu', isOpen: false },
          { day: 'Kamis', isOpen: false },
          { day: 'Jumat', isOpen: false },
          { day: 'Sabtu', isOpen: false },
          { day: 'Minggu', isOpen: false },
      ];
  }

  next();
});

const Polyclinic: Model<IPolyclinicDocument> = mongoose.model<IPolyclinicDocument>("Polyclinic", polyclinicSchema);

export default Polyclinic;