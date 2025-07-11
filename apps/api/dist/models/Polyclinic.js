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
const polyclinicSchema = new mongoose_1.Schema({
    polyclinicId: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    department: {
        type: String,
        required: true,
        enum: [
            "Umum", "Spesialis", "Gigi", "Mata", "THT", "Kulit", "Jantung", "Paru",
            "Saraf", "Bedah", "Kandungan", "Anak", "Psikiatri", "Gizi", "Rehabilitasi",
        ],
    },
    description: String,
    operatingHours: {
        monday: { start: String, end: String, isOpen: Boolean },
        tuesday: { start: String, end: String, isOpen: Boolean },
        wednesday: { start: String, end: String, isOpen: Boolean },
        thursday: { start: String, end: String, isOpen: Boolean },
        friday: { start: String, end: String, isOpen: Boolean },
        saturday: { start: String, end: String, isOpen: Boolean },
        sunday: { start: String, end: String, isOpen: Boolean },
    },
    capacity: {
        maxPatientsPerDay: Number,
        maxPatientsPerHour: Number,
    },
    facilities: [String],
    location: {
        building: String,
        floor: String,
        room: String,
    },
    assignedDoctors: [
        {
            doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Doctor" },
            schedule: [
                {
                    day: String,
                    startTime: String,
                    endTime: String,
                },
            ],
        },
    ],
    status: {
        type: String,
        enum: ["Active", "Maintenance", "Closed"],
        default: "Active",
    },
    monthlyStats: {
        totalPatients: { type: Number, default: 0 },
        averageWaitTime: { type: Number, default: 0 },
        satisfactionRating: { type: Number, default: 0 },
    },
}, {
    timestamps: true,
});
polyclinicSchema.pre('save', function (next) {
    if (!this.polyclinicId) {
        this.polyclinicId = `POL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }
    next();
});
const Polyclinic = mongoose_1.default.model("Polyclinic", polyclinicSchema);
exports.default = Polyclinic;
