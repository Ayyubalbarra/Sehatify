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
const patientSchema = new mongoose_1.Schema({
    patientId: { type: String, unique: true, index: true },
    nik: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Laki-laki", "Perempuan"], required: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true },
    address: {
        street: String,
        city: String,
        province: String,
        postalCode: String,
    },
    bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    allergies: [String],
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
    },
    registrationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    lastVisit: Date,
}, {
    timestamps: true,
});
patientSchema.pre('save', function (next) {
    if (!this.patientId) {
        this.patientId = `PAT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }
    next();
});
patientSchema.index({ name: 1, status: 1 });
patientSchema.index({ registrationDate: -1 });
const Patient = mongoose_1.default.model("Patient", patientSchema);
exports.default = Patient;
