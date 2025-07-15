"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Visit_1 = __importDefault(require("../models/Visit"));
const Patient_1 = __importDefault(require("../models/Patient"));
const User_1 = __importDefault(require("../models/User")); // Dokter adalah User dengan role 'doctor'
const Polyclinic_1 = __importDefault(require("../models/Polyclinic"));
class VisitController {
    // Get all visits with filtering and pagination
    async getAllVisits(req, res, next) {
        try {
            const { page = 1, limit = 10, search, patientId, doctorId, status, startDate, endDate } = req.query;
            const query = {};
            if (patientId)
                query.patientId = patientId;
            if (doctorId)
                query.doctorId = doctorId;
            if (status)
                query.status = status;
            if (search)
                query['diagnosis.primary'] = { $regex: search, $options: "i" };
            if (startDate && endDate) {
                query.visitDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
            }
            const [visits, total] = await Promise.all([
                Visit_1.default.find(query)
                    .populate("patientId", "name nik")
                    .populate("doctorId", "name specialization")
                    .populate("polyclinicId", "name")
                    .sort({ visitDate: -1 })
                    .limit(Number(limit))
                    .skip((Number(page) - 1) * Number(limit))
                    .lean(), // <-- Perbaikan
                Visit_1.default.countDocuments(query),
            ]);
            res.json({ success: true, data: visits, pagination: { totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total } });
        }
        catch (error) {
            next(error);
        }
    }
    // Get a single visit by ID
    async getVisitById(req, res, next) {
        try {
            const visit = await Visit_1.default.findById(req.params.id)
                .populate("patientId")
                .populate("doctorId", "name specialization email")
                .populate("polyclinicId", "name")
                .populate("bedId", "bedNumber ward")
                .lean(); // <-- Perbaikan
            if (!visit) {
                return res.status(404).json({ success: false, message: "Kunjungan tidak ditemukan" });
            }
            res.json({ success: true, data: visit });
        }
        catch (error) {
            next(error);
        }
    }
    // Create a new visit
    async createVisit(req, res, next) {
        try {
            const { patientId, doctorId, polyclinicId } = req.body;
            const [patient, doctor, polyclinic] = await Promise.all([
                Patient_1.default.findById(patientId).lean(),
                User_1.default.findOne({ _id: doctorId, role: 'doctor' }).lean(),
                Polyclinic_1.default.findById(polyclinicId).lean()
            ]);
            if (!patient)
                return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
            if (!doctor)
                return res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
            if (!polyclinic)
                return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
            const visitData = { ...req.body, visitDate: new Date(), createdBy: req.user?._id };
            const visit = new Visit_1.default(visitData);
            await visit.save();
            const populatedVisit = await visit.populate([
                { path: "patientId", select: "name" },
                { path: "doctorId", select: "name" },
                { path: "polyclinicId", select: "name" }
            ]);
            res.status(201).json({
                success: true,
                message: "Kunjungan berhasil ditambahkan",
                data: populatedVisit.toObject() // <-- Perbaikan
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Update a visit's details
    async updateVisit(req, res, next) {
        try {
            const updateData = { ...req.body, updatedBy: req.user?._id };
            const visit = await Visit_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
                .populate("patientId", "name")
                .populate("doctorId", "name")
                .populate("polyclinicId", "name")
                .lean(); // <-- Perbaikan
            if (!visit) {
                return res.status(404).json({ success: false, message: "Kunjungan tidak ditemukan" });
            }
            res.json({ success: true, message: "Data kunjungan berhasil diperbarui", data: visit });
        }
        catch (error) {
            next(error);
        }
    }
    // Complete a visit
    async completeVisit(req, res, next) {
        try {
            const visit = await Visit_1.default.findById(req.params.id);
            if (!visit) {
                return res.status(404).json({ success: false, message: "Kunjungan tidak ditemukan" });
            }
            if (visit.status === "Completed") {
                return res.status(400).json({ success: false, message: "Kunjungan sudah selesai" });
            }
            const updateData = { ...req.body, status: "Completed", completedTime: new Date(), updatedBy: req.user?._id };
            const updatedVisit = await Visit_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).lean();
            res.json({ success: true, message: "Kunjungan berhasil diselesaikan", data: updatedVisit });
        }
        catch (error) {
            next(error);
        }
    }
    // Metode lainnya bisa Anda lanjutkan dengan pola yang sama...
    async cancelVisit(req, res, next) { }
    async deleteVisit(req, res, next) { }
    async getVisitStats(req, res, next) { }
    async getVisitsByPatient(req, res, next) { }
    async getVisitsByDoctor(req, res, next) { }
    async getVisitsByDateRange(req, res, next) { }
    async addMedicalRecord(req, res, next) { }
    async addPrescription(req, res, next) { }
}
exports.default = new VisitController();
