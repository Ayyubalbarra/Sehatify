"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const doctorController_1 = __importDefault(require("../controllers/doctorController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Semua rute di bawah ini memerlukan otentikasi
router.use(auth_1.authenticateToken);
// --- Aturan Validasi ---
const doctorValidation = [
    (0, express_validator_1.body)("name").trim().isLength({ min: 2, max: 100 }).withMessage("Nama harus antara 2-100 karakter"),
    (0, express_validator_1.body)("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
    (0, express_validator_1.body)("phone").matches(/^[0-9+\-\s()]+$/).withMessage("Format nomor telepon tidak valid"),
    (0, express_validator_1.body)("specialization").trim().isLength({ min: 2, max: 100 }).withMessage("Spesialisasi harus antara 2-100 karakter"),
    (0, express_validator_1.body)("licenseNumber").trim().isLength({ min: 5, max: 50 }).withMessage("Nomor lisensi harus antara 5-50 karakter"),
    (0, express_validator_1.body)("polyclinicId").optional().isMongoId().withMessage("ID poliklinik tidak valid"),
];
// --- Rute API Dokter ---
// GET /api/v1/doctors -> Mendapatkan semua dokter
router.get("/", doctorController_1.default.getAllDoctors);
// GET /api/v1/doctors/stats -> Mendapatkan statistik dokter
router.get("/stats", doctorController_1.default.getDoctorStats);
// GET /api/v1/doctors/:id -> Mendapatkan detail satu dokter
router.get("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("ID dokter tidak valid"), doctorController_1.default.getDoctorById);
// POST /api/v1/doctors -> Membuat dokter baru (hanya admin)
router.post("/", (0, auth_1.authorizeRoles)("admin", "Super Admin"), doctorValidation, doctorController_1.default.createDoctor);
// PUT /api/v1/doctors/:id -> Memperbarui data dokter
router.put("/:id", (0, auth_1.authorizeRoles)("admin", "Super Admin", "doctor"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID dokter tidak valid"), doctorController_1.default.updateDoctor);
// DELETE /api/v1/doctors/:id -> Menonaktifkan dokter (hanya admin)
router.delete("/:id", (0, auth_1.authorizeRoles)("admin", "Super Admin"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID dokter tidak valid"), doctorController_1.default.deleteDoctor);
// --- Rute Terkait Jadwal Dokter ---
// GET /api/v1/doctors/:id/schedule -> Mendapatkan jadwal kerja dokter
router.get("/:id/schedule", (0, express_validator_1.param)("id").isMongoId().withMessage("ID dokter tidak valid"), doctorController_1.default.getDoctorSchedule);
// PUT /api/v1/doctors/:id/schedule -> Memperbarui jadwal kerja dokter
router.put("/:id/schedule", (0, auth_1.authorizeRoles)("admin", "Super Admin", "doctor"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID dokter tidak valid"), doctorController_1.default.updateDoctorSchedule);
exports.default = router;
