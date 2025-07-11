import express, { type Router } from "express";
import { body, param } from "express-validator";
import visitController from "../controllers/visitController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// Aturan validasi untuk membuat kunjungan
const visitValidation = [
  body("patientId").isMongoId().withMessage("ID pasien tidak valid."),
  body("doctorId").isMongoId().withMessage("ID dokter tidak valid."),
  body("polyclinicId").isMongoId().withMessage("ID poliklinik tidak valid."),
  body("visitDate").isISO8601().withMessage("Format tanggal kunjungan tidak valid (YYYY-MM-DD)."),
  body("visitType")
    .isIn(["Consultation", "Follow-up", "Emergency", "Check-up", "Treatment"])
    .withMessage("Tipe kunjungan tidak valid."),
  body("chiefComplaint").trim().isLength({ min: 5, max: 500 }).withMessage("Keluhan utama harus antara 5-500 karakter."),
];

// --- Rute Kunjungan ---

router.get("/", visitController.getAllVisits);
router.get("/stats", visitController.getVisitStats);
router.get("/:id", param("id").isMongoId().withMessage("ID kunjungan tidak valid."), visitController.getVisitById);

router.post("/", authorizeRoles("staff", "admin", "Super Admin"), visitValidation, visitController.createVisit);

router.put(
  "/:id",
  authorizeRoles("doctor", "nurse", "admin", "Super Admin"),
  param("id").isMongoId().withMessage("ID kunjungan tidak valid."),
  visitController.updateVisit,
);

router.patch(
    "/:id/complete",
    authorizeRoles("doctor", "nurse", "admin", "Super Admin"),
    param("id").isMongoId().withMessage("ID kunjungan tidak valid."),
    visitController.completeVisit
);

router.patch(
    "/:id/cancel",
    authorizeRoles("staff", "admin", "Super Admin"),
    param("id").isMongoId().withMessage("ID kunjungan tidak valid."),
    visitController.cancelVisit
);

router.delete(
  "/:id",
  authorizeRoles("admin", "Super Admin"),
  param("id").isMongoId().withMessage("ID kunjungan tidak valid."),
  visitController.deleteVisit,
);

// --- Rute Kunjungan yang Difilter ---

router.get("/patient/:patientId", param("patientId").isMongoId().withMessage("ID pasien tidak valid."), visitController.getVisitsByPatient);
router.get("/doctor/:doctorId", param("doctorId").isMongoId().withMessage("ID dokter tidak valid."), visitController.getVisitsByDoctor);
router.get("/date-range/:startDate/:endDate", visitController.getVisitsByDateRange);

// --- Rute Detail Kunjungan ---

router.put(
  "/:id/medical-record",
  authorizeRoles("doctor", "nurse"),
  param("id").isMongoId().withMessage("ID kunjungan tidak valid."),
  visitController.addMedicalRecord,
);

router.put(
  "/:id/prescription",
  authorizeRoles("doctor"),
  param("id").isMongoId().withMessage("ID kunjungan tidak valid."),
  visitController.addPrescription,
);

export default router;