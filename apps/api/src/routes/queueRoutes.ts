import express, { type Router } from "express";
import { body, param } from "express-validator";
import queueController from "../controllers/queueController";
import { authenticateToken } from "../middleware/auth";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// --- Aturan Validasi ---
const createQueueValidation = [
  body("patientId").isMongoId().withMessage("ID Pasien tidak valid"),
  body("scheduleId").isMongoId().withMessage("ID Jadwal tidak valid"),
  body("notes").optional().trim().isLength({ max: 500 }).withMessage("Catatan maksimal 500 karakter"),
];

const updateStatusValidation = [
  body("status").isIn(["Waiting", "In Progress", "Completed", "Cancelled", "No Show"]).withMessage("Status tidak valid"),
];

// --- Rute API Antrian ---

// GET /api/v1/queues -> Mendapatkan semua antrian hari ini
router.get("/", queueController.getAllQueues);

// GET /api/v1/queues/stats -> Mendapatkan statistik antrian
router.get("/stats", queueController.getQueueStats);

// GET /api/v1/queues/summary -> Mendapatkan ringkasan antrian hari ini
router.get("/summary", queueController.getTodayQueueSummary);

// GET /api/v1/queues/:id -> Mendapatkan detail satu antrian
router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID Antrian tidak valid"),
  queueController.getQueueById
);

// POST /api/v1/queues -> Membuat antrian baru
router.post("/", createQueueValidation, queueController.createQueue);

// PUT /api/v1/queues/:id/status -> Memperbarui status antrian
router.put(
  "/:id/status",
  param("id").isMongoId().withMessage("ID Antrian tidak valid"),
  updateStatusValidation,
  queueController.updateQueueStatus
);

// DELETE /api/v1/queues/:id -> Membatalkan antrian
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("ID Antrian tidak valid"),
  queueController.cancelQueue
);

export default router;