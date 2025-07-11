import express, { type Router } from "express";
import { body, param } from "express-validator";
import doctorController from "../controllers/doctorController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// --- Aturan Validasi ---
const doctorValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Nama harus antara 2-100 karakter"),
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("phone").matches(/^[0-9+\-\s()]+$/).withMessage("Format nomor telepon tidak valid"),
  body("specialization").trim().isLength({ min: 2, max: 100 }).withMessage("Spesialisasi harus antara 2-100 karakter"),
  body("licenseNumber").trim().isLength({ min: 5, max: 50 }).withMessage("Nomor lisensi harus antara 5-50 karakter"),
  body("polyclinicId").optional().isMongoId().withMessage("ID poliklinik tidak valid"),
];

// --- Rute API Dokter ---

// GET /api/v1/doctors -> Mendapatkan semua dokter
router.get("/", doctorController.getAllDoctors);

// GET /api/v1/doctors/stats -> Mendapatkan statistik dokter
router.get("/stats", doctorController.getDoctorStats);

// GET /api/v1/doctors/:id -> Mendapatkan detail satu dokter
router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID dokter tidak valid"),
  doctorController.getDoctorById
);

// POST /api/v1/doctors -> Membuat dokter baru (hanya admin)
router.post(
  "/",
  authorizeRoles("admin", "Super Admin"),
  doctorValidation,
  doctorController.createDoctor
);

// PUT /api/v1/doctors/:id -> Memperbarui data dokter
router.put(
  "/:id",
  authorizeRoles("admin", "Super Admin", "doctor"),
  param("id").isMongoId().withMessage("ID dokter tidak valid"),
  doctorController.updateDoctor
);

// DELETE /api/v1/doctors/:id -> Menonaktifkan dokter (hanya admin)
router.delete(
  "/:id",
  authorizeRoles("admin", "Super Admin"),
  param("id").isMongoId().withMessage("ID dokter tidak valid"),
  doctorController.deleteDoctor
);

// --- Rute Terkait Jadwal Dokter ---

// GET /api/v1/doctors/:id/schedule -> Mendapatkan jadwal kerja dokter
router.get(
  "/:id/schedule",
  param("id").isMongoId().withMessage("ID dokter tidak valid"),
  doctorController.getDoctorSchedule
);

// PUT /api/v1/doctors/:id/schedule -> Memperbarui jadwal kerja dokter
router.put(
  "/:id/schedule",
  authorizeRoles("admin", "Super Admin", "doctor"),
  param("id").isMongoId().withMessage("ID dokter tidak valid"),
  doctorController.updateDoctorSchedule
);

export default router;