"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboardController_1 = __importDefault(require("../controllers/dashboardController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Semua rute di bawah ini memerlukan otentikasi
router.use(auth_1.authenticateToken);
// --- Rute Utama Dashboard ---
// Mendapatkan data ringkasan untuk kartu-kartu utama di dashboard
router.get("/overview", dashboardController_1.default.getDashboardOverview);
// Mendapatkan data untuk berbagai jenis chart (misal: /charts?type=weekly-patients)
router.get("/charts", dashboardController_1.default.getChartData);
// Mendapatkan daftar antrian hari ini yang dikelompokkan per poliklinik
router.get("/today-queues", dashboardController_1.default.getTodayQueueList);
// --- Rute Statistik (menunjuk ke placeholder) ---
router.get("/stats/patients", dashboardController_1.default.getPatientStats);
router.get("/stats/appointments", dashboardController_1.default.getAppointmentStats);
router.get("/stats/revenue", (0, auth_1.authorizeRoles)("admin", "Super Admin"), dashboardController_1.default.getRevenueStats);
router.get("/stats/inventory", (0, auth_1.authorizeRoles)("admin", "staff", "Super Admin"), dashboardController_1.default.getInventoryStats);
// --- Rute Lainnya (menunjuk ke placeholder) ---
router.get("/activities/recent", dashboardController_1.default.getRecentActivities);
router.get("/system/health", (0, auth_1.authorizeRoles)("admin", "Super Admin"), dashboardController_1.default.getSystemHealth);
exports.default = router;
