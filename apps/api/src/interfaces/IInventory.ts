import { Document } from 'mongoose';

export interface IInventory extends Document {
  _id: string;
  itemId: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  status: 'Active' | 'Inactive';
  supplier?: string;
  description?: string;
  lastRestockDate?: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}