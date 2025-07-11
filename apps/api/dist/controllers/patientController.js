"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Patient_1 = __importDefault(require("../models/Patient"));
const Visit_1 = __importDefault(require("../models/Visit"));
const Queue_1 = __importDefault(require("../models/Queue"));
const modelHelpers_1 = require("../utils/modelHelpers");
class PatientController {
    // Get all patients with filtering and pagination
    async getPatients(req, res, next) {
        try {
            const { page = '1', limit = '10', search, status } = req.query;
            const query = {};
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { patientId: { $regex: search, $options: "i" } }
                ];
            }
            if (status && status !== "all") {
                query.status = status;
            }
            const pageNum = Number(page);
            const limitNum = Number(limit);
            const [patients, total] = await Promise.all([
                Patient_1.default.find(query)
                    .sort({ registrationDate: -1 })
                    .limit(limitNum)
                    .skip((pageNum - 1) * limitNum)
                    .lean(), // Menggunakan .lean<IPatient[]>() untuk mendapatkan objek JS biasa dengan tipe yang benar
                Patient_1.default.countDocuments(query),
            ]);
            const patientsWithAge = patients.map(p => ({
                ...p,
                age: ModelHelpers.calculateAge(p.dateOfBirth)
            }));
            res.json({
                success: true,
                data: patientsWithAge,
                pagination: {
                    totalPages: Math.ceil(total / limitNum),
                    currentPage: pageNum,
                    total
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get a single patient's details
    async getPatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const patient = await Patient_1.default.findOne({ patientId }).lean();
            if (!patient) {
                return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
            }
            const recentVisits = await Visit_1.default.find({ patientId: patient._id }).sort({ visitDate: -1 }).limit(5).lean();
            const lifetimeValue = recentVisits.reduce((sum, visit) => sum + (visit.totalCost || 0), 0);
            res.json({
                success: true,
                data: {
                    ...patient,
                    age: (0, modelHelpers_1.calculateAge)(patient.dateOfBirth),
                    recentVisits,
                    lifetimeValue
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get patient statistics
    async getPatientStats(req, res, next) {
        try {
            const [totalPatients, activePatients, newPatients, genderStats] = await Promise.all([
                Patient_1.default.countDocuments(),
                Patient_1.default.countDocuments({ status: "Active" }),
                Patient_1.default.countDocuments({ registrationDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
                Patient_1.default.aggregate([{ $group: { _id: "$gender", count: { $sum: 1 } } }]),
            ]);
            res.json({
                success: true,
                data: { total: totalPatients, active: activePatients, new: newPatients, genderStats },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Create a new patient
    async createPatient(req, res, next) {
        try {
            const { nik } = req.body;
            if (!ModelHelpers.validateNIK(nik)) {
                return res.status(400).json({ success: false, message: "Format NIK tidak valid" });
            }
            const existingPatient = await Patient_1.default.findOne({ nik });
            if (existingPatient) {
                return res.status(400).json({ success: false, message: "NIK sudah terdaftar" });
            }
            const patient = new Patient_1.default(req.body);
            await patient.save();
            res.status(201).json({ success: true, message: "Pasien berhasil ditambahkan", data: patient });
        }
        catch (error) {
            next(error);
        }
    }
    // Update a patient's data
    async updatePatient(req, res, next) {
        try {
            const patient = await Patient_1.default.findOneAndUpdate({ patientId: req.params.patientId }, req.body, { new: true, runValidators: true });
            if (!patient) {
                return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
            }
            res.json({ success: true, message: "Data pasien berhasil diupdate", data: patient });
        }
        catch (error) {
            next(error);
        }
    }
    // Delete a patient
    async deletePatient(req, res, next) {
        try {
            const patient = await Patient_1.default.findOne({ patientId: req.params.patientId });
            if (!patient) {
                return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
            }
            const [activeVisits, activeQueues] = await Promise.all([
                Visit_1.default.countDocuments({ patientId: patient._id, status: "Ongoing" }),
                Queue_1.default.countDocuments({ patientId: patient._id, status: { $in: ["Waiting", "In Progress"] } }),
            ]);
            if (activeVisits > 0 || activeQueues > 0) {
                return res.status(400).json({ success: false, message: "Tidak dapat menghapus pasien dengan kunjungan/antrian aktif" });
            }
            await Patient_1.default.findOneAndDelete({ patientId: req.params.patientId });
            res.json({ success: true, message: "Pasien berhasil dihapus" });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new PatientController();
