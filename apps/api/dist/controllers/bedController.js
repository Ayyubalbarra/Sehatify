"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Bed_1 = __importDefault(require("../models/Bed"));
const Patient_1 = __importDefault(require("../models/Patient"));
const express_validator_1 = require("express-validator");
class BedController {
    async getAllBeds(req, res, next) {
        try {
            const { page = 1, limit = 10, status, ward, bedType } = req.query;
            const filter = {};
            if (status)
                filter.status = status;
            if (ward)
                filter.ward = new RegExp(`^${ward}$`, "i");
            if (bedType)
                filter.bedType = bedType;
            const [beds, total] = await Promise.all([
                Bed_1.default.find(filter)
                    .populate("currentPatient", "name patientId")
                    .sort({ ward: 1, roomNumber: 1, bedNumber: 1 })
                    .limit(Number(limit))
                    .skip((Number(page) - 1) * Number(limit))
                    .lean(),
                Bed_1.default.countDocuments(filter),
            ]);
            res.json({
                success: true,
                data: beds,
                pagination: { totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getBedById(req, res, next) {
        try {
            const bed = await Bed_1.default.findById(req.params.id).populate("currentPatient", "name patientId phone").lean();
            if (!bed) {
                return res.status(404).json({ success: false, message: "Tempat tidur tidak ditemukan" });
            }
            res.json({ success: true, data: bed });
        }
        catch (error) {
            next(error);
        }
    }
    async createBed(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        try {
            const { bedNumber, roomNumber, ward } = req.body;
            const existingBed = await Bed_1.default.findOne({ bedNumber, roomNumber, ward });
            if (existingBed) {
                return res.status(400).json({ success: false, message: "Kombinasi tempat tidur, ruangan, dan bangsal sudah ada" });
            }
            const bed = new Bed_1.default({ ...req.body, createdBy: req.user?.userId });
            await bed.save();
            res.status(201).json({ success: true, message: "Tempat tidur berhasil dibuat", data: bed });
        }
        catch (error) {
            next(error);
        }
    }
    async updateBed(req, res, next) {
        try {
            const bed = await Bed_1.default.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.user?.userId }, { new: true });
            if (!bed) {
                return res.status(404).json({ success: false, message: "Tempat tidur tidak ditemukan" });
            }
            res.json({ success: true, message: "Tempat tidur berhasil diupdate", data: bed });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteBed(req, res, next) {
        try {
            const bed = await Bed_1.default.findById(req.params.id);
            if (!bed)
                return res.status(404).json({ success: false, message: "Tempat tidur tidak ditemukan" });
            if (bed.status === "occupied") {
                return res.status(400).json({ success: false, message: "Tidak dapat menghapus tempat tidur yang sedang ditempati" });
            }
            await Bed_1.default.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: "Tempat tidur berhasil dihapus" });
        }
        catch (error) {
            next(error);
        }
    }
    async assignPatientToBed(req, res, next) {
        try {
            const { patientId } = req.body;
            const bed = await Bed_1.default.findById(req.params.id);
            if (!bed || bed.status !== "available") {
                return res.status(400).json({ success: false, message: "Tempat tidur tidak ditemukan atau tidak tersedia" });
            }
            const patient = await Patient_1.default.findById(patientId);
            if (!patient)
                return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
            bed.currentPatient = patientId;
            bed.status = "occupied";
            bed.occupiedAt = new Date();
            await bed.save();
            res.json({ success: true, message: "Pasien berhasil ditempatkan", data: bed });
        }
        catch (error) {
            next(error);
        }
    }
    async updateBedStatus(req, res, next) {
        try {
            const { status } = req.body;
            const updateData = { status, updatedBy: req.user?.userId };
            if (status === 'available') {
                updateData.currentPatient = null;
                updateData.occupiedAt = null;
            }
            const bed = await Bed_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
            if (!bed)
                return res.status(404).json({ success: false, message: "Tempat tidur tidak ditemukan" });
            res.json({ success: true, message: "Status tempat tidur berhasil diupdate", data: bed });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new BedController();
