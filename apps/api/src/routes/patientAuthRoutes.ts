import express, { type Router } from "express";
import { body } from "express-validator";
import patientAuthController from "../controllers/patientAuthController";

const router: Router = express.Router();

// Aturan Validasi
const registerValidation = [
  body("fullName").trim().isLength({ min: 2 }).withMessage("Nama lengkap minimal 2 karakter"),
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
  body("phone").notEmpty().withMessage("Nomor telepon harus diisi"),
  body("dateOfBirth").isISO8601().toDate().withMessage("Format tanggal lahir tidak valid"),
  body("address").notEmpty().withMessage("Alamat harus diisi"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("password").notEmpty().withMessage("Password harus diisi"),
];

// Rute Publik untuk Pasien
router.post("/register", registerValidation, patientAuthController.register);
router.post("/login", loginValidation, patientAuthController.login);

export default router;