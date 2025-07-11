"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const inventoryController_1 = __importDefault(require("../controllers/inventoryController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Semua rute di bawah ini memerlukan otentikasi
router.use(auth_1.authenticateToken);
// --- Aturan Validasi ---
const inventoryValidation = [
    (0, express_validator_1.body)("name").trim().isLength({ min: 2, max: 100 }).withMessage("Nama item harus antara 2-100 karakter"),
    (0, express_validator_1.body)("category").trim().isLength({ min: 2, max: 50 }).withMessage("Kategori harus antara 2-50 karakter"),
    // Perbaikan: kuantitas bisa jadi tidak ada saat create, jadi dibuat opsional
    (0, express_validator_1.body)("quantity").optional().isInt({ min: 0 }).withMessage("Kuantitas harus berupa angka positif"),
    (0, express_validator_1.body)("unit").trim().isLength({ min: 1, max: 20 }).withMessage("Unit harus antara 1-20 karakter"),
    (0, express_validator_1.body)("minStock").isInt({ min: 0 }).withMessage("Stok minimum harus berupa angka positif"),
    (0, express_validator_1.body)("price").isFloat({ min: 0 }).withMessage("Harga harus berupa angka positif"),
];
// --- Rute API Inventaris ---
router.get("/", inventoryController_1.default.getInventoryItems);
router.get("/stats", inventoryController_1.default.getInventoryStats);
router.get("/alerts/low-stock", inventoryController_1.default.getLowStockAlerts);
router.get("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("ID inventory tidak valid"), inventoryController_1.default.getInventoryItemById);
router.post("/", (0, auth_1.authorizeRoles)("admin", "Super Admin", "staff"), inventoryValidation, inventoryController_1.default.createInventoryItem);
router.put("/:id", (0, auth_1.authorizeRoles)("admin", "Super Admin", "staff"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID inventory tidak valid"), inventoryController_1.default.updateInventoryItem);
router.put("/:id/stock", (0, auth_1.authorizeRoles)("admin", "Super Admin", "staff"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID inventory tidak valid"), (0, express_validator_1.body)("quantity").isNumeric().withMessage("Kuantitas harus angka"), (0, express_validator_1.body)("type").isIn(['add', 'subtract']).withMessage("Tipe harus 'add' atau 'subtract'"), inventoryController_1.default.updateStock);
router.delete("/:id", (0, auth_1.authorizeRoles)("admin", "Super Admin"), (0, express_validator_1.param)("id").isMongoId().withMessage("ID inventory tidak valid"), inventoryController_1.default.deleteInventoryItem);
exports.default = router;
