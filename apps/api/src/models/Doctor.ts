import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface untuk properti Doctor
export interface IDoctor extends Document {
  doctorId: string;
  employeeId: string;
  name: string;
  specialization: 'Umum' | 'Spesialis Dalam' | 'Spesialis Bedah' | 'Spesialis Anak' | 'Spesialis Kandungan' | 'Spesialis Jantung' | 'Spesialis Saraf' | 'Spesialis Mata' | 'Spesialis THT' | 'Spesialis Kulit' | 'Spesialis Paru' | 'Spesialis Jiwa' | 'Spesialis Gigi';
  phone?: string;
  email?: string;
  licenseNumber: string;
  joinDate: Date;
  status: 'Active' | 'On Leave' | 'Inactive';
}

// Skema Mongoose
const doctorSchema: Schema<IDoctor> = new Schema(
  {
    doctorId: {
      type: String,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    specialization: {
      type: String,
      required: true,
      enum: [
        "Umum",
        "Spesialis Dalam",
        "Spesialis Bedah",
        "Spesialis Anak",
        "Spesialis Kandungan",
        "Spesialis Jantung",
        "Spesialis Saraf",
        "Spesialis Mata",
        "Spesialis THT",
        "Spesialis Kulit",
        "Spesialis Paru",
        "Spesialis Jiwa",
        "Spesialis Gigi",
      ],
    },
    phone: String,
    email: {
      type: String,
      lowercase: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    joinDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

doctorSchema.pre<IDoctor>('save', function (next) {
  if (!this.doctorId) {
    this.doctorId = `DOC${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

const Doctor: Model<IDoctor> = mongoose.model<IDoctor>("Doctor", doctorSchema);
export default Doctor;
