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
                query.diagnosis = { $regex: search, $options: "i" };
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
                    .lean(),
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
                .lean();
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
                Patient_1.default.findById(patientId),
                User_1.default.findOne({ _id: doctorId, role: 'doctor' }),
                Polyclinic_1.default.findById(polyclinicId)
            ]);
            if (!patient)
                return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
            if (!doctor)
                return res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
            if (!polyclinic)
                return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
            const visitData = { ...req.body, visitDate: new Date(), createdBy: req.user?.userId };
            const visit = new Visit_1.default(visitData);
            await visit.save();
            await visit.populate([{ path: "patientId", select: "name" }, { path: "doctorId", select: "name" }, { path: "polyclinicId", select: "name" }]);
            res.status(201).json({ success: true, message: "Kunjungan berhasil ditambahkan", data: visit });
        }
        catch (error) {
            next(error);
        }
    }
    // Update a visit's details
    async updateVisit(req, res, next) {
        try {
            const updateData = { ...req.body, updatedBy: req.user?.userId };
            const visit = await Visit_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
                .populate("patientId", "name")
                .populate("doctorId", "name")
                .populate("polyclinicId", "name");
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
            const updateData = { ...req.body, status: "Completed", completedTime: new Date(), updatedBy: req.user?.userId };
            const updatedVisit = await Visit_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
            res.json({ success: true, message: "Kunjungan berhasil diselesaikan", data: updatedVisit });
        }
        catch (error) {
            next(error);
        }
    }
    // Cancel a visit
    async cancelVisit(req, res, next) {
        try {
            const visit = await Visit_1.default.findById(req.params.id);
            if (!visit) {
                return res.status(404).json({ success: false, message: "Kunjungan tidak ditemukan" });
            }
            if (["Completed", "Cancelled"].includes(visit.status)) {
                return res.status(400).json({ success: false, message: `Kunjungan yang sudah ${visit.status} tidak dapat dibatalkan` });
            }
            const updateData = { status: "Cancelled", cancelReason: req.body.reason, cancelledTime: new Date(), updatedBy: req.user?.userId };
            const updatedVisit = await Visit_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
            res.json({ success: true, message: "Kunjungan berhasil dibatalkan", data: updatedVisit });
        }
        catch (error) {
            next(error);
        }
    }
    // Delete a visit
    async deleteVisit(req, res, next) {
        try {
            const visit = await Visit_1.default.findByIdAndDelete(req.params.id);
            if (!visit) {
                return res.status(404).json({ success: false, message: "Kunjungan tidak ditemukan" });
            }
            res.json({ success: true, message: "Kunjungan berhasil dihapus" });
        }
        catch (error) {
            next(error);
        }
    }
    // Get visit statistics
    async getVisitStats(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const dateQuery = {};
            if (startDate && endDate) {
                dateQuery.visitDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
            }
            else {
                const now = new Date();
                dateQuery.visitDate = { $gte: new Date(now.getFullYear(), now.getMonth(), 1), $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
            }
            const [statusStats, totalRevenue] = await Promise.all([
                Visit_1.default.aggregate([
                    { $match: dateQuery },
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ]),
                Visit_1.default.aggregate([
                    { $match: { ...dateQuery, status: "Completed", paymentStatus: "Paid" } },
                    { $group: { _id: null, total: { $sum: "$totalCost" } } }
                ])
            ]);
            const statsResult = statusStats.reduce((acc, stat) => ({ ...acc, [stat._id.toLowerCase()]: stat.count }), { completed: 0, ongoing: 0, cancelled: 0 });
            res.json({
                success: true,
                data: {
                    totalVisits: Object.values(statsResult).reduce((sum, count) => sum + count, 0),
                    ...statsResult,
                    totalRevenue: totalRevenue[0]?.total || 0,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get visits by patient ID
    async getVisitsByPatient(req, res, next) {
        try {
            const visits = await Visit_1.default.find({ patientId: req.params.patientId })
                .populate("doctorId", "name specialization")
                .populate("polyclinicId", "name")
                .sort({ visitDate: -1 });
            res.json({ success: true, data: visits });
        }
        catch (error) {
            next(error);
        }
    }
    // Get visits by doctor ID
    async getVisitsByDoctor(req, res, next) {
        try {
            const visits = await Visit_1.default.find({ doctorId: req.params.doctorId })
                .populate("patientId", "name nik")
                .populate("polyclinicId", "name")
                .sort({ visitDate: -1 });
            res.json({ success: true, data: visits });
        }
        catch (error) {
            next(error);
        }
    }
    // Get visits by date range
    async getVisitsByDateRange(req, res, next) {
        try {
            const { startDate, endDate } = req.params;
            const visits = await Visit_1.default.find({
                visitDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }).populate("patientId", "name").populate("doctorId", "name");
            res.json({ success: true, data: visits });
        }
        catch (error) {
            next(error);
        }
    }
    // Add or update a medical record for a visit
    async addMedicalRecord(req, res, next) {
        try {
            const { chiefComplaint, symptoms, vitalSigns, diagnosis, treatment } = req.body;
            const updateData = {
                chiefComplaint,
                symptoms,
                vitalSigns,
                diagnosis,
                treatment,
                updatedBy: req.user?.userId
            };
            const visit = await Visit_1.default.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
            if (!visit) {
                return res.status(404).json({ success: false, message: "Kunjungan tidak ditemukan" });
            }
            res.json({ success: true, message: "Rekam medis berhasil diperbarui", data: visit });
        }
        catch (error) {
            next(error);
        }
    }
    // Add or update a prescription for a visit
    async addPrescription(req, res, next) {
        try {
            // Asumsi req.body adalah array of prescriptions: [{ medication, dosage, ... }]
            const { prescription } = req.body;
            const visit = await Visit_1.default.findByIdAndUpdate(req.params.id, { $set: { prescription: prescription, updatedBy: req.user?.userId } }, { new: true });
            if (!visit) {
                return res.status(404).json({ success: false, message: "Kunjungan tidak ditemukan" });
            }
            res.json({ success: true, message: "Resep berhasil ditambahkan/diperbarui", data: visit });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new VisitController();
