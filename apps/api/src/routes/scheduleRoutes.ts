import express, { type Router } from "express";
import { body, param } from "express-validator";
import scheduleController from "../controllers/scheduleController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// --- Aturan Validasi ---
const scheduleValidation = [
  body("doctorId").isMongoId().withMessage("ID dokter tidak valid"),
  body("polyclinicId").isMongoId().withMessage("ID poliklinik tidak valid"),
  body("date").isISO8601().withMessage("Format tanggal tidak valid (YYYY-MM-DD)"),
  body("startTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Format waktu mulai tidak valid (HH:MM)"),
  body("endTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Format waktu selesai tidak valid (HH:MM)"),
  body("totalSlots").isInt({ min: 1, max: 100 }).withMessage("Total slot harus antara 1-100"),
];

// --- Rute API Jadwal ---

router.get("/", scheduleController.getAllSchedules);
router.get("/available-slots", scheduleController.getAvailableSlots);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID jadwal tidak valid"),
  scheduleController.getScheduleById
);

router.post(
  "/",
  authorizeRoles("admin", "Super Admin"),
  scheduleValidation,
  scheduleController.createSchedule
);

router.put(
  "/:id",
  authorizeRoles("admin", "Super Admin"),
  param("id").isMongoId().withMessage("ID jadwal tidak valid"),
  scheduleController.updateSchedule
);

router.delete(
  "/:id",
  authorizeRoles("admin", "Super Admin"),
  param("id").isMongoId().withMessage("ID jadwal tidak valid"),
  scheduleController.deleteSchedule
);

export default router;