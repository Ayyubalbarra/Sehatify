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
const queueSchema = new mongoose_1.Schema({
    queueId: { type: String, unique: true, index: true },
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    polyclinicId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Polyclinic", required: true, index: true },
    scheduleId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Schedule", required: true },
    queueNumber: { type: Number, required: true },
    queueDate: { type: Date, required: true, index: true },
    appointmentTime: String,
    status: {
        type: String,
        enum: ["Waiting", "In Progress", "Completed", "Cancelled", "No Show"],
        default: "Waiting",
        index: true,
    },
    priority: {
        type: String,
        enum: ["Normal", "Urgent", "Emergency"],
        default: "Normal",
    },
    registrationTime: { type: Date, default: Date.now },
    calledTime: Date,
    startConsultationTime: Date,
    endConsultationTime: Date,
    estimatedWaitTime: Number,
    actualWaitTime: Number,
    consultationDuration: Number,
    notes: String,
    complaints: String,
}, {
    timestamps: true,
});
queueSchema.pre('save', function (next) {
    if (!this.queueId) {
        this.queueId = `QUE${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }
    next();
});
queueSchema.index({ queueDate: 1, status: 1 });
queueSchema.index({ polyclinicId: 1, queueDate: 1 });
const Queue = mongoose_1.default.model("Queue", queueSchema);
exports.default = Queue;
