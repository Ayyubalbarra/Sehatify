import express, { type Router } from "express";
import { body } from "express-validator";
import authController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth"; // Impor middleware yang sudah benar

const router: Router = express.Router();

// Aturan Validasi
const registerValidation = [
  body("name").trim().isLength({ min: 2 }).withMessage("Nama minimal 2 karakter"),
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("password").notEmpty().withMessage("Password harus diisi"),
];

// Rute Publik
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post("/demo-login", authController.demoLogin);

// Rute Terproteksi (semua di bawah ini memerlukan token)
router.use(authenticateToken);

router.get("/profile", authController.getProfile);
router.put("/profile", authController.updateProfile);
router.put("/change-password", authController.changePassword);
router.post("/logout", authController.logout);
router.get("/verify-token", authController.verifyToken);

export default router;