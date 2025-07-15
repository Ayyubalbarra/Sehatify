"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Visit_1 = __importDefault(require("../models/Visit"));
const Queue_1 = __importDefault(require("../models/Queue"));
class DashboardController {
    async getDashboardOverview(req, res, next) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const [visitCount, queueStats] = await Promise.all([
                Visit_1.default.countDocuments({ visitDate: { $gte: today, $lt: tomorrow } }),
                Queue_1.default.aggregate([
                    { $match: { queueDate: { $gte: today, $lt: tomorrow } } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            emergency: { $sum: { $cond: [{ $eq: ["$priority", "Emergency"] }, 1, 0] } }
                        }
                    }
                ])
            ]);
            const responseData = {
                todayVisits: visitCount,
                todayQueues: queueStats[0]?.total || 0,
                todayEmergencies: queueStats[0]?.emergency || 0
            };
            res.json({ success: true, data: responseData });
        }
        catch (error) {
            next(error);
        }
    }
    async getTodayQueueList(req, res, next) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            // PERBAIKAN: Menambahkan .lean() untuk memastikan tipe data sesuai
            const queues = await Queue_1.default.find({
                queueDate: { $gte: today, $lt: tomorrow }
            })
                .populate("patientId", "name phone")
                .populate("polyclinicId", "name")
                .sort({ queueNumber: 1 })
                .lean();
            const summary = queues.reduce((acc, queue) => {
                if (queue.status === "Waiting")
                    acc.waiting++;
                else if (queue.status === "In Progress")
                    acc.inProgress++;
                else if (queue.status === "Completed")
                    acc.completed++;
                return acc;
            }, { waiting: 0, inProgress: 0, completed: 0 });
            res.json({
                success: true,
                data: {
                    totalQueues: queues.length,
                    summary,
                    queues: queues // PERBAIKAN: Type assertion untuk meyakinkan TypeScript
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getChartData(req, res, next) {
        try {
            const { type = "weekly-patients" } = req.query;
            let chartData;
            if (type === "weekly-patients") {
                const labels = [];
                const dataPromises = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    labels.push(date.toLocaleDateString("id-ID", { weekday: "short" }));
                    const startOfDay = new Date(date);
                    startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(date);
                    endOfDay.setHours(23, 59, 59, 999);
                    dataPromises.push(Visit_1.default.countDocuments({
                        visitDate: { $gte: startOfDay, $lt: endOfDay },
                    }));
                }
                const data = await Promise.all(dataPromises);
                chartData = {
                    labels,
                    datasets: [{
                            label: "Pasien per Hari",
                            data,
                            tension: 0.1
                        }]
                };
            }
            else {
                res.status(400).json({ success: false, message: "Tipe chart tidak valid" });
                return;
            }
            res.json({ success: true, data: chartData });
        }
        catch (error) {
            next(error);
        }
    }
    // --- Metode Placeholder ---
    async getPatientStats(req, res, next) { res.json({ success: true }); }
    async getAppointmentStats(req, res, next) { res.json({ success: true }); }
    async getRevenueStats(req, res, next) { res.json({ success: true }); }
    async getInventoryStats(req, res, next) { res.json({ success: true }); }
    async getRecentActivities(req, res, next) { res.json({ success: true }); }
    async getSystemHealth(req, res, next) { res.json({ success: true }); }
}
exports.default = new DashboardController();
