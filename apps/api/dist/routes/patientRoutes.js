"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const patientController_1 = __importDefault(require("../controllers/patientController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// Semua rute di bawah ini memerlukan otentikasi
router.use(auth_1.authenticateToken);
// --- Aturan Validasi ---
const patientValidation = [
    (0, express_validator_1.body)("name").trim().isLength({ min: 2, max: 100 }).withMessage("Nama harus antara 2-100 karakter"),
    (0, express_validator_1.body)("email").optional().isEmail().normalizeEmail().withMessage("Format email tidak valid"),
    (0, express_validator_1.body)("phone").matches(/^[0-9+\-\s()]+$/).withMessage("Format nomor telepon tidak valid"),
    (0, express_validator_1.body)("dateOfBirth").isISO8601().withMessage("Format tanggal lahir tidak valid (YYYY-MM-DD)"),
    (0, express_validator_1.body)("gender").isIn(["Laki-laki", "Perempuan"]).withMessage("Gender harus Laki-laki atau Perempuan"),
    (0, express_validator_1.body)("address").optional().trim().isLength({ max: 500 }).withMessage("Alamat maksimal 500 karakter"),
    (0, express_validator_1.body)("nik").isLength({ min: 16, max: 16 }).withMessage("NIK harus 16 digit"),
    validation_1.handleValidationErrors
];
const updatePatientValidation = [
    (0, express_validator_1.body)("name").optional().trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)("email").optional().isEmail().normalizeEmail(),
    (0, express_validator_1.body)("phone").optional().matches(/^[0-9+\-\s()]+$/),
    validation_1.handleValidationErrors
];
// --- Rute API Pasien ---
// GET /api/patients -> Mendapatkan semua pasien (dengan filter & pencarian via query string, misal: /api/patients?search=budi)
router.get("/", patientController_1.default.getPatients);
// GET /api/patients/stats -> Mendapatkan statistik pasien
router.get("/stats", patientController_1.default.getPatientStats);
// GET /api/patients/:id -> Mendapatkan detail satu pasien (termasuk riwayat)
router.get("/:patientId", (0, express_validator_1.param)("patientId").isMongoId().withMessage("ID Pasien tidak valid"), patientController_1.default.getPatient);
// POST /api/patients -> Membuat pasien baru
router.post("/", patientValidation, patientController_1.default.createPatient);
// PUT /api/patients/:id -> Memperbarui data pasien
router.put("/:patientId", (0, express_validator_1.param)("patientId").isMongoId().withMessage("ID Pasien tidak valid"), updatePatientValidation, patientController_1.default.updatePatient);
// DELETE /api/patients/:id -> Menghapus pasien (hanya admin)
router.delete("/:patientId", (0, auth_1.authorizeRoles)("admin", "Super Admin"), (0, express_validator_1.param)("patientId").isMongoId().withMessage("ID Pasien tidak valid"), patientController_1.default.deletePatient);
exports.default = router;
