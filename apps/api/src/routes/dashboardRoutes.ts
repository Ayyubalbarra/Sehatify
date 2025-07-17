// apps/api/src/routes/dashboardRoutes.ts

import express, { type Router } from "express";
import dashboardController from "../controllers/dashboardController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

router.use(authenticateToken);

// --- Rute Dashboard Admin (sesuai desain baru) ---

// ✅ RUTE BARU: Mendapatkan data untuk kartu metrik utama admin
router.get("/admin-overview", dashboardController.getAdminDashboardOverview);

// ✅ RUTE BARU: Mendapatkan data untuk grafik pasien per minggu (format Recharts)
router.get("/admin-charts/patients-per-week", dashboardController.getPatientsPerWeek);

// ✅ RUTE BARU: Mendapatkan data untuk grafik pasien per jam (format Recharts)
router.get("/admin-charts/patients-per-hour", dashboardController.getPatientsPerHour);

// ✅ RUTE BARU: Mendapatkan data ringkasan dan rekomendasi AI
router.get("/admin-charts/ai-insights", dashboardController.getAIInsights);


// --- Rute Dashboard Umum (yang sudah ada) ---

// Mendapatkan data ringkasan umum
router.get("/overview", dashboardController.getDashboardOverview);

// Mendapatkan data untuk berbagai jenis chart (format Chart.js lama)
router.get("/charts", dashboardController.getChartData);

// Mendapatkan daftar antrian hari ini
router.get("/today-queues", dashboardController.getTodayQueueList);


// --- Rute Statistik ---
router.get("/stats/patients", authorizeRoles("admin", "Super Admin"), dashboardController.getPatientStats);
router.get("/stats/appointments", authorizeRoles("admin", "Super Admin", "staff"), dashboardController.getAppointmentStats);
router.get("/stats/financial", authorizeRoles("admin", "Super Admin"), dashboardController.getFinancialSummary); 
router.get("/stats/service-distribution", authorizeRoles("admin", "Super Admin", "staff"), dashboardController.getServiceDistribution); 
router.get("/stats/inventory", authorizeRoles("admin", "staff", "Super Admin"), dashboardController.getInventoryStats);


// --- Rute Lainnya ---
router.get("/activities/recent", authorizeRoles("admin", "staff", "Super Admin"), dashboardController.getRecentActivities);
router.get("/system/health", authorizeRoles("admin", "Super Admin"), dashboardController.getSystemHealth);

export default router;