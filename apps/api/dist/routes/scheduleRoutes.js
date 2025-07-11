"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const scheduleController_1 = __importDefault(require("../controllers/scheduleController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Semua rute di bawah ini memerlukan otentikasi
router.use(auth_1.authenticateToken);
// --- Aturan Validasi ---
const scheduleValidation = [
    (0, express_validator_1.body)("doctorId").isMongoId().withMessage("ID dokter tidak valid"),
    (0, express_validator_1.body)("polyclinicId").isMongoId().withMessage("ID poliklinik tidak valid"),
    (0, express_validator_1.body)("date").isISO8601().withMessage("Format tanggal tidak valid (YYYY-MM-DD)"),
    (0, express_validator_1.body)("startTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Format waktu mulai tidak valid (HH:MM)"),
    (0, express_validator_1.body)("endTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Format waktu selesai tidak valid (HH:MM)"),
    (0, express_validator_1.body)("totalSlots").isInt({ min: 1, max: 100 }).withMessage("Total slot harus antara 1-100"),
];
// --- Rute API Jadwal ---
router.get("/", scheduleController_1.default.getAllSchedules);
router.get("/available-slots", scheduleController_1.default.getAvailableSlots);
router.get("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("ID jadwal tidak valid"), scheduleController_1.default.getScheduleById);
router.post("/", (0, auth_1.authorizeRoles)("admin", "Super Admin"), scheduleValidation, scheduleController_1.default.createSchedule);
router.put("/:id", (0, auth_1.authorizeRoles)("admin", "Super Admin"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID jadwal tidak valid"), scheduleController_1.default.updateSchedule);
router.delete("/:id", (0, auth_1.authorizeRoles)("admin", "Super Admin"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID jadwal tidak valid"), scheduleController_1.default.deleteSchedule);
exports.default = router;
