"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = __importDefault(require("../controllers/authController"));
const auth_1 = require("../middleware/auth"); // Impor middleware yang sudah benar
const router = express_1.default.Router();
// Aturan Validasi
const registerValidation = [
    (0, express_validator_1.body)("name").trim().isLength({ min: 2 }).withMessage("Nama minimal 2 karakter"),
    (0, express_validator_1.body)("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
    (0, express_validator_1.body)("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
];
const loginValidation = [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password harus diisi"),
];
// Rute Publik
router.post("/register", registerValidation, authController_1.default.register);
router.post("/login", loginValidation, authController_1.default.login);
router.post("/demo-login", authController_1.default.demoLogin);
// Rute Terproteksi (semua di bawah ini memerlukan token)
router.use(auth_1.authenticateToken);
router.get("/profile", authController_1.default.getProfile);
router.put("/profile", authController_1.default.updateProfile);
router.put("/change-password", authController_1.default.changePassword);
router.post("/logout", authController_1.default.logout);
router.get("/verify-token", authController_1.default.verifyToken);
exports.default = router;
