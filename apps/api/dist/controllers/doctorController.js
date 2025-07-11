"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
// Import models - adjust paths as needed
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
                    .lean(),
                User_1.default.countDocuments(filter),
            ]);
            const response = {
                success: true,
                data: doctors,
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
                const response = {
                    success: false,
                    message: "Dokter tidak ditemukan"
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: doctor
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // Create a new doctor (as a User with 'doctor' role)
    async createDoctor(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const response = {
                success: false,
                errors: errors.array()
            };
            res.status(400).json(response);
            return;
        }
        try {
            const { email, licenseNumber } = req.body;
            const existingUser = await User_1.default.findOne({
                $or: [
                    { email: email.toLowerCase() },
                    { licenseNumber }
                ]
            });
            if (existingUser) {
                const message = existingUser.email === email.toLowerCase()
                    ? "Email sudah terdaftar"
                    : "Nomor lisensi sudah terdaftar";
                const response = {
                    success: false,
                    message
                };
                res.status(400).json(response);
                return;
            }
            const doctor = new User_1.default({
                ...req.body,
                role: "doctor",
                email: email.toLowerCase()
            });
            await doctor.save();
            const doctorResponse = doctor.toObject();
            delete doctorResponse.password;
            const response = {
                success: true,
                message: "Dokter berhasil dibuat",
                data: doctorResponse
            };
            res.status(201).json(response);
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
                });
                if (existingLicense) {
                    const response = {
                        success: false,
                        message: "Nomor lisensi sudah terdaftar pada dokter lain"
                    };
                    res.status(400).json(response);
                    return;
                }
            }
            const doctor = await User_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select("-password");
            if (!doctor || doctor.role !== 'doctor') {
                const response = {
                    success: false,
                    message: "Dokter tidak ditemukan"
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                message: "Dokter berhasil diupdate",
                data: doctor
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // Soft delete a doctor by setting them as inactive
    async deleteDoctor(req, res, next) {
        try {
            const doctor = await User_1.default.findOneAndUpdate({ _id: req.params.id, role: "doctor" }, { isActive: false }, { new: true });
            if (!doctor) {
                const response = {
                    success: false,
                    message: "Dokter tidak ditemukan"
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                message: "Dokter berhasil dinonaktifkan"
            };
            res.json(response);
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
            const response = {
                success: true,
                data: {
                    overview: {
                        total: totalDoctors,
                        active: activeDoctors,
                        inactive: totalDoctors - activeDoctors
                    },
                    specializations: specializationStats,
                },
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // Get doctor's work schedule
    async getDoctorSchedule(req, res, next) {
        try {
            const doctor = await User_1.default.findOne({
                _id: req.params.id,
                role: "doctor"
            }).select("name specialization workSchedule").lean();
            if (!doctor) {
                const response = {
                    success: false,
                    message: "Dokter tidak ditemukan"
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: doctor
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // Update doctor's work schedule
    async updateDoctorSchedule(req, res, next) {
        try {
            const { schedule } = req.body;
            const doctor = await User_1.default.findOneAndUpdate({ _id: req.params.id, role: "doctor" }, { workSchedule: schedule }, { new: true, runValidators: true }).select("name specialization workSchedule");
            if (!doctor) {
                const response = {
                    success: false,
                    message: "Dokter tidak ditemukan"
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                message: "Jadwal dokter berhasil diupdate",
                data: doctor
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new DoctorController();
