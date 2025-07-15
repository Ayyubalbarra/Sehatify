// apps/api/src/routes/patientAuthRoutes.ts

import express, { type Router } from "express";
import { body } from "express-validator";
import patientAuthController from "../controllers/patientAuthController";
import { authenticateToken } from "../middleware/auth"; 
import { handleValidationErrors } from "../middleware/validation"; // Asumsi ada middleware ini

const router: Router = express.Router();

// Aturan Validasi (pastikan ini sesuai dengan PatientUser.model)
const registerValidation = [
  body("fullName").trim().isLength({ min: 2 }).withMessage("Nama lengkap minimal 2 karakter"),
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
  body("phone").trim().isLength({ min: 10 }).withMessage("Nomor telepon minimal 10 digit"),
  body("dateOfBirth").isISO8601().toDate().withMessage("Format tanggal lahir tidak valid (YYYY-MM-DD)"),
  body("address").trim().notEmpty().withMessage("Alamat harus diisi"),
  handleValidationErrors // Tambahkan handleValidationErrors
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("password").notEmpty().withMessage("Password harus diisi"),
  handleValidationErrors // Tambahkan handleValidationErrors
];

// Rute Publik (TIDAK memerlukan token)
router.post("/register", registerValidation, patientAuthController.register);
router.post("/login", loginValidation, patientAuthController.login);
router.post("/demo-login", patientAuthController.demoLogin);

// ====================================================================
// Rute Terproteksi (MEMERLUKAN token)
// Middleware authenticateToken diterapkan HANYA untuk rute-rute di bawah ini
router.use(authenticateToken); 

router.get("/profile", patientAuthController.getProfile);
router.put("/profile", patientAuthController.updateProfile);
router.put("/change-password", patientAuthController.changePassword);
router.post("/logout", patientAuthController.logout);
router.get("/verify-token", patientAuthController.verifyToken);

export default router;