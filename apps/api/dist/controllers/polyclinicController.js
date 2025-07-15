"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Polyclinic_1 = __importDefault(require("../models/Polyclinic"));
const User_1 = __importDefault(require("../models/User")); // Menggunakan model User untuk dokter
const Visit_1 = __importDefault(require("../models/Visit"));
const modelHelpers_1 = require("../utils/modelHelpers");
class PolyclinicController {
    // Get all polyclinics with filtering and pagination
    async getAllPolyclinics(req, res, next) {
        try {
            const { page = 1, limit = 10, search, department } = req.query;
            const query = { isActive: true };
            if (search)
                query.name = { $regex: search, $options: "i" };
            if (department)
                query.department = department;
            const [polyclinics, total] = await Promise.all([
                Polyclinic_1.default.find(query)
                    .sort({ name: 1 })
                    .limit(Number(limit))
                    .skip((Number(page) - 1) * Number(limit))
                    .lean(), // <-- Perbaikan
                Polyclinic_1.default.countDocuments(query),
            ]);
            const polyclinicsWithStats = await Promise.all(polyclinics.map(async (poly) => {
                const stats = await this.getPolyclinicStats(poly._id);
                return { ...poly, stats };
            }));
            res.json({
                success: true,
                data: polyclinicsWithStats,
                pagination: { totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get a single polyclinic by ID
    async getPolyclinicById(req, res, next) {
        try {
            const polyclinic = await Polyclinic_1.default.findById(req.params.id).lean(); // <-- Perbaikan
            if (!polyclinic) {
                return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
            }
            // Menggunakan `polyclinic.name` untuk mencari dokter berdasarkan spesialisasi
            const [stats, doctors] = await Promise.all([
                this.getPolyclinicStats(req.params.id),
                User_1.default.find({ role: 'doctor', specialization: polyclinic.name, isActive: true }).select("name specialization").lean()
            ]);
            res.json({
                success: true,
                data: { ...polyclinic, stats, doctors: doctors }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Create a new polyclinic
    async createPolyclinic(req, res, next) {
        try {
            const polyclinicData = { ...req.body, polyclinicId: (0, modelHelpers_1.generatePolyclinicId)(), createdBy: req.user?._id };
            const polyclinic = new Polyclinic_1.default(polyclinicData);
            await polyclinic.save();
            res.status(201).json({
                success: true,
                message: "Poliklinik berhasil ditambahkan",
                data: polyclinic.toObject() // <-- Perbaikan
            });
        }
        catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: `Nama atau ID poliklinik sudah digunakan` });
            }
            next(error);
        }
    }
    // Update polyclinic's details
    async updatePolyclinic(req, res, next) {
        try {
            const updateData = { ...req.body, updatedBy: req.user?._id };
            const polyclinic = await Polyclinic_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).lean(); // <-- Perbaikan
            if (!polyclinic) {
                return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
            }
            res.json({
                success: true,
                message: "Data poliklinik berhasil diperbarui",
                data: polyclinic // <-- Perbaikan
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Soft delete a polyclinic
    async deletePolyclinic(req, res, next) {
        try {
            const updateData = { isActive: false, updatedBy: req.user?._id };
            const polyclinic = await Polyclinic_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
            if (!polyclinic) {
                return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
            }
            res.json({ success: true, message: "Poliklinik berhasil dinonaktifkan" });
        }
        catch (error) {
            next(error);
        }
    }
    // Get list of unique departments
    async getDepartments(req, res, next) {
        try {
            const departments = await Polyclinic_1.default.distinct("department", { isActive: true });
            res.json({ success: true, data: departments.filter(Boolean) });
        }
        catch (error) {
            next(error);
        }
    }
    // Helper to get stats for a polyclinic
    async getPolyclinicStats(polyclinicId) {
        try {
            const polyclinicObjectId = new mongoose_1.Types.ObjectId(polyclinicId);
            const [monthlyVisits, activeDoctors] = await Promise.all([
                Visit_1.default.countDocuments({ polyclinicId: polyclinicObjectId, visitDate: { $gte: new Date(new Date().setDate(1)) } }),
                // Asumsi dokter tidak langsung terikat ke ID poliklinik, tetapi melalui nama spesialisasinya
                User_1.default.countDocuments({ role: 'doctor', specialization: { $exists: true }, isActive: true })
            ]);
            return { monthlyVisits, activeDoctors };
        }
        catch (error) {
            console.error(`Error fetching stats for polyclinic ${polyclinicId}:`, error);
            return { monthlyVisits: 0, activeDoctors: 0 };
        }
    }
}
exports.default = new PolyclinicController();
