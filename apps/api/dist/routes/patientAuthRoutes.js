"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const patientAuthController_1 = __importDefault(require("../controllers/patientAuthController"));
const router = express_1.default.Router();
// Aturan Validasi
const registerValidation = [
    (0, express_validator_1.body)("fullName").trim().isLength({ min: 2 }).withMessage("Nama lengkap minimal 2 karakter"),
    (0, express_validator_1.body)("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
    (0, express_validator_1.body)("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
    (0, express_validator_1.body)("phone").notEmpty().withMessage("Nomor telepon harus diisi"),
    (0, express_validator_1.body)("dateOfBirth").isISO8601().toDate().withMessage("Format tanggal lahir tidak valid"),
    (0, express_validator_1.body)("address").notEmpty().withMessage("Alamat harus diisi"),
];
const loginValidation = [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail().withMessage("Format email tidak valid"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password harus diisi"),
];
// Rute Publik untuk Pasien
router.post("/register", registerValidation, patientAuthController_1.default.register);
router.post("/login", loginValidation, patientAuthController_1.default.login);
exports.default = router;
