import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface untuk properti Polyclinic
export interface IPolyclinic extends Document {
  polyclinicId: string;
  name: string;
  department: 'Umum' | 'Spesialis' | 'Gigi' | 'Mata' | 'THT' | 'Kulit' | 'Jantung' | 'Paru' | 'Saraf' | 'Bedah' | 'Kandungan' | 'Anak' | 'Psikiatri' | 'Gizi' | 'Rehabilitasi';
  description?: string;
  operatingHours?: {
    [day: string]: { start?: string; end?: string; isOpen?: boolean };
  };
  capacity?: {
    maxPatientsPerDay?: number;
    maxPatientsPerHour?: number;
  };
  facilities?: string[];
  location?: {
    building?: string;
    floor?: string;
    room?: string;
  };
  assignedDoctors?: {
    doctorId?: Schema.Types.ObjectId;
    schedule?: {
      day?: string;
      startTime?: string;
      endTime?: string;
    }[];
  }[];
  status: 'Active' | 'Maintenance' | 'Closed';
  monthlyStats?: {
    totalPatients?: number;
    averageWaitTime?: number;
    satisfactionRating?: number;
  };
}

// Skema Mongoose
const polyclinicSchema: Schema<IPolyclinic> = new Schema(
  {
    polyclinicId: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    department: {
      type: String,
      required: true,
      enum: [
        "Umum", "Spesialis", "Gigi", "Mata", "THT", "Kulit", "Jantung", "Paru",
        "Saraf", "Bedah", "Kandungan", "Anak", "Psikiatri", "Gizi", "Rehabilitasi",
      ],
    },
    description: String,
    operatingHours: {
      monday: { start: String, end: String, isOpen: Boolean },
      tuesday: { start: String, end: String, isOpen: Boolean },
      wednesday: { start: String, end: String, isOpen: Boolean },
      thursday: { start: String, end: String, isOpen: Boolean },
      friday: { start: String, end: String, isOpen: Boolean },
      saturday: { start: String, end: String, isOpen: Boolean },
      sunday: { start: String, end: String, isOpen: Boolean },
    },
    capacity: {
      maxPatientsPerDay: Number,
      maxPatientsPerHour: Number,
    },
    facilities: [String],
    location: {
      building: String,
      floor: String,
      room: String,
    },
    assignedDoctors: [
      {
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
        schedule: [
          {
            day: String,
            startTime: String,
            endTime: String,
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Maintenance", "Closed"],
      default: "Active",
    },
    monthlyStats: {
      totalPatients: { type: Number, default: 0 },
      averageWaitTime: { type: Number, default: 0 },
      satisfactionRating: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

polyclinicSchema.pre<IPolyclinic>('save', function (next) {
  if (!this.polyclinicId) {
    this.polyclinicId = `POL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

const Polyclinic: Model<IPolyclinic> = mongoose.model<IPolyclinic>("Polyclinic", polyclinicSchema);

export default Polyclinic;
