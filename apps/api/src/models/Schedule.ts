// apps/api/src/models/Schedule.ts

import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface untuk properti Schedule
export interface ISchedule extends Document {
  scheduleId: string;
  doctorId: Schema.Types.ObjectId;
  polyclinicId: Schema.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  appointments?: {
    appointmentId?: string;
    patientId?: Schema.Types.ObjectId;
    appointmentTime?: string;
    status?: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
    queueNumber?: number;
  }[];
  status: 'Active' | 'Cancelled' | 'Completed';
  notes?: string;
  estimatedWaitTime?: number;
}

// Skema Mongoose
const scheduleSchema: Schema<ISchedule> = new Schema(
  {
    scheduleId: { type: String, unique: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, // Ganti ref ke User
    polyclinicId: { type: Schema.Types.ObjectId, ref: "Polyclinic", required: true, index: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalSlots: { type: Number, required: true, default: 20 },
    bookedSlots: { type: Number, default: 0 },
    availableSlots: { type: Number, default: 20 },
    appointments: [
      {
        appointmentId: String,
        patientId: { type: Schema.Types.ObjectId, ref: "PatientUser" }, // Ganti ref ke PatientUser
        appointmentTime: String,
        status: {
          type: String,
          enum: ["Scheduled", "Completed", "Cancelled", "No Show"],
          default: "Scheduled",
        },
        queueNumber: Number,
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Cancelled", "Completed"],
      default: "Active",
    },
    notes: String,
    estimatedWaitTime: { type: Number, default: 15 },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.pre<ISchedule>('save', function (next) {
  if (!this.scheduleId) {
    this.scheduleId = `SCH${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  this.availableSlots = this.totalSlots - this.bookedSlots;
  next();
});

scheduleSchema.index({ date: 1, doctorId: 1 });
scheduleSchema.index({ date: 1, polyclinicId: 1 });

const Schedule: Model<ISchedule> = mongoose.model<ISchedule>("Schedule", scheduleSchema);

export default Schedule;