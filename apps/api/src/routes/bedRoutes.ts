import express, { type Router } from "express";
import { body, param } from "express-validator";
import bedController from "../controllers/bedController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// --- Aturan Validasi ---
const bedValidation = [
  body("bedNumber").trim().notEmpty().withMessage("Nomor tempat tidur wajib diisi"),
  body("roomNumber").trim().notEmpty().withMessage("Nomor ruangan wajib diisi"),
  body("ward").isIn(["ICU", "ICCU", "NICU", "General Ward", "VIP", "Emergency", "Isolation", "Maternity", "Pediatric"]).withMessage("Tipe bangsal tidak valid"),
  body("bedType").isIn(["Standard", "Electric", "ICU", "Pediatric", "Maternity", "VIP"]).withMessage("Tipe tempat tidur tidak valid"),
  body("dailyRate").isNumeric().withMessage("Tarif harian harus berupa angka"),
];

const statusValidation = [
    body("status").isIn(["available", "occupied", "maintenance", "cleaning", "reserved"]).withMessage("Status tidak valid"),
];

// --- Rute API Tempat Tidur (Bed) ---

// GET /api/v1/beds -> Mendapatkan semua tempat tidur
router.get("/", bedController.getAllBeds);

// GET /api/v1/beds/:id -> Mendapatkan detail satu tempat tidur
router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID tempat tidur tidak valid"),
  bedController.getBedById
);

// POST /api/v1/beds -> Membuat tempat tidur baru (admin)
router.post("/", authorizeRoles("admin", "Super Admin"), bedValidation, bedController.createBed);

// PUT /api/v1/beds/:id -> Memperbarui detail tempat tidur
router.put(
  "/:id",
  authorizeRoles("admin", "Super Admin", "nurse"),
  param("id").isMongoId().withMessage("ID tempat tidur tidak valid"),
  bedController.updateBed
);

// DELETE /api/v1/beds/:id -> Menghapus tempat tidur (admin)
router.delete(
  "/:id",
  authorizeRoles("admin", "Super Admin"),
  param("id").isMongoId().withMessage("ID tempat tidur tidak valid"),
  bedController.deleteBed
);

// PUT /api/v1/beds/:id/status -> Memperbarui status
router.put(
  "/:id/status",
  authorizeRoles("admin", "Super Admin", "nurse"),
  param("id").isMongoId().withMessage("ID tempat tidur tidak valid"),
  statusValidation,
  bedController.updateBedStatus
);

// PUT /api/v1/beds/:id/assign -> Menempatkan pasien di tempat tidur
router.put(
  "/:id/assign",
  authorizeRoles("admin", "Super Admin", "nurse"),
  param("id").isMongoId().withMessage("ID tempat tidur tidak valid"),
  body("patientId").isMongoId().withMessage("ID pasien tidak valid"),
  bedController.assignPatientToBed
);

export default router;