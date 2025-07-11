import express, { type Router } from "express";
import dashboardController from "../controllers/dashboardController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// --- Rute Utama Dashboard ---

// Mendapatkan data ringkasan untuk kartu-kartu utama di dashboard
router.get("/overview", dashboardController.getDashboardOverview);

// Mendapatkan data untuk berbagai jenis chart (misal: /charts?type=weekly-patients)
router.get("/charts", dashboardController.getChartData);

// Mendapatkan daftar antrian hari ini yang dikelompokkan per poliklinik
router.get("/today-queues", dashboardController.getTodayQueueList);


// --- Rute Statistik (menunjuk ke placeholder) ---

router.get("/stats/patients", dashboardController.getPatientStats);
router.get("/stats/appointments", dashboardController.getAppointmentStats);
router.get("/stats/revenue", authorizeRoles("admin", "Super Admin"), dashboardController.getRevenueStats);
router.get("/stats/inventory", authorizeRoles("admin", "staff", "Super Admin"), dashboardController.getInventoryStats);

// --- Rute Lainnya (menunjuk ke placeholder) ---

router.get("/activities/recent", dashboardController.getRecentActivities);
router.get("/system/health", authorizeRoles("admin", "Super Admin"), dashboardController.getSystemHealth);

export default router;