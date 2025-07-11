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
const visitSchema = new mongoose_1.Schema({
    visitId: { type: String, unique: true, index: true },
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Doctor", required: true },
    polyclinicId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Polyclinic", required: true },
    queueId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Queue" },
    visitDate: { type: Date, required: true, index: true },
    visitType: {
        type: String,
        enum: ["Consultation", "Follow-up", "Emergency", "Check-up", "Treatment"],
        required: true,
    },
    chiefComplaint: String,
    symptoms: [String],
    vitalSigns: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        weight: Number,
        height: Number,
    },
    diagnosis: {
        primary: String,
        secondary: [String],
        icdCode: String,
    },
    treatment: String,
    prescription: [
        {
            medication: String,
            dosage: String,
            frequency: String,
            duration: String,
            instructions: String,
        },
    ],
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date,
    followUpInstructions: String,
    status: { type: String, enum: ["Completed", "Ongoing", "Cancelled"], default: "Ongoing" },
    totalCost: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Partially Paid", "Insurance"], default: "Pending" },
    doctorNotes: String,
    referral: {
        isReferred: { type: Boolean, default: false },
        referredTo: String,
        referralReason: String,
        referralDate: Date,
    },
}, {
    timestamps: true,
});
visitSchema.pre('save', function (next) {
    if (!this.visitId) {
        this.visitId = `VIS${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }
    next();
});
visitSchema.index({ visitDate: -1 });
visitSchema.index({ patientId: 1, visitDate: -1 });
const Visit = mongoose_1.default.model("Visit", visitSchema);
exports.default = Visit;
