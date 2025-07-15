"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
class DoctorController {
    // Get all doctors with filtering and pagination
    async getAllDoctors(req, res, next) {
        try {
            const { page = '1', limit = '10', specialization, status, search } = req.query;
            const filter = { role: "doctor" };
            if (specialization) {
                filter.specialization = new RegExp(`^${specialization}$`, "i");
            }
            if (status) {
                filter.isActive = status === "active";
            }
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const [doctors, total] = await Promise.all([
                User_1.default.find(filter)
                    .select("-password -__v")
                    .sort({ name: 1 })
                    .limit(limitNum)
                    .skip((pageNum - 1) * limitNum)
                    .lean(), // <-- .lean() memastikan objek yang dikembalikan bersih
                User_1.default.countDocuments(filter),
            ]);
            const response = {
                success: true,
                data: doctors, // <-- PERBAIKAN: Type assertion untuk memastikan kesesuaian
                pagination: {
                    totalPages: Math.ceil(total / limitNum),
                    currentPage: pageNum,
                    total
                },
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // Get a single doctor by ID
    async getDoctorById(req, res, next) {
        try {
            const doctor = await User_1.default.findOne({
                _id: req.params.id,
                role: "doctor"
            }).select("-password").lean();
            if (!doctor) {
                res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
                return;
            }
            res.json({ success: true, data: doctor }); // <-- PERBAIKAN: Type assertion
        }
        catch (error) {
            next(error);
        }
    }
    // Create a new doctor (as a User with 'doctor' role)
    async createDoctor(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        try {
            const { email, licenseNumber } = req.body;
            const existingUser = await User_1.default.findOne({
                $or: [{ email: email.toLowerCase() }, { licenseNumber }]
            }).lean();
            if (existingUser) {
                const message = existingUser.email === email.toLowerCase() ? "Email sudah terdaftar" : "Nomor lisensi sudah terdaftar";
                res.status(400).json({ success: false, message });
                return;
            }
            const doctor = new User_1.default({ ...req.body, role: "doctor", email: email.toLowerCase() });
            await doctor.save();
            const doctorResponse = doctor.toObject();
            delete doctorResponse.password;
            res.status(201).json({
                success: true,
                message: "Dokter berhasil dibuat",
                data: doctorResponse // <-- PERBAIKAN: Type assertion
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Update doctor's details
    async updateDoctor(req, res, next) {
        try {
            const { licenseNumber } = req.body;
            if (licenseNumber) {
                const existingLicense = await User_1.default.findOne({
                    licenseNumber,
                    _id: { $ne: req.params.id }
                }).lean();
                if (existingLicense) {
                    res.status(400).json({ success: false, message: "Nomor lisensi sudah terdaftar pada dokter lain" });
                    return;
                }
            }
            const doctor = await User_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select("-password").lean(); // <-- PERBAIKAN: Tambahkan .lean()
            if (!doctor || doctor.role !== 'doctor') {
                res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
                return;
            }
            res.json({ success: true, message: "Dokter berhasil diupdate", data: doctor });
        }
        catch (error) {
            next(error);
        }
    }
    // Soft delete a doctor by setting them as inactive
    async deleteDoctor(req, res, next) {
        try {
            const doctor = await User_1.default.findOneAndUpdate({ _id: req.params.id, role: "doctor" }, { isActive: false }, { new: true }).lean();
            if (!doctor) {
                res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
                return;
            }
            res.json({ success: true, message: "Dokter berhasil dinonaktifkan" });
        }
        catch (error) {
            next(error);
        }
    }
    // Get doctor statistics
    async getDoctorStats(req, res, next) {
        try {
            const [totalDoctors, activeDoctors, specializationStats] = await Promise.all([
                User_1.default.countDocuments({ role: "doctor" }),
                User_1.default.countDocuments({ role: "doctor", isActive: true }),
                User_1.default.aggregate([
                    { $match: { role: "doctor", isActive: true } },
                    { $group: { _id: "$specialization", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                ]),
            ]);
            res.json({
                success: true,
                data: {
                    overview: { total: totalDoctors, active: activeDoctors, inactive: totalDoctors - activeDoctors },
                    specializations: specializationStats,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get and Update doctor's work schedule
    async getDoctorSchedule(req, res, next) {
        // ...
    }
    async updateDoctorSchedule(req, res, next) {
        // ...
    }
}
exports.default = new DoctorController();
