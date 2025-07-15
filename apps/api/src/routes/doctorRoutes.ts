// apps/api/src/routes/doctorRoutes.ts

import express, { type Router } from "express";
import { body, param } from "express-validator";
import doctorController from "../controllers/doctorController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

router.use(authenticateToken);

const doctorValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Nama harus antara 2-100 karakter"),
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("phone").matches(/^[0-9+\-\s()]+$/).withMessage("Format nomor telepon tidak valid"),
  body("specialization").trim().isLength({ min: 2, max: 100 }).withMessage("Spesialisasi harus antara 2-100 karakter"),
  body("licenseNumber").trim().isLength({ min: 5, max: 50 }).withMessage("Nomor lisensi harus antara 5-50 karakter"),
  // polyclinicId tidak ada di model User, hapus ini
  // body("polyclinicId").optional().isMongoId().withMessage("ID poliklinik tidak valid"),
];

router.get("/", doctorController.getAllDoctors);
router.get("/stats", doctorController.getDoctorStats);
router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID dokter tidak valid"),
  doctorController.getDoctorById
);
router.post(
  "/",
  authorizeRoles("admin", "Super Admin"),
  doctorValidation,
  doctorController.createDoctor
);
router.put(
  "/:id",
  authorizeRoles("admin", "Super Admin", "doctor"),
  param("id").isMongoId().withMessage("ID dokter tidak valid"),
  doctorController.updateDoctor
);
router.delete(
  "/:id",
  authorizeRoles("admin", "Super Admin"),
  param("id").isMongoId().withMessage("ID dokter tidak valid"),
  doctorController.deleteDoctor
);

router.get(
  "/:id/schedule",
  param("id").isMongoId().withMessage("ID dokter tidak valid"),
  doctorController.getDoctorSchedule
);
router.put(
  "/:id/schedule",
  authorizeRoles("admin", "Super Admin", "doctor"),
  param("id").isMongoId().withMessage("ID dokter tidak valid"),
  doctorController.updateDoctorSchedule
);

export default router;