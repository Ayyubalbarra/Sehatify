// apps/api/src/models/Hospital.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  address: string;
  polyclinics: Schema.Types.ObjectId[];
}

const hospitalSchema: Schema<IHospital> = new Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  polyclinics: [{ type: Schema.Types.ObjectId, ref: 'Polyclinic' }]
}, { timestamps: true });

const Hospital: Model<IHospital> = mongoose.model<IHospital>('Hospital', hospitalSchema);
export default Hospital;