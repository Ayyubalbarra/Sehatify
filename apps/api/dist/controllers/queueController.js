"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = __importDefault(require("../models/Queue"));
const Schedule_1 = __importDefault(require("../models/Schedule"));
// Helper Functions dengan Tipe Data yang Lebih Aman
function calculateWaitTime(createdAt, status) {
    if (status === 'Completed' || status === 'Cancelled')
        return 0;
    const now = new Date();
    const queueTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - queueTime.getTime()) / (1000 * 60));
    return Math.max(0, diffInMinutes);
}
function transformStatus(status) {
    if (!status)
        return 'waiting';
    return status.toLowerCase().replace(/\s+/g, '-');
}
function formatAppointmentTime(schedule) {
    if (!schedule?.startTime)
        return 'N/A';
    try {
        // Asumsi startTime adalah string jam seperti "08:00"
        return schedule.startTime;
    }
    catch (error) {
        return 'N/A';
    }
}
// Fungsi untuk mengambil dan memancarkan data antrian terbaru
async function emitQueueUpdate(io) {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const queues = await Queue_1.default.find({ queueDate: { $gte: todayStart } })
            .populate("patientId", "name")
            .populate("polyclinicId", "name")
            .populate("scheduleId", "startTime")
            .sort({ queueNumber: 1 })
            .limit(100)
            .lean();
        const transformedQueues = queues.map(queue => ({
            id: queue._id.toString(),
            patientName: queue.patientId?.name || 'Pasien Dihapus',
            polyclinic: queue.polyclinicId?.name || 'Poli Dihapus',
            appointmentTime: formatAppointmentTime(queue.scheduleId),
            status: transformStatus(queue.status),
            waitTime: calculateWaitTime(queue.createdAt, queue.status),
            queueNumber: queue.queueNumber || 0,
        }));
        io.emit("queueUpdate", { success: true, data: transformedQueues });
        console.log("📢 Emitted queueUpdate to all clients.");
    }
    catch (error) {
        console.error("❌ Error emitting queue update:", error);
    }
}
class QueueController {
    async getAllQueues(req, res, next) {
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const queues = await Queue_1.default.find({ queueDate: { $gte: todayStart } })
                .populate("patientId", "name")
                .populate("polyclinicId", "name")
                .populate("scheduleId", "startTime")
                .sort({ queueNumber: 1 })
                .limit(100)
                .lean();
            const transformedQueues = queues.map(queue => ({
                id: queue._id.toString(),
                patientName: queue.patientId?.name || 'Pasien Dihapus',
                polyclinic: queue.polyclinicId?.name || 'Poli Dihapus',
                appointmentTime: formatAppointmentTime(queue.scheduleId),
                status: transformStatus(queue.status),
                waitTime: calculateWaitTime(queue.createdAt, queue.status),
                queueNumber: queue.queueNumber || 0,
            }));
            res.json({ success: true, data: transformedQueues });
        }
        catch (error) {
            next(error);
        }
    }
    async getQueueById(req, res, next) {
        try {
            const queue = await Queue_1.default.findById(req.params.id)
                .populate("patientId", "name phone")
                .populate("doctorId", "name specialization")
                .populate("polyclinicId", "name")
                .populate("scheduleId", "date startTime endTime")
                .lean();
            if (!queue) {
                return res.status(404).json({ success: false, message: "Antrian tidak ditemukan" });
            }
            res.json({ success: true, data: queue });
        }
        catch (error) {
            next(error);
        }
    }
    async createQueue(req, res, next) {
        try {
            const { patientId, scheduleId, notes } = req.body;
            const schedule = await Schedule_1.default.findById(scheduleId);
            if (!schedule) {
                return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
            }
            if (schedule.availableSlots <= 0) {
                return res.status(400).json({ success: false, message: "Kuota untuk jadwal ini sudah penuh." });
            }
            const lastQueue = await Queue_1.default.findOne({ scheduleId }).sort({ queueNumber: -1 });
            const queueNumber = (lastQueue?.queueNumber || 0) + 1;
            const queue = new Queue_1.default({
                patientId,
                scheduleId,
                notes,
                doctorId: schedule.doctorId,
                polyclinicId: schedule.polyclinicId,
                queueNumber,
                queueDate: schedule.date,
                createdBy: req.user?._id,
            });
            await queue.save();
            await Schedule_1.default.findByIdAndUpdate(scheduleId, { $inc: { bookedSlots: 1, availableSlots: -1 } });
            await emitQueueUpdate(req.app.get("io"));
            res.status(201).json({ success: true, message: "Antrian berhasil dibuat.", data: queue.toObject() });
        }
        catch (error) {
            next(error);
        }
    }
    async updateQueueStatus(req, res, next) {
        try {
            const { status } = req.body;
            const updatedQueue = await Queue_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
            if (!updatedQueue) {
                return res.status(404).json({ success: false, message: "Antrian tidak ditemukan" });
            }
            await emitQueueUpdate(req.app.get("io"));
            res.json({ success: true, message: "Status antrian diperbarui.", data: updatedQueue.toObject() });
        }
        catch (error) {
            next(error);
        }
    }
    async cancelQueue(req, res, next) {
        try {
            const queue = await Queue_1.default.findById(req.params.id);
            if (!queue)
                return res.status(404).json({ success: false, message: "Antrian tidak ditemukan" });
            if (queue.status === "Completed" || queue.status === "Cancelled") {
                return res.status(400).json({ success: false, message: `Antrian sudah ${queue.status} dan tidak bisa dibatalkan.` });
            }
            queue.status = "Cancelled";
            await queue.save();
            await Schedule_1.default.findByIdAndUpdate(queue.scheduleId, { $inc: { bookedSlots: -1, availableSlots: 1 } });
            await emitQueueUpdate(req.app.get("io"));
            res.json({ success: true, message: "Antrian berhasil dibatalkan." });
        }
        catch (error) {
            next(error);
        }
    }
    async getQueueStats(req, res, next) {
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const stats = await Queue_1.default.aggregate([
                { $match: { queueDate: { $gte: todayStart } } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        waiting: { $sum: { $cond: [{ $eq: ["$status", "Waiting"] }, 1, 0] } },
                        completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                        inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } }
                    }
                }
            ]);
            const result = stats[0] || { total: 0, waiting: 0, completed: 0, inProgress: 0 };
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async getTodayQueueSummary(req, res, next) {
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const queues = await Queue_1.default.aggregate([
                { $match: { queueDate: { $gte: todayStart } } },
                { $group: { _id: "$polyclinicId", count: { $sum: 1 } } },
                { $lookup: { from: "polyclinics", localField: "_id", foreignField: "_id", as: "polyclinicInfo" } },
                { $unwind: "$polyclinicInfo" },
                { $project: { _id: 0, polyclinicName: "$polyclinicInfo.name", count: 1 } },
                { $sort: { count: -1 } }
            ]);
            res.json({ success: true, data: queues });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new QueueController();
