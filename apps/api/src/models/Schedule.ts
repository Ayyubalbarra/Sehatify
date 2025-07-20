// apps/api/src/models/Schedule.ts

import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface untuk atribut data murni
export interface ISchedule {
  _id: mongoose.Types.ObjectId;
  scheduleId: string;
  doctorId: mongoose.Schema.Types.ObjectId;
  polyclinicId: mongoose.Schema.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  status: 'Active' | 'Cancelled' | 'Completed' | 'Full';
  notes?: string;
}

// Tipe untuk Dokumen Mongoose
export type IScheduleDocument = ISchedule & Document;

const scheduleSchema: Schema<IScheduleDocument> = new Schema(
  {
    scheduleId: { type: String, unique: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, 
    polyclinicId: { type: Schema.Types.ObjectId, ref: "Polyclinic", required: true, index: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalSlots: { type: Number, required: true, default: 20 },
    bookedSlots: { type: Number, default: 0 },
    availableSlots: { type: Number, default: 20 },
    status: {
      type: String,
      enum: ["Active", "Cancelled", "Completed", "Full"],
      default: "Active",
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

scheduleSchema.pre<IScheduleDocument>('save', function (next) {
  if (!this.scheduleId) {
    this.scheduleId = `SCH${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  this.availableSlots = this.totalSlots - this.bookedSlots;
  next();
});

const Schedule: Model<IScheduleDocument> = mongoose.model<IScheduleDocument>("Schedule", scheduleSchema);

export default Schedule;
