"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Schedule_1 = __importDefault(require("../models/Schedule"));
const Queue_1 = __importDefault(require("../models/Queue"));
const User_1 = __importDefault(require("../models/User"));
const Polyclinic_1 = __importDefault(require("../models/Polyclinic"));
const modelHelpers_1 = require("../utils/modelHelpers");
class ScheduleController {
    // Get all schedules with filtering and pagination
    async getAllSchedules(req, res, next) {
        try {
            const { page = 1, limit = 10, doctorId, polyclinicId, date, status } = req.query;
            const query = {};
            if (doctorId)
                query.doctorId = doctorId;
            if (polyclinicId)
                query.polyclinicId = polyclinicId;
            if (status)
                query.status = status;
            if (date) {
                const searchDate = new Date(date);
                searchDate.setHours(0, 0, 0, 0);
                const nextDate = new Date(searchDate);
                nextDate.setDate(searchDate.getDate() + 1);
                query.date = { $gte: searchDate, $lt: nextDate };
            }
            const [schedules, total] = await Promise.all([
                Schedule_1.default.find(query)
                    .populate("doctorId", "name specialization")
                    .populate("polyclinicId", "name")
                    .sort({ date: 1, startTime: 1 })
                    .limit(Number(limit))
                    .skip((Number(page) - 1) * Number(limit))
                    .lean(), // <-- Perbaikan
                Schedule_1.default.countDocuments(query),
            ]);
            res.json({ success: true, data: schedules, pagination: { totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total } });
        }
        catch (error) {
            next(error);
        }
    }
    // Get a single schedule by ID with its queue list
    async getScheduleById(req, res, next) {
        try {
            const scheduleId = new mongoose_1.Types.ObjectId(req.params.id);
            const [schedule, queues] = await Promise.all([
                Schedule_1.default.findById(scheduleId).populate("doctorId", "name").populate("polyclinicId", "name").lean(),
                Queue_1.default.find({ scheduleId }).populate("patientId", "name patientId").sort({ queueNumber: 1 }).lean(),
            ]);
            if (!schedule) {
                return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
            }
            res.json({ success: true, data: { ...schedule, queues } });
        }
        catch (error) {
            next(error);
        }
    }
    // Create a new schedule
    async createSchedule(req, res, next) {
        try {
            const { doctorId, polyclinicId, date, startTime, endTime } = req.body;
            const [doctor, polyclinic] = await Promise.all([
                User_1.default.findOne({ _id: doctorId, role: 'doctor' }).lean(),
                Polyclinic_1.default.findById(polyclinicId).lean()
            ]);
            if (!doctor)
                return res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
            if (!polyclinic)
                return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
            const scheduleDate = new Date(date);
            const conflict = await Schedule_1.default.findOne({
                doctorId,
                date: scheduleDate,
                // Cek jika ada jadwal yang tumpang tindih
                $or: [
                    { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
                ]
            });
            if (conflict) {
                return res.status(400).json({ success: false, message: "Dokter sudah memiliki jadwal yang berbenturan pada waktu tersebut" });
            }
            const scheduleData = {
                ...req.body,
                scheduleId: (0, modelHelpers_1.generateScheduleId)(),
                createdBy: req.user?._id,
                availableSlots: req.body.totalSlots,
                bookedSlots: 0 // Inisialisasi bookedSlots
            };
            const schedule = new Schedule_1.default(scheduleData);
            await schedule.save();
            const populatedSchedule = await schedule.populate([
                { path: "doctorId", select: "name specialization" },
                { path: "polyclinicId", select: "name" }
            ]);
            res.status(201).json({ success: true, message: "Jadwal berhasil ditambahkan", data: populatedSchedule.toObject() });
        }
        catch (error) {
            next(error);
        }
    }
    // Update a schedule
    async updateSchedule(req, res, next) {
        try {
            const schedule = await Schedule_1.default.findById(req.params.id);
            if (!schedule) {
                return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
            }
            const updateData = { ...req.body, updatedBy: req.user?._id };
            if (req.body.totalSlots !== undefined) {
                const newTotalSlots = Number(req.body.totalSlots);
                if (newTotalSlots < schedule.bookedSlots) {
                    return res.status(400).json({ success: false, message: "Total slot tidak boleh kurang dari slot yang sudah dipesan." });
                }
                updateData.availableSlots = newTotalSlots - schedule.bookedSlots;
            }
            const updatedSchedule = await Schedule_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true })
                .populate("doctorId", "name")
                .populate("polyclinicId", "name")
                .lean(); // <-- Perbaikan
            res.json({ success: true, message: "Jadwal berhasil diperbarui", data: updatedSchedule });
        }
        catch (error) {
            next(error);
        }
    }
    // Cancel a schedule (Soft delete)
    async deleteSchedule(req, res, next) {
        try {
            const scheduleId = new mongoose_1.Types.ObjectId(req.params.id);
            const queueCount = await Queue_1.default.countDocuments({ scheduleId });
            if (queueCount > 0) {
                return res.status(400).json({ success: false, message: "Tidak dapat membatalkan jadwal yang sudah memiliki antrian terdaftar." });
            }
            const schedule = await Schedule_1.default.findByIdAndUpdate(scheduleId, { status: "Cancelled", updatedBy: req.user?._id }, { new: true });
            if (!schedule) {
                return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
            }
            res.json({ success: true, message: "Jadwal berhasil dibatalkan." });
        }
        catch (error) {
            next(error);
        }
    }
    // Get available schedules for a doctor on a specific date
    async getAvailableSlots(req, res, next) {
        try {
            const { doctorId, date } = req.query;
            if (!doctorId || !date) {
                return res.status(400).json({ success: false, message: "ID Dokter dan tanggal harus diisi." });
            }
            const searchDate = new Date(date);
            searchDate.setHours(0, 0, 0, 0);
            const nextDate = new Date(searchDate);
            nextDate.setDate(searchDate.getDate() + 1);
            const schedules = await Schedule_1.default.find({
                doctorId,
                date: { $gte: searchDate, $lt: nextDate },
                status: "Active",
                availableSlots: { $gt: 0 }
            }).populate("polyclinicId", "name").lean();
            res.json({ success: true, data: schedules });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ScheduleController();
