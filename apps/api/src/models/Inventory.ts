import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface untuk properti Inventory
export interface IInventory extends Document {
  itemId: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitPrice: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
  lastRestockDate?: Date;
}

// Skema Mongoose
const inventorySchema: Schema<IInventory> = new Schema(
  {
    itemId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Nama item harus diisi"],
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: [true, "Kategori harus diisi"],
      trim: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minimumStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: [true, "Unit harus diisi"],
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Available", "Low Stock", "Out of Stock"],
      default: "Available",
    },
    lastRestockDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
    versionKey: false,
  }
);

// Middleware untuk update status secara otomatis berdasarkan stok
inventorySchema.pre<IInventory>('save', function (next) {
  if (this.currentStock <= 0) {
    this.status = "Out of Stock";
  } else if (this.currentStock <= this.minimumStock) {
    this.status = "Low Stock";
  } else {
    this.status = "Available";
  }
  next();
});

const Inventory: Model<IInventory> = mongoose.model<IInventory>("Inventory", inventorySchema);

export default Inventory;
