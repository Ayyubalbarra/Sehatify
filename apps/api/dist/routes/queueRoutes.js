"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const queueController_1 = __importDefault(require("../controllers/queueController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Semua rute di bawah ini memerlukan otentikasi
router.use(auth_1.authenticateToken);
// --- Aturan Validasi ---
const createQueueValidation = [
    (0, express_validator_1.body)("patientId").isMongoId().withMessage("ID Pasien tidak valid"),
    (0, express_validator_1.body)("scheduleId").isMongoId().withMessage("ID Jadwal tidak valid"),
    (0, express_validator_1.body)("notes").optional().trim().isLength({ max: 500 }).withMessage("Catatan maksimal 500 karakter"),
];
const updateStatusValidation = [
    (0, express_validator_1.body)("status").isIn(["Waiting", "In Progress", "Completed", "Cancelled", "No Show"]).withMessage("Status tidak valid"),
];
// --- Rute API Antrian ---
// GET /api/v1/queues -> Mendapatkan semua antrian hari ini
router.get("/", queueController_1.default.getAllQueues);
// GET /api/v1/queues/stats -> Mendapatkan statistik antrian
router.get("/stats", queueController_1.default.getQueueStats);
// GET /api/v1/queues/summary -> Mendapatkan ringkasan antrian hari ini
router.get("/summary", queueController_1.default.getTodayQueueSummary);
// GET /api/v1/queues/:id -> Mendapatkan detail satu antrian
router.get("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("ID Antrian tidak valid"), queueController_1.default.getQueueById);
// POST /api/v1/queues -> Membuat antrian baru
router.post("/", createQueueValidation, queueController_1.default.createQueue);
// PUT /api/v1/queues/:id/status -> Memperbarui status antrian
router.put("/:id/status", (0, express_validator_1.param)("id").isMongoId().withMessage("ID Antrian tidak valid"), updateStatusValidation, queueController_1.default.updateQueueStatus);
// DELETE /api/v1/queues/:id -> Membatalkan antrian
router.delete("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("ID Antrian tidak valid"), queueController_1.default.cancelQueue);
exports.default = router;
