// apps/api/src/models/Queue.ts

import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface untuk properti Queue
export interface IQueue extends Document {
  queueId: string;
  patientId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  polyclinicId: Schema.Types.ObjectId;
  scheduleId: Schema.Types.ObjectId;
  queueNumber: number;
  queueDate: Date;
  appointmentTime?: string;
  status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  priority: 'Normal' | 'Urgent' | 'Emergency';
  registrationTime: Date;
  calledTime?: Date;
  startConsultationTime?: Date;
  endConsultationTime?: Date;
  estimatedWaitTime?: number;
  actualWaitTime?: number;
  consultationDuration?: number;
  notes?: string;
  complaints?: string;
}

// Skema Mongoose
const queueSchema: Schema<IQueue> = new Schema(
  {
    queueId: { type: String, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "PatientUser", required: true, index: true }, // Ganti ref ke PatientUser
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, // Ganti ref ke User
    polyclinicId: { type: Schema.Types.ObjectId, ref: "Polyclinic", required: true, index: true },
    scheduleId: { type: Schema.Types.ObjectId, ref: "Schedule", required: true },
    queueNumber: { type: Number, required: true },
    queueDate: { type: Date, required: true, index: true },
    appointmentTime: String,
    status: {
      type: String,
      enum: ["Waiting", "In Progress", "Completed", "Cancelled", "No Show"],
      default: "Waiting",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Normal", "Urgent", "Emergency"],
      default: "Normal",
    },
    registrationTime: { type: Date, default: Date.now },
    calledTime: Date,
    startConsultationTime: Date,
    endConsultationTime: Date,
    estimatedWaitTime: Number,
    actualWaitTime: Number,
    consultationDuration: Number,
    notes: String,
    complaints: String,
  },
  {
    timestamps: true,
  }
);

queueSchema.pre<IQueue>('save', function (next) {
  if (!this.queueId) {
    this.queueId = `QUE${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

queueSchema.index({ queueDate: 1, status: 1 });
queueSchema.index({ polyclinicId: 1, queueDate: 1 });

const Queue: Model<IQueue> = mongoose.model<IQueue>("Queue", queueSchema);

export default Queue;