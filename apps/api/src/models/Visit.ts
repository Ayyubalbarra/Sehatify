import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IVisit extends Document {
  visitId: string;
  patientId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  polyclinicId: Schema.Types.ObjectId;
  queueId?: Schema.Types.ObjectId;
  visitDate: Date;
  visitType: 'Consultation' | 'Follow-up' | 'Emergency' | 'Check-up' | 'Treatment';
  chiefComplaint?: string;
  symptoms?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  diagnosis?: {
    primary?: string;
    secondary?: string[];
    icdCode?: string;
  };
  treatment?: string;
  prescription?: {
    medication?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }[];
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpInstructions?: string;
  status: 'Completed' | 'Ongoing' | 'Cancelled';
  totalCost: number;
  paymentStatus: 'Pending' | 'Paid' | 'Partially Paid' | 'Insurance';
  doctorNotes?: string;
  referral?: {
    isReferred?: boolean;
    referredTo?: string;
    referralReason?: string;
    referralDate?: Date;
  };
}

const visitSchema: Schema<IVisit> = new Schema(
  {
    visitId: { type: String, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "PatientUser", required: true, index: true }, // ✅ DIUBAH: ref menjadi "PatientUser"
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    polyclinicId: { type: Schema.Types.ObjectId, ref: "Polyclinic", required: true },
    queueId: { type: Schema.Types.ObjectId, ref: "Queue" },
    visitDate: { type: Date, required: true, index: true },
    visitType: {
      type: String,
      enum: ["Consultation", "Follow-up", "Emergency", "Check-up", "Treatment"],
      required: true,
    },
    chiefComplaint: String,
    symptoms: [String],
    vitalSigns: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      weight: Number,
      height: Number,
    },
    diagnosis: {
      primary: String,
      secondary: [String],
      icdCode: String,
    },
    treatment: String,
    prescription: [
      {
        medication: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date,
    followUpInstructions: String,
    status: { type: String, enum: ["Completed", "Ongoing", "Cancelled"], default: "Ongoing" },
    totalCost: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Partially Paid", "Insurance"], default: "Pending" },
    doctorNotes: String,
    referral: {
      isReferred: { type: Boolean, default: false },
      referredTo: String,
      referralReason: String,
      referralDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

visitSchema.pre<IVisit>('save', function (next) {
  if (!this.visitId) {
    this.visitId = `VIS${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

visitSchema.index({ visitDate: -1 });
visitSchema.index({ patientId: 1, visitDate: -1 });

const Visit: Model<IVisit> = mongoose.model<IVisit>("Visit", visitSchema);

export default Visit;