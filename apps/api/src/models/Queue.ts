// apps/api/src/models/Queue.ts

import mongoose, { Document, Schema, Model } from 'mongoose';

// Tipe IQueue tidak perlu diekspor jika hanya digunakan di sini
interface IQueue extends Document {
  patientId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  polyclinicId: Schema.Types.ObjectId;
  scheduleId: Schema.Types.ObjectId;
  queueNumber: number;
  queueDate: Date;
  appointmentTime: string;
  status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  notes?: string;
  createdBy: Schema.Types.ObjectId;
}

const queueSchema: Schema<IQueue> = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "PatientUser", required: true, index: true }, 
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, 
    polyclinicId: { type: Schema.Types.ObjectId, ref: "Polyclinic", required: true, index: true },
    scheduleId: { type: Schema.Types.ObjectId, ref: "Schedule", required: true },
    queueNumber: { type: Number }, // Dibuat otomatis, jadi tidak 'required'
    queueDate: { type: Date, required: true, index: true },
    appointmentTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["Waiting", "In Progress", "Completed", "Cancelled", "No Show"],
      default: "Waiting",
      index: true,
    },
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'PatientUser', required: true },
  },
  {
    timestamps: true,
  }
);

// ✅ HOOK UNTUK MEMBUAT NOMOR ANTRIAN OTOMATIS
// Sebelum menyimpan antrian baru, cari nomor terakhir di jadwal yang sama dan +1
queueSchema.pre<IQueue>('save', async function (next) {
  if (this.isNew) {
    const lastQueue = await mongoose.model('Queue').findOne({ scheduleId: this.scheduleId }).sort({ queueNumber: -1 });
    this.queueNumber = (lastQueue?.queueNumber || 0) + 1;
  }
  next();
});

queueSchema.index({ queueDate: 1, status: 1 });
queueSchema.index({ polyclinicId: 1, queueDate: 1 });

const Queue: Model<IQueue> = mongoose.model<IQueue>("Queue", queueSchema);

export default Queue;