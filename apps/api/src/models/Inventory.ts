// apps/api/src/models/Inventory.ts

import mongoose, { Document, Schema, Model } from 'mongoose';

// --- DIUBAH: Ini menjadi interface utama untuk atribut data ---
export interface IInventory {
  _id?: any;
  itemId?: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitPrice: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
  lastRestockDate?: Date;
  supplier?: string;
  expirationDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// --- BARU: Menggunakan intersection type (&) untuk membuat tipe Dokumen Mongoose ---
// Ini lebih aman dan modern daripada `extends` beberapa interface
export type IInventoryDocument = IInventory & Document;

// --- DIUBAH: Schema sekarang menggunakan tipe Dokumen yang baru ---
const inventorySchema: Schema<IInventoryDocument> = new Schema(
  {
    itemId: { type: String, unique: true, required: false },
    name: { type: String, required: [true, "Nama item harus diisi"], trim: true, maxlength: 100 },
    category: { type: String, required: [true, "Kategori harus diisi"], trim: true },
    currentStock: { type: Number, required: true, default: 0, min: 0 },
    minimumStock: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, required: [true, "Unit harus diisi"], trim: true },
    unitPrice: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ["Available", "Low Stock", "Out of Stock"], default: "Available" },
    lastRestockDate: { type: Date },
    supplier: { type: String, trim: true },
    expirationDate: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware pre-save (tidak ada perubahan)
inventorySchema.pre('save', function (this: IInventoryDocument, next) {
  if (this.isNew && !this.itemId) {
    this.itemId = `ITEM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  }

  if (this.currentStock <= 0) {
    this.status = "Out of Stock";
  } else if (this.currentStock <= this.minimumStock) {
    this.status = "Low Stock";
  } else {
    this.status = "Available";
  }
  next();
});

// --- DIUBAH: Model sekarang menggunakan tipe Dokumen yang baru ---
const Inventory: Model<IInventoryDocument> = mongoose.model<IInventoryDocument>("Inventory", inventorySchema);

export default Inventory;