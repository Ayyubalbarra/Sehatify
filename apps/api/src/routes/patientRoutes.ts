// apps/api/src/routes/patientRoutes.ts

import express, { Router } from "express";
import { body, param } from "express-validator";
import patientController from "../controllers/patientController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { handleValidationErrors } from "../middleware/validation";

const router: Router = express.Router();

router.use(authenticateToken);

// --- Rute Baru untuk Pasien yang Login ---
router.get("/me/appointments", patientController.getUpcomingAppointments);
router.get("/me/records", patientController.getMedicalRecords);


// --- Rute untuk Admin ---
const patientValidation = [
  body("fullName").trim().isLength({ min: 2 }).withMessage("Nama lengkap minimal 2 karakter"),
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("phone").trim().isLength({ min: 10 }).withMessage("Nomor telepon minimal 10 digit"),
  body("dateOfBirth").isISO8601().toDate().withMessage("Format tanggal lahir tidak valid"),
  handleValidationErrors
];

router.get("/", authorizeRoles("admin", "Super Admin"), patientController.getPatients);
router.get("/stats", authorizeRoles("admin", "Super Admin"), patientController.getPatientStats);
router.get(
  "/:patientId", 
  param("patientId").isMongoId().withMessage("ID Pasien tidak valid"), 
  authorizeRoles("admin", "Super Admin"), 
  patientController.getPatient
);
router.post("/", authorizeRoles("admin", "Super Admin"), patientValidation, patientController.createPatient);
router.put(
  "/:patientId", 
  param("patientId").isMongoId().withMessage("ID Pasien tidak valid"),
  authorizeRoles("admin", "Super Admin"), 
  patientController.updatePatient
);
router.delete(
  "/:patientId", 
  param("patientId").isMongoId().withMessage("ID Pasien tidak valid"),
  authorizeRoles("admin", "Super Admin"), 
  patientController.deletePatient
);

export default router;