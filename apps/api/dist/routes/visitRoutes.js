"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const visitController_1 = __importDefault(require("../controllers/visitController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Semua rute di bawah ini memerlukan otentikasi
router.use(auth_1.authenticateToken);
// Aturan validasi untuk membuat kunjungan
const visitValidation = [
    (0, express_validator_1.body)("patientId").isMongoId().withMessage("ID pasien tidak valid."),
    (0, express_validator_1.body)("doctorId").isMongoId().withMessage("ID dokter tidak valid."),
    (0, express_validator_1.body)("polyclinicId").isMongoId().withMessage("ID poliklinik tidak valid."),
    (0, express_validator_1.body)("visitDate").isISO8601().withMessage("Format tanggal kunjungan tidak valid (YYYY-MM-DD)."),
    (0, express_validator_1.body)("visitType")
        .isIn(["Consultation", "Follow-up", "Emergency", "Check-up", "Treatment"])
        .withMessage("Tipe kunjungan tidak valid."),
    (0, express_validator_1.body)("chiefComplaint").trim().isLength({ min: 5, max: 500 }).withMessage("Keluhan utama harus antara 5-500 karakter."),
];
// --- Rute Kunjungan ---
router.get("/", visitController_1.default.getAllVisits);
router.get("/stats", visitController_1.default.getVisitStats);
router.get("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("ID kunjungan tidak valid."), visitController_1.default.getVisitById);
router.post("/", (0, auth_1.authorizeRoles)("staff", "admin", "Super Admin"), visitValidation, visitController_1.default.createVisit);
router.put("/:id", (0, auth_1.authorizeRoles)("doctor", "nurse", "admin", "Super Admin"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID kunjungan tidak valid."), visitController_1.default.updateVisit);
router.patch("/:id/complete", (0, auth_1.authorizeRoles)("doctor", "nurse", "admin", "Super Admin"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID kunjungan tidak valid."), visitController_1.default.completeVisit);
router.patch("/:id/cancel", (0, auth_1.authorizeRoles)("staff", "admin", "Super Admin"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID kunjungan tidak valid."), visitController_1.default.cancelVisit);
router.delete("/:id", (0, auth_1.authorizeRoles)("admin", "Super Admin"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID kunjungan tidak valid."), visitController_1.default.deleteVisit);
// --- Rute Kunjungan yang Difilter ---
router.get("/patient/:patientId", (0, express_validator_1.param)("patientId").isMongoId().withMessage("ID pasien tidak valid."), visitController_1.default.getVisitsByPatient);
router.get("/doctor/:doctorId", (0, express_validator_1.param)("doctorId").isMongoId().withMessage("ID dokter tidak valid."), visitController_1.default.getVisitsByDoctor);
router.get("/date-range/:startDate/:endDate", visitController_1.default.getVisitsByDateRange);
// --- Rute Detail Kunjungan ---
router.put("/:id/medical-record", (0, auth_1.authorizeRoles)("doctor", "nurse"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID kunjungan tidak valid."), visitController_1.default.addMedicalRecord);
router.put("/:id/prescription", (0, auth_1.authorizeRoles)("doctor"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID kunjungan tidak valid."), visitController_1.default.addPrescription);
exports.default = router;
