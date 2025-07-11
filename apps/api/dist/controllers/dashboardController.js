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
            const [visitCount, queueCount, emergencyCount] = await Promise.all([
                Visit_1.default.countDocuments({ visitDate: { $gte: today } }),
                Queue_1.default.countDocuments({ queueDate: { $gte: today } }),
                Queue_1.default.countDocuments({ queueDate: { $gte: today }, priority: "Emergency" }),
            ]);
            const response = {
                success: true,
                data: {
                    todayVisits: visitCount,
                    todayQueues: queueCount,
                    todayEmergencies: emergencyCount
                }
            };
            res.json(response);
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
            const queues = await Queue_1.default.find({
                queueDate: { $gte: today, $lt: tomorrow }
            })
                .populate("patientId", "name phone")
                .populate("polyclinicId", "name")
                .sort({ queueNumber: 1 })
                .lean();
            const summary = {
                waiting: queues.filter((q) => q.status === "Waiting").length,
                inProgress: queues.filter((q) => q.status === "In Progress").length,
                completed: queues.filter((q) => q.status === "Completed").length,
            };
            const response = {
                success: true,
                data: { totalQueues: queues.length, summary, queues },
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getChartData(req, res, next) {
        try {
            const { type } = req.query;
            let chartData;
            if (type === "weekly-patients") {
                const labels = [];
                const data = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    labels.push(date.toLocaleDateString("id-ID", { weekday: "short" }));
                    const startOfDay = new Date(date);
                    startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(date);
                    endOfDay.setHours(23, 59, 59, 999);
                    const count = await Visit_1.default.countDocuments({
                        visitDate: { $gte: startOfDay, $lt: endOfDay },
                    });
                    data.push(count);
                }
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
                const errorResponse = {
                    success: false,
                    message: "Tipe chart tidak valid"
                };
                res.status(400).json(errorResponse);
                return;
            }
            const response = {
                success: true,
                data: chartData
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // --- Metode Placeholder ---
    async getPatientStats(req, res, next) {
        const response = {
            success: true,
            message: "Patient stats endpoint"
        };
        res.json(response);
    }
    async getAppointmentStats(req, res, next) {
        const response = {
            success: true,
            message: "Appointment stats endpoint"
        };
        res.json(response);
    }
    async getRevenueStats(req, res, next) {
        const response = {
            success: true,
            message: "Revenue stats endpoint"
        };
        res.json(response);
    }
    async getInventoryStats(req, res, next) {
        const response = {
            success: true,
            message: "Inventory stats endpoint"
        };
        res.json(response);
    }
    async getRecentActivities(req, res, next) {
        const response = {
            success: true,
            message: "Recent activities endpoint"
        };
        res.json(response);
    }
    async getSystemHealth(req, res, next) {
        const response = {
            success: true,
            message: "System health endpoint"
        };
        res.json(response);
    }
}
exports.default = new DashboardController();
