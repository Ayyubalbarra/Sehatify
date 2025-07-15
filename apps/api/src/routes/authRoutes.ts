// apps/api/src/routes/authRoutes.ts

import express, { type Router } from "express";
import { body } from "express-validator";
import userAuthController from "../controllers/userAuthController"; // Impor userAuthController
import patientAuthController from "../controllers/patientAuthController"; // Impor patientAuthController
import { authenticateToken } from "../middleware/auth"; 

const router: Router = express.Router();

// Aturan Validasi Umum
const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
  body("password").notEmpty().withMessage("Password harus diisi"),
];

// Rute Autentikasi untuk Admin/Staf (menggunakan userAuthController)
router.post("/admin/login", loginValidation, userAuthController.login); 
router.post("/admin/demo-login", userAuthController.demoLogin); 

// Rute Autentikasi untuk Pasien (menggunakan patientAuthController)
router.post("/patient/register", 
  [
    body("fullName").trim().isLength({ min: 2 }).withMessage("Nama lengkap minimal 2 karakter"),
    body("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
    body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
    body("phone").trim().isLength({ min: 10 }).withMessage("Nomor telepon minimal 10 digit"),
    body("dateOfBirth").isISO8601().toDate().withMessage("Format tanggal lahir tidak valid (YYYY-MM-DD)"),
    body("address").trim().notEmpty().withMessage("Alamat harus diisi"),
  ],
  patientAuthController.register
);
router.post("/patient/login", loginValidation, patientAuthController.login);
router.post("/patient/demo-login", patientAuthController.demoLogin);

// Rute Terproteksi untuk Admin/Staf
router.use("/admin", authenticateToken); 

router.get("/admin/profile", userAuthController.getProfile);
router.put("/admin/profile", userAuthController.updateProfile);
router.put("/admin/change-password", userAuthController.changePassword);
router.post("/admin/logout", userAuthController.logout);
router.get("/admin/verify-token", userAuthController.verifyToken);

// Rute Terproteksi untuk Pasien 
// Anda bisa membuat middleware autentikasi terpisah untuk pasien jika perlu logik yang berbeda,
// atau gunakan authenticateToken yang sama jika User model dan PatientUser model dapat di-interchange
// atau jika authenticateToken di-desain untuk generik.
// Untuk saat ini, kita akan asumsikan authenticateToken cukup generik.
router.use("/patient", authenticateToken); // Perlu diperhatikan: authenticateToken saat ini mengacu ke User model

router.get("/patient/profile", patientAuthController.getProfile);
router.put("/patient/profile", patientAuthController.updateProfile);
router.put("/patient/change-password", patientAuthController.changePassword);
router.post("/patient/logout", patientAuthController.logout);
router.get("/patient/verify-token", patientAuthController.verifyToken);


export default router;