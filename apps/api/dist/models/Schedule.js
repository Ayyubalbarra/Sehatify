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
const scheduleSchema = new mongoose_1.Schema({
    scheduleId: { type: String, unique: true, index: true },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    polyclinicId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Polyclinic", required: true, index: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalSlots: { type: Number, required: true, default: 20 },
    bookedSlots: { type: Number, default: 0 },
    availableSlots: { type: Number, default: 20 },
    appointments: [
        {
            appointmentId: String,
            patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Patient" },
            appointmentTime: String,
            status: {
                type: String,
                enum: ["Scheduled", "Completed", "Cancelled", "No Show"],
                default: "Scheduled",
            },
            queueNumber: Number,
        },
    ],
    status: {
        type: String,
        enum: ["Active", "Cancelled", "Completed"],
        default: "Active",
    },
    notes: String,
    estimatedWaitTime: { type: Number, default: 15 },
}, {
    timestamps: true,
});
scheduleSchema.pre('save', function (next) {
    if (!this.scheduleId) {
        this.scheduleId = `SCH${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }
    this.availableSlots = this.totalSlots - this.bookedSlots;
    next();
});
scheduleSchema.index({ date: 1, doctorId: 1 });
scheduleSchema.index({ date: 1, polyclinicId: 1 });
const Schedule = mongoose_1.default.model("Schedule", scheduleSchema);
exports.default = Schedule;
