import express, { type Router } from "express";
import { body, param } from "express-validator";
import inventoryController from "../controllers/inventoryController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// --- Aturan Validasi ---
const inventoryValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Nama item harus antara 2-100 karakter"),
  body("category").trim().isLength({ min: 2, max: 50 }).withMessage("Kategori harus antara 2-50 karakter"),
  // Perbaikan: kuantitas bisa jadi tidak ada saat create, jadi dibuat opsional
  body("quantity").optional().isInt({ min: 0 }).withMessage("Kuantitas harus berupa angka positif"),
  body("unit").trim().isLength({ min: 1, max: 20 }).withMessage("Unit harus antara 1-20 karakter"),
  body("minStock").isInt({ min: 0 }).withMessage("Stok minimum harus berupa angka positif"),
  body("price").isFloat({ min: 0 }).withMessage("Harga harus berupa angka positif"),
];

// --- Rute API Inventaris ---

router.get("/", inventoryController.getInventoryItems);
router.get("/stats", inventoryController.getInventoryStats);
router.get("/alerts/low-stock", inventoryController.getLowStockAlerts);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID inventory tidak valid"),
  inventoryController.getInventoryItemById
);

router.post(
  "/",
  authorizeRoles("admin", "Super Admin", "staff"),
  inventoryValidation,
  inventoryController.createInventoryItem
);

router.put(
  "/:id",
  authorizeRoles("admin", "Super Admin", "staff"),
  param("id").isMongoId().withMessage("ID inventory tidak valid"),
  inventoryController.updateInventoryItem
);

router.put(
  "/:id/stock",
  authorizeRoles("admin", "Super Admin", "staff"),
  param("id").isMongoId().withMessage("ID inventory tidak valid"),
  body("quantity").isNumeric().withMessage("Kuantitas harus angka"),
  body("type").isIn(['add', 'subtract']).withMessage("Tipe harus 'add' atau 'subtract'"),
  inventoryController.updateStock
);

router.delete(
  "/:id",
  authorizeRoles("admin", "Super Admin"),
  param("id").isMongoId().withMessage("ID inventory tidak valid"),
  inventoryController.deleteInventoryItem
);

export default router;