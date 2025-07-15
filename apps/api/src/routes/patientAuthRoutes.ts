// apps/api/src/routes/patientAuthRoutes.ts

import express, { type Router } from "express";
import { body } from "express-validator";
import patientAuthController from "../controllers/patientAuthController";
import { authenticateToken } from "../middleware/auth"; // Impor middleware
import { handleValidationErrors } from "../middleware/validation"; // Asumsi ada middleware ini

const router: Router = express.Router();

// Aturan Validasi
const registerValidation = [
  body("fullName").trim().isLength({ min: 2 }).withMessage("Nama lengkap minimal 2 karakter"),
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
  body("phone").trim().isLength({ min: 10 }).withMessage("Nomor telepon minimal 10 digit"),
  body("dateOfBirth").isISO8601().toDate().withMessage("Format tanggal lahir tidak valid (YYYY-MM-DD)"),
  body("address").trim().notEmpty().withMessage("Alamat harus diisi"),
  handleValidationErrors
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("password").notEmpty().withMessage("Password harus diisi"),
  handleValidationErrors
];

// ====================================================================
// Rute Publik Pasien (TIDAK memerlukan token)
// Rute ini harus diletakkan SEBELUM router.use(authenticateToken)
router.post("/register", registerValidation, patientAuthController.register);
router.post("/login", loginValidation, patientAuthController.login);
router.post("/demo-login", patientAuthController.demoLogin);

// ====================================================================
// Rute Terproteksi Pasien (MEMERLUKAN token)
// Middleware authenticateToken diterapkan HANYA untuk rute-rute di bawah ini
router.use(authenticateToken); 

router.get("/profile", patientAuthController.getProfile);
router.put("/profile", patientAuthController.updateProfile);
router.put("/change-password", patientAuthController.changePassword); // Sudah diperbaiki
router.post("/logout", patientAuthController.logout);
router.get("/verify-token", patientAuthController.verifyToken);

export default router;