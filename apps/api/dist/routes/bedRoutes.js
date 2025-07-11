"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const bedController_1 = __importDefault(require("../controllers/bedController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Semua rute di bawah ini memerlukan otentikasi
router.use(auth_1.authenticateToken);
// --- Aturan Validasi ---
const bedValidation = [
    (0, express_validator_1.body)("bedNumber").trim().notEmpty().withMessage("Nomor tempat tidur wajib diisi"),
    (0, express_validator_1.body)("roomNumber").trim().notEmpty().withMessage("Nomor ruangan wajib diisi"),
    (0, express_validator_1.body)("ward").isIn(["ICU", "ICCU", "NICU", "General Ward", "VIP", "Emergency", "Isolation", "Maternity", "Pediatric"]).withMessage("Tipe bangsal tidak valid"),
    (0, express_validator_1.body)("bedType").isIn(["Standard", "Electric", "ICU", "Pediatric", "Maternity", "VIP"]).withMessage("Tipe tempat tidur tidak valid"),
    (0, express_validator_1.body)("dailyRate").isNumeric().withMessage("Tarif harian harus berupa angka"),
];
const statusValidation = [
    (0, express_validator_1.body)("status").isIn(["available", "occupied", "maintenance", "cleaning", "reserved"]).withMessage("Status tidak valid"),
];
// --- Rute API Tempat Tidur (Bed) ---
// GET /api/v1/beds -> Mendapatkan semua tempat tidur
router.get("/", bedController_1.default.getAllBeds);
// GET /api/v1/beds/:id -> Mendapatkan detail satu tempat tidur
router.get("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("ID tempat tidur tidak valid"), bedController_1.default.getBedById);
// POST /api/v1/beds -> Membuat tempat tidur baru (admin)
router.post("/", (0, auth_1.authorizeRoles)("admin", "Super Admin"), bedValidation, bedController_1.default.createBed);
// PUT /api/v1/beds/:id -> Memperbarui detail tempat tidur
router.put("/:id", (0, auth_1.authorizeRoles)("admin", "Super Admin", "nurse"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID tempat tidur tidak valid"), bedController_1.default.updateBed);
// DELETE /api/v1/beds/:id -> Menghapus tempat tidur (admin)
router.delete("/:id", (0, auth_1.authorizeRoles)("admin", "Super Admin"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID tempat tidur tidak valid"), bedController_1.default.deleteBed);
// PUT /api/v1/beds/:id/status -> Memperbarui status
router.put("/:id/status", (0, auth_1.authorizeRoles)("admin", "Super Admin", "nurse"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID tempat tidur tidak valid"), statusValidation, bedController_1.default.updateBedStatus);
// PUT /api/v1/beds/:id/assign -> Menempatkan pasien di tempat tidur
router.put("/:id/assign", (0, auth_1.authorizeRoles)("admin", "Super Admin", "nurse"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID tempat tidur tidak valid"), (0, express_validator_1.body)("patientId").isMongoId().withMessage("ID pasien tidak valid"), bedController_1.default.assignPatientToBed);
exports.default = router;
