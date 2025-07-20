// apps/api/src/models/Setting.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  hospitalName: string;
  hospitalEmail: string;
  hospitalAddress: string;
  timezone: string;
  language: string;
  sessionTimeout: number; 
  passwordExpiry: number; 
}

const settingSchema: Schema<ISetting> = new Schema({
  hospitalName: { type: String, default: 'Sehatify Hospital' },
  hospitalEmail: { type: String, default: 'contact@sehatify.com' },
  hospitalAddress: { type: String, default: 'Jl. Sehat Selalu No. 1, Jakarta' },
  timezone: { type: String, default: 'Asia/Jakarta' },
  language: { type: String, default: 'id' },
  sessionTimeout: { type: Number, default: 60 },
  passwordExpiry: { type: Number, default: 90 },
});

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting', settingSchema);

export default Setting;