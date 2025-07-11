"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const polyclinicController_1 = __importDefault(require("../controllers/polyclinicController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Semua rute di bawah ini memerlukan otentikasi
router.use(auth_1.authenticateToken);
// Rute untuk mendapatkan semua poliklinik
router.get("/", polyclinicController_1.default.getAllPolyclinics);
// Rute untuk mendapatkan daftar departemen yang unik
router.get("/departments", polyclinicController_1.default.getDepartments);
// Rute untuk mendapatkan detail satu poliklinik berdasarkan ID
router.get("/:id", polyclinicController_1.default.getPolyclinicById);
// Rute khusus Admin
router.post("/", (0, auth_1.authorizeRoles)("Super Admin", "Admin"), polyclinicController_1.default.createPolyclinic);
router.put("/:id", (0, auth_1.authorizeRoles)("Super Admin", "Admin"), polyclinicController_1.default.updatePolyclinic);
router.delete("/:id", (0, auth_1.authorizeRoles)("Super Admin", "Admin"), polyclinicController_1.default.deletePolyclinic);
exports.default = router;
