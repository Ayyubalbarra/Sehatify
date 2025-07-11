import mongoose, { Schema, Document, Model } from 'mongoose';

// Definisikan tipe data untuk dokumen Bed
export interface IBed extends Document {
  bedId: string;
  ward: 'ICU' | 'ICCU' | 'NICU' | 'General Ward' | 'VIP' | 'Emergency' | 'Isolation' | 'Maternity' | 'Pediatric';
  roomNumber: string;
  bedNumber: string;
  bedType: 'Standard' | 'Electric' | 'ICU' | 'Pediatric' | 'Maternity' | 'VIP';
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'reserved';
  currentPatient?: mongoose.Schema.Types.ObjectId;
  occupiedAt?: Date;
  dailyRate: number;
  createdBy?: mongoose.Schema.Types.ObjectId;
  updatedBy?: mongoose.Schema.Types.ObjectId;
}

const bedSchema = new Schema<IBed>(
  {
    bedId: { type: String, unique: true, index: true },
    ward: {
      type: String,
      required: true,
      enum: ["ICU", "ICCU", "NICU", "General Ward", "VIP", "Emergency", "Isolation", "Maternity", "Pediatric"],
      index: true,
    },
    roomNumber: { type: String, required: true },
    bedNumber: { type: String, required: true },
    bedType: {
      type: String,
      enum: ["Standard", "Electric", "ICU", "Pediatric", "Maternity", "VIP"],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "cleaning", "reserved"],
      default: "available",
      index: true,
    },
    currentPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    occupiedAt: { type: Date },
    dailyRate: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware untuk generate ID unik
bedSchema.pre<IBed>("save", function (next) {
  if (!this.bedId) {
    this.bedId = `BED-${this.ward.replace(/\s+/g, '').toUpperCase()}-${this.roomNumber}${this.bedNumber}`;
  }
  next();
});

// Index untuk pencarian yang efisien
bedSchema.index({ ward: 1, status: 1 });
bedSchema.index({ ward: 1, roomNumber: 1, bedNumber: 1 }, { unique: true });

const Bed: Model<IBed> = mongoose.model<IBed>("Bed", bedSchema);

export default Bed;