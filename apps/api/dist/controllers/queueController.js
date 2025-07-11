"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = __importDefault(require("../models/Queue"));
const Schedule_1 = __importDefault(require("../models/Schedule"));
// Helper Functions dengan Tipe Data
function calculateWaitTime(queue) {
    if (queue.status === 'Completed' || queue.status === 'Cancelled')
        return 0;
    const now = new Date();
    const queueTime = new Date(queue.createdAt);
    const diffInMinutes = Math.floor((now.getTime() - queueTime.getTime()) / (1000 * 60));
    return Math.max(0, diffInMinutes);
}
function transformStatus(status) {
    if (!status)
        return 'waiting';
    return status.toLowerCase().replace(/\s+/g, '-');
}
function formatAppointmentTime(schedule) {
    if (!schedule || !schedule.startTime)
        return 'N/A';
    try {
        return new Date(schedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    catch (error) {
        return 'N/A';
    }
}
// Fungsi untuk mengambil dan memancarkan data antrian terbaru
async function emitQueueUpdate(io) {
    try {
        const today = new Date();
        const query = {
            queueDate: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
        };
        const queues = await Queue_1.default.find(query)
            .populate("patientId", "name")
            .populate("polyclinicId", "name")
            .populate("scheduleId", "startTime")
            .sort({ queueNumber: 1 })
            .limit(100)
            .lean();
        const transformedQueues = queues.map(queue => ({
            id: queue._id.toString(),
            patientName: queue.patientId?.name || 'Pasien Tidak Dikenal',
            polyclinic: queue.polyclinicId?.name || 'Poli Tidak Dikenal',
            appointmentTime: formatAppointmentTime(queue.scheduleId),
            status: transformStatus(queue.status),
            waitTime: calculateWaitTime(queue),
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
            const io = req.app.get("io");
            const today = new Date();
            const query = {
                queueDate: {
                    $gte: new Date(today.setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date(today).setHours(23, 59, 59, 999)),
                },
            };
            const queues = await Queue_1.default.find(query)
                .populate("patientId", "name")
                .populate("polyclinicId", "name")
                .populate("scheduleId", "startTime")
                .sort({ queueNumber: 1 })
                .limit(100)
                .lean();
            const transformedQueues = queues.map(queue => ({
                id: queue._id.toString(),
                patientName: queue.patientId?.name || 'Pasien Tidak Dikenal',
                polyclinic: queue.polyclinicId?.name || 'Poli Tidak Dikenal',
                appointmentTime: formatAppointmentTime(queue.scheduleId),
                status: transformStatus(queue.status),
                waitTime: calculateWaitTime(queue),
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
                createdBy: req.user?.userId,
            });
            await queue.save();
            await Schedule_1.default.findByIdAndUpdate(scheduleId, { $inc: { bookedSlots: 1, availableSlots: -1 } });
            const io = req.app.get("io");
            await emitQueueUpdate(io);
            res.status(201).json({ success: true, message: "Antrian berhasil dibuat.", data: queue });
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
            const io = req.app.get("io");
            await emitQueueUpdate(io);
            res.json({ success: true, message: "Status antrian diperbarui.", data: updatedQueue });
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
            queue.status = "Cancelled";
            await queue.save();
            await Schedule_1.default.findByIdAndUpdate(queue.scheduleId, { $inc: { bookedSlots: -1, availableSlots: 1 } });
            const io = req.app.get("io");
            await emitQueueUpdate(io);
            res.json({ success: true, message: "Antrian dibatalkan." });
        }
        catch (error) {
            next(error);
        }
    }
    async getQueueStats(req, res, next) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const [totalQueues, waitingQueues, completedQueues] = await Promise.all([
                Queue_1.default.countDocuments({ queueDate: { $gte: today, $lt: tomorrow } }),
                Queue_1.default.countDocuments({ queueDate: { $gte: today, $lt: tomorrow }, status: "Waiting" }),
                Queue_1.default.countDocuments({ queueDate: { $gte: today, $lt: tomorrow }, status: "Completed" }),
            ]);
            res.json({
                success: true,
                data: {
                    total: totalQueues,
                    waiting: waitingQueues,
                    completed: completedQueues,
                    inProgress: totalQueues - waitingQueues - completedQueues, // Asumsi sisanya In Progress
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTodayQueueSummary(req, res, next) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const queues = await Queue_1.default.aggregate([
                { $match: { queueDate: { $gte: today, $lt: tomorrow } } },
                { $group: { _id: "$polyclinicId", count: { $sum: 1 } } },
                { $lookup: { from: "polyclinics", localField: "_id", foreignField: "_id", as: "polyclinicInfo" } },
                { $unwind: "$polyclinicInfo" },
                { $project: { _id: 0, polyclinicName: "$polyclinicInfo.name", count: 1 } },
            ]);
            res.json({ success: true, data: queues });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new QueueController();
