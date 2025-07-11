import express, { Router } from "express";
import { body, param } from "express-validator";
import patientController from "../controllers/patientController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { handleValidationErrors } from "../middleware/validation";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// --- Aturan Validasi ---
const patientValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Nama harus antara 2-100 karakter"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("phone").matches(/^[0-9+\-\s()]+$/).withMessage("Format nomor telepon tidak valid"),
  body("dateOfBirth").isISO8601().withMessage("Format tanggal lahir tidak valid (YYYY-MM-DD)"),
  body("gender").isIn(["Laki-laki", "Perempuan"]).withMessage("Gender harus Laki-laki atau Perempuan"),
  body("address").optional().trim().isLength({ max: 500 }).withMessage("Alamat maksimal 500 karakter"),
  body("nik").isLength({ min: 16, max: 16 }).withMessage("NIK harus 16 digit"),
  handleValidationErrors
];

const updatePatientValidation = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("phone").optional().matches(/^[0-9+\-\s()]+$/),
  handleValidationErrors
];

// --- Rute API Pasien ---

// GET /api/patients -> Mendapatkan semua pasien (dengan filter & pencarian via query string, misal: /api/patients?search=budi)
router.get("/", patientController.getPatients);

// GET /api/patients/stats -> Mendapatkan statistik pasien
router.get("/stats", patientController.getPatientStats);

// GET /api/patients/:id -> Mendapatkan detail satu pasien (termasuk riwayat)
router.get(
  "/:patientId",
  param("patientId").isMongoId().withMessage("ID Pasien tidak valid"),
  patientController.getPatient
);

// POST /api/patients -> Membuat pasien baru
router.post("/", patientValidation, patientController.createPatient);

// PUT /api/patients/:id -> Memperbarui data pasien
router.put(
  "/:patientId",
  param("patientId").isMongoId().withMessage("ID Pasien tidak valid"),
  updatePatientValidation,
  patientController.updatePatient
);

// DELETE /api/patients/:id -> Menghapus pasien (hanya admin)
router.delete(
  "/:patientId",
  authorizeRoles("admin", "Super Admin"),
  param("patientId").isMongoId().withMessage("ID Pasien tidak valid"),
  patientController.deletePatient
);

export default router;
