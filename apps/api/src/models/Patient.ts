import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface untuk properti Patient
export interface IPatient extends Document {
  patientId: string;
  nik: string;
  name: string;
  dateOfBirth: Date;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  registrationDate: Date;
  status: 'Active' | 'Inactive';
  lastVisit?: Date;
}

// Skema Mongoose
const patientSchema: Schema<IPatient> = new Schema(
  {
    patientId: { type: String, unique: true, index: true },
    nik: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Laki-laki", "Perempuan"], required: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true },
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
    },
    bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    allergies: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    registrationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    lastVisit: Date,
  },
  {
    timestamps: true,
  }
);

patientSchema.pre<IPatient>('save', function (next) {
  if (!this.patientId) {
    this.patientId = `PAT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

patientSchema.index({ name: 1, status: 1 });
patientSchema.index({ registrationDate: -1 });

const Patient: Model<IPatient> = mongoose.model<IPatient>("Patient", patientSchema);

export default Patient;
