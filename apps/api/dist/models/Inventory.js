"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Skema Mongoose
const inventorySchema = new mongoose_1.Schema({
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
}, {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
    versionKey: false,
});
// Middleware untuk update status secara otomatis berdasarkan stok
inventorySchema.pre('save', function (next) {
    if (this.currentStock <= 0) {
        this.status = "Out of Stock";
    }
    else if (this.currentStock <= this.minimumStock) {
        this.status = "Low Stock";
    }
    else {
        this.status = "Available";
    }
    next();
});
const Inventory = mongoose_1.default.model("Inventory", inventorySchema);
exports.default = Inventory;
